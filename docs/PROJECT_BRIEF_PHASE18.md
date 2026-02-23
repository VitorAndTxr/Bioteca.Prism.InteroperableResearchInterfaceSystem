# Project Brief: Sync Refactoring — Backend-to-Backend Orchestration

**Date**: 2026-02-22
**Author**: PM (Product Manager)
**Status**: DRAFT
**Phase**: 18

---

## 1. Business Objectives

| # | Objective | Success Criteria | Priority |
|---|-----------|-----------------|----------|
| 1 | Move sync orchestration from UI/middleware to backend | Local backend fetches all entity data from remote node directly, without the desktop app acting as intermediary | Must |
| 2 | Simplify the desktop UI to a trigger-and-monitor role | The UI only calls `POST /api/sync/pull`, then polls or receives progress updates until completion | Must |
| 3 | Preserve existing transactional guarantees | All-or-nothing import behavior, "newer wins" conflict resolution, and SyncLog tracking remain intact | Must |
| 4 | Maintain backward compatibility of export endpoints | Remote nodes continue to serve data through the same `/api/sync/*` export endpoints — no breaking changes | Must |

---

## 2. Background

### Why the Current Architecture is Wrong

Phase 17 implemented node-to-node sync with the desktop UI as the orchestration layer. The current flow works like this:

1. **Desktop UI** creates a `ResearchNodeMiddleware` instance targeting the remote node's URL.
2. **Desktop UI** performs the 4-phase handshake against the remote node (via `NodeSyncServiceAdapter.preview()`).
3. **Desktop UI** fetches the manifest, then all entity pages (SNOMED, volunteers, research, sessions, recordings) from the remote node.
4. **Desktop UI** submits the collected payload to the local backend via `POST /api/sync/import`.

This approach has several architectural problems:

**Violates data sovereignty.** The PRISM model designates the Research Node as the data custodian. When the UI acts as a middleman, sensitive biomedical data (volunteer PII, clinical records) transits through the application layer unnecessarily. Backend-to-backend transfer keeps data within the node trust boundary.

**Exposes sync internals to the client.** The desktop app currently knows the sync entity order, pagination logic, SNOMED sub-types, and recording file extraction. This is backend business logic that has no place in a UI layer.

**Fragile under network conditions.** If the desktop app loses connectivity mid-sync, the partially collected payload is lost. The backend cannot resume because it never knew the sync was happening. A backend-driven sync can implement retry and resume strategies.

**Duplicates handshake infrastructure.** The `NodeSyncServiceAdapter` creates a second `ResearchNodeMiddleware` instance with its own `ChannelManager`, `SessionManager`, and crypto driver — duplicating the handshake that `INodeChannelClient` already implements server-side.

**Blocks future automation.** Scheduled sync, webhook-triggered sync, or admin-API-triggered sync all require backend orchestration. The current UI-mediated design cannot support these use cases.

### Correct Architecture

The local backend should own the entire sync lifecycle:

```
Desktop UI                       Local Backend                    Remote Backend
    |                                |                                |
    |  POST /api/sync/pull           |                                |
    |  { remoteNodeId, since? }      |                                |
    |------------------------------->|                                |
    |                                |  INodeChannelClient            |
    |                                |  OpenChannel + Handshake       |
    |                                |------------------------------->|
    |                                |  POST /api/sync/manifest       |
    |                                |------------------------------->|
    |                                |  GET /api/sync/snomed/*        |
    |                                |------------------------------->|
    |                                |  GET /api/sync/volunteers      |
    |                                |------------------------------->|
    |                                |  GET /api/sync/research        |
    |                                |------------------------------->|
    |                                |  GET /api/sync/sessions        |
    |                                |------------------------------->|
    |                                |  GET /api/sync/recordings/*    |
    |                                |------------------------------->|
    |                                |                                |
    |                                |  SyncImportService.ImportAsync |
    |                                |  (transactional upsert)        |
    |                                |                                |
    |  200 OK { SyncResult }         |                                |
    |<-------------------------------|                                |
```

---

## 3. Scope

### 3.1 In Scope

**Backend — New `SyncPullService`** (`Bioteca.Prism.Service`):

A new service that orchestrates the entire pull-sync flow server-side. It replaces the logic currently in `NodeSyncService.ts` (middleware) and `NodeSyncServiceAdapter.ts` (desktop).

| Responsibility | Details |
|---------------|---------|
| Resolve remote node URL | Look up the remote node's URL from the node registry using `remoteNodeId` |
| Establish encrypted channel | Use `INodeChannelClient.OpenChannelAsync()` to perform the 4-phase handshake against the remote node |
| Fetch manifest | Call `POST /api/sync/manifest` via `INodeChannelClient.InvokeAsync<SyncManifestResponse>()` |
| Fetch entities | Call each export endpoint in dependency order (SNOMED -> Volunteers -> Research -> Sessions), handling pagination |
| Fetch recording files | Call `GET /api/sync/recordings/{id}/file` for each recording channel with a file URL |
| Build import payload | Assemble the collected data into a `SyncImportPayload` |
| Execute import | Call `SyncImportService.ImportAsync()` directly (same-process, no HTTP round-trip) |
| Close channel | Call `INodeChannelClient.CloseChannelAsync()` |
| Return result | Return `SyncResultDTO` to the caller |

**Backend — New `POST /api/sync/pull` Endpoint** (`SyncController`):

A new endpoint on `SyncController` that triggers the backend-orchestrated sync.

```
POST /api/sync/pull
Authorization: Bearer {user_jwt}  (user auth, not node session)
Content-Type: application/json

{
    "remoteNodeId": "guid",
    "since": "2026-02-18T00:00:00Z"  // optional, for incremental sync
}
```

Response:
```json
{
    "status": "completed",
    "startedAt": "...",
    "completedAt": "...",
    "entitiesReceived": { "snomed": 42, "volunteers": 10, ... }
}
```

This endpoint uses **user authentication** (`[Authorize]` with JWT), not node session authentication. The node-to-node handshake happens internally via `INodeChannelClient`. The user only needs to be an authenticated researcher with sufficient permissions.

**Backend — `INodeChannelClient` Full Handshake Orchestration**:

`INodeChannelClient` already has `OpenChannelAsync`, `IdentifyNodeAsync`, `RequestChallengeAsync`, `AuthenticateAsync`, and `InvokeAsync<T>`. The `SyncPullService` must call these in sequence (Phases 1-4) before invoking sync export endpoints. Verify that the existing implementation supports this full flow and that the channel/session state is properly managed.

**Backend — Remote Node URL Resolution**:

`SyncPullService` needs to resolve a `remoteNodeId` (Guid) to the remote node's base URL. This may require extending `INodeRepository` or the node registration data to store the remote node's URL. Currently, `NodeChannelClient.OpenChannelAsync()` takes a `remoteNodeUrl` string — we need a way to look this up from the registry.

**Middleware — Simplify or Remove `NodeSyncService`**:

The middleware `NodeSyncService` class becomes unnecessary since the backend now orchestrates the sync. It should either be removed or reduced to a thin wrapper that calls `POST /api/sync/pull` on the local backend.

**Desktop — Simplify `NodeSyncServiceAdapter`**:

Replace the current complex logic (creating remote middleware, performing handshake in the UI layer) with a single call to `POST /api/sync/pull` on the local backend. The adapter should:

1. Call `POST /api/sync/pull` with `{ remoteNodeId, since }`.
2. Wait for the response (or poll a status endpoint for long-running syncs).
3. Return the `SyncResult` to the UI.

**Desktop — Update `SyncProgressModal`**:

Update the modal to work with the simplified adapter. The confirmation flow changes:

- **Before**: UI fetches manifest from remote node, shows preview, then calls `proceed()` which orchestrates the full pull.
- **After**: UI calls `POST /api/sync/pull` on the local backend. The backend fetches the manifest internally. For Phase 18, the modal transitions directly to an in-progress state and waits for completion. Manifest preview can be added via a separate `POST /api/sync/preview` endpoint if desired.

### 3.2 Out of Scope

- **Export endpoint changes** — The existing `GET /api/sync/snomed/*`, `GET /api/sync/volunteers`, etc. remain unchanged. They are already correct (they serve data to authenticated remote nodes).
- **Import service changes** — `SyncImportService` already handles transactional upsert with "newer wins" conflict resolution. No changes needed.
- **SyncLog schema changes** — The existing `sync_logs` table is sufficient.
- **SyncProgressModal UX redesign** — The modal's visual design and state machine remain the same; only the data source changes.
- **Bidirectional sync** — Still one-way pull only.
- **SSE/WebSocket progress streaming** — Phase 18 uses a synchronous request-response model. Real-time progress streaming can be added in a future phase.
- **Mobile app** — Mobile sync is unrelated to this refactoring.

---

## 4. Requirements

### Functional Requirements

| # | Requirement | Details |
|---|-------------|---------|
| FR-1 | `POST /api/sync/pull` triggers a complete sync | Given an authenticated user and a valid `remoteNodeId`, the backend performs the full 4-phase handshake, fetches all entities, and imports them transactionally |
| FR-2 | Incremental sync via `since` parameter | When `since` is provided, only records with `UpdatedAt > since` are fetched from the remote node |
| FR-3 | Automatic `since` resolution from SyncLog | When `since` is omitted, the backend looks up the last successful sync's `lastSyncedAt` from `sync_logs` for the given `remoteNodeId` and uses it automatically |
| FR-4 | Remote node URL resolution | The backend resolves the remote node's base URL from the node registry using the `remoteNodeId` |
| FR-5 | Proper channel cleanup | The encrypted channel is closed after sync completes (success or failure) |
| FR-6 | Error propagation | If the handshake fails, the remote node is unreachable, or the import fails, the endpoint returns a meaningful error with the failure stage |
| FR-7 | SyncLog entry created | A `sync_logs` row is created for every pull attempt, tracking status, timing, and entity counts |
| FR-8 | Desktop UI triggers sync via local backend | The desktop app no longer creates remote middleware instances or performs handshakes — it calls the local backend only |

### Non-Functional Requirements

| # | Requirement | Details |
|---|-------------|---------|
| NFR-1 | Sync timeout | The pull endpoint should support long-running requests (up to 5 minutes, matching `HttpClient.TimeoutSeconds: 300`) |
| NFR-2 | Memory efficiency | Entities are fetched page-by-page and passed to the import service incrementally where possible, avoiding loading the entire dataset into memory |
| NFR-3 | Idempotency | Calling `POST /api/sync/pull` twice with the same parameters produces the same result (no duplicates, no errors) |

---

## 5. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | `INodeChannelClient` may not support the full handshake flow end-to-end in a single service call | Med | High | Verify that `OpenChannelAsync` + `IdentifyNodeAsync` + `RequestChallengeAsync` + `AuthenticateAsync` + `InvokeAsync<T>` chain works correctly. Write an integration test for the full flow. |
| 2 | Remote node URL not stored in the node registry | Med | Med | Check `NodeRegistration` entity for a URL field. If missing, add a migration to store the remote node's base URL during Phase 2 identification. |
| 3 | Long-running sync triggers HTTP timeout on the desktop-to-local-backend call | Med | Med | Configure the endpoint with a generous timeout. For very large datasets, consider returning a `202 Accepted` with a job ID and a polling endpoint (`GET /api/sync/status/{jobId}`). |
| 4 | `SyncPullService` needs both scoped services (DbContext, repositories) and singleton services (`INodeChannelClient`) | Low | Med | Register `SyncPullService` as scoped. Inject `INodeChannelClient` (singleton) normally — ASP.NET Core allows singletons in scoped services. |
| 5 | Removing middleware `NodeSyncService` breaks other consumers | Low | Low | Verify that only `NodeSyncServiceAdapter` uses `NodeSyncService`. If no other consumers exist, remove it. Otherwise, deprecate and keep. |
| 6 | Progress reporting gap — the UI cannot show per-entity progress during sync | Med | Low | Phase 18 accepts this limitation. The UI shows a spinner with "Syncing..." and the final result. Future phases can add SSE or polling for granular progress. |

---

## 6. Success Criteria

1. **Backend-driven sync works end-to-end**: Calling `POST /api/sync/pull { remoteNodeId }` against a local node successfully fetches data from a remote node and imports it transactionally.

2. **Desktop UI simplified**: `NodeSyncServiceAdapter` no longer creates `ResearchNodeMiddleware`, `ChannelManager`, `SessionManager`, or `WebCryptoDriver` instances. It makes a single HTTP call to the local backend.

3. **Middleware `NodeSyncService` removed or deprecated**: The orchestration logic no longer lives in the middleware package.

4. **All existing tests pass**: The 73/75 passing tests remain green. The 19 Phase 17 sync tests continue to pass.

5. **Docker multi-node test**: `test-phase4.sh` extended or a new `test-sync-pull.sh` demonstrates the backend-to-backend sync between NodeA and NodeB.

6. **No regression in export endpoints**: Remote nodes can still serve sync data to any authenticated caller (the export side is unchanged).

7. **Incremental sync still works**: The second sync with no changes transfers zero records.

---

## 7. Effort Estimation

| Component | Effort | Rationale |
|-----------|--------|-----------|
| Backend `SyncPullService` (new) | L | Full handshake orchestration + paginated fetch + import delegation. Core of this refactoring. |
| Backend `POST /api/sync/pull` endpoint | S | Simple controller action that delegates to `SyncPullService` |
| Backend remote node URL resolution | S-M | May require a migration if the URL is not already stored in the node registry |
| Backend integration test | M | End-to-end test with two nodes in Docker |
| Middleware `NodeSyncService` removal | S | Delete the class and update exports |
| Desktop `NodeSyncServiceAdapter` simplification | S | Replace complex logic with single HTTP call |
| Desktop `SyncProgressModal` update | S | Adapt to new simplified flow (remove manifest preview step or add preview endpoint) |
| Domain types cleanup | XS | Remove unused types or add new `SyncPullRequest`/`SyncPullResponse` |
| **Total** | **L** | Estimated 2-3 development cycles |

---

## 8. Key Files

### Backend (ASP.NET Core 8.0, C#)

| File | Role | Change |
|------|------|--------|
| `Bioteca.Prism.Service/Services/Sync/SyncExportService.cs` | Export service | No change |
| `Bioteca.Prism.Service/Services/Sync/SyncImportService.cs` | Import service | No change |
| `Bioteca.Prism.InteroperableResearchNode/Controllers/SyncController.cs` | Sync endpoints | Add `POST /api/sync/pull` |
| `Bioteca.Prism.Core/Middleware/Node/INodeChannelClient.cs` | Node HTTP client | Verify full handshake support |
| `Bioteca.Prism.Service/Services/Sync/SyncPullService.cs` | **NEW** — Pull orchestrator | Full implementation |
| `Bioteca.Prism.Service/Interfaces/Sync/ISyncPullService.cs` | **NEW** — Interface | Interface definition |

### Middleware/UI (TypeScript)

| File | Role | Change |
|------|------|--------|
| `IRIS/packages/middleware/src/sync/NodeSyncService.ts` | Sync orchestration | Remove or deprecate |
| `IRIS/apps/desktop/src/services/NodeSyncServiceAdapter.ts` | Desktop adapter | Simplify to single HTTP call |
| `IRIS/apps/desktop/src/screens/NodeConnections/SyncProgressModal.tsx` | Sync UI modal | Adapt to new flow |
| `IRIS/packages/domain/src/models/NodeSync.ts` | Shared types | Add `SyncPullRequest` if needed |

---

## Technical Risk Assessment

> To be added by Tech Lead (`/tl plan`).

## Specialist Notes

> To be added by Dev Specialist (`/dev plan`) and QA Specialist (`/qa plan`).
