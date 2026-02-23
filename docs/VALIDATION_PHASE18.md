# Validation Document: Phase 18 — Backend-to-Backend Sync Orchestration

**Date**: 2026-02-22
**Author**: PM (Product Manager)
**Status**: APPROVED
**Phase**: 18

---

## Business Validation

### Objective 1: Move sync orchestration from UI/middleware to backend

**[PASS]**

The architecture introduces `SyncPullService` (Section 3.2) as a new backend service that owns the entire sync lifecycle: remote node URL resolution, 4-phase handshake via `INodeChannelClient`, paginated entity fetch, and transactional import via `SyncImportService`. The sequence diagram in Section 1 clearly shows the local backend performing all handshake phases and entity fetching directly against the remote backend, with the desktop UI only issuing `POST /api/sync/preview` and `POST /api/sync/pull`. The internal flow (Section 4.2) explicitly replaces the logic previously in `NodeSyncService.ts` (middleware) and `NodeSyncServiceAdapter.ts` (desktop). Section 7.3 confirms `NodeSyncService` is deleted entirely from `@iris/middleware`.

### Objective 2: Simplify the desktop UI to a trigger-and-monitor role

**[PASS]**

Section 7.1 shows the new `NodeSyncServiceAdapter` reduced to two thin methods (`preview()` and `pull()`) that each make a single `middleware.invoke()` call to the local backend. All removed imports are explicitly listed: `ChannelManager`, `SessionManager`, `WebCryptoDriver`, `FetchHttpClient`, `NodeSyncService`. Section 7.2 confirms the `SyncProgressModal` state machine retains the same phases (Open, Confirmation, In Progress, Success, Error) but sources data from the local backend endpoints instead of performing remote orchestration. The UI no longer touches handshake logic, entity pagination, or SNOMED sub-type ordering.

### Objective 3: Preserve existing transactional guarantees

**[PASS]**

The architecture explicitly states that `SyncImportService` is unchanged (Section 2, Tech Stack table; Section 12, Unchanged Files). The pull flow (Section 5.2, step g) calls `SyncImportService.ImportAsync(payload, remoteNodeId)` with "Transactional upsert (all-or-nothing)" noted inline. SyncLog tracking is preserved per Section 8.2, with status tracking for all scenarios (handshake failure, fetch failure, import rollback, success). The "newer wins" conflict resolution is not modified since it lives inside `SyncImportService` which is unchanged.

### Objective 4: Maintain backward compatibility of export endpoints

**[PASS]**

Section 3 (Out of Scope in the brief) and the architecture's Section 12 (Unchanged Files) both confirm that `SyncController.cs`, `SyncExportService.cs`, and all `GET /api/sync/*` export endpoints remain untouched. The new endpoints (`preview` and `pull`) are placed on a separate `SyncPullController` (Section 4.4) with user JWT authentication, avoiding any interference with the existing node-session-authenticated export controller. The architecture explicitly chose Option A (separate controller) over Option B (attribute override) to guarantee zero impact on the existing `SyncController`.

---

## Functional Requirements Coverage

| FR | Requirement | Covered | Architecture Reference |
|----|-------------|---------|----------------------|
| FR-1 | `POST /api/sync/pull` triggers complete sync | Yes | Section 5.2 (Pull Flow), Section 6.2 (API Contract) |
| FR-2 | Incremental sync via `since` parameter | Yes | Section 6.1/6.2 (`since` in request body), Section 5.2 step e (pagination with `since`) |
| FR-3 | Automatic `since` resolution from SyncLog | Yes | Section 5.1 step b, Section 5.2 step b (`ISyncLogRepository.GetLatestCompletedAsync()`), `SyncPreviewResponse.AutoResolvedSince` DTO |
| FR-4 | Remote node URL resolution | Yes | Section 4.2 step 1 (`INodeRepository` by Id, Status=Authorized), Section 10.4 confirms `NodeUrl` property already exists |
| FR-5 | Proper channel cleanup | Yes | Section 8.3 (try/finally with `CloseChannelAsync`), Section 5.2 step h |
| FR-6 | Error propagation with failure stage | Yes | Section 8.1 (failure graph with 6 error codes), Section 8.4 (error envelope with `stage` field) |
| FR-7 | SyncLog entry created | Yes | Section 8.2 (SyncLog status tracking table for all scenarios) |
| FR-8 | Desktop UI triggers sync via local backend only | Yes | Section 7.1 (simplified adapter), Section 7.3 (NodeSyncService removal) |

All 8 functional requirements are fully addressed.

---

## Non-Functional Requirements Coverage

| NFR | Requirement | Covered | Architecture Reference |
|-----|-------------|---------|----------------------|
| NFR-1 | Sync timeout (5 min) | Yes | Section 10.2 (HttpClient.TimeoutSeconds=300, matching desktop FetchHttpClient) |
| NFR-2 | Memory efficiency (page-by-page) | Yes | Section 5.3 (pagination loop, page=1..totalPages, pageSize=100) |
| NFR-3 | Idempotency | Yes | Inherited from unchanged `SyncImportService` ("newer wins" upsert is inherently idempotent) |

All 3 non-functional requirements are addressed.

---

## Risk Coverage

| Brief Risk | Architecture Mitigation | Adequate |
|-----------|------------------------|----------|
| R1: INodeChannelClient full chain untested | Section 10.1: Integration test (US-1808) ordered before frontend work. Challenge signing mechanism identified. | Yes |
| R2: Remote node URL not stored | Section 10.4: Confirmed `ResearchNode.NodeUrl` exists. No migration needed. | Yes |
| R3: HTTP timeout on long sync | Section 10.2: 300s timeout configured. Future 202+polling noted. | Yes |
| R4: Scoped/singleton DI conflict | Section 10.3: ASP.NET Core supports singleton in scoped. Standard pattern. | Yes |
| R5: Removing NodeSyncService breaks consumers | Section 7.3: Only `NodeSyncServiceAdapter` consumes it. Confirmed safe to delete. | Yes |
| R6: No per-entity progress reporting | Section 7.2: Accepted limitation. Spinner with "Syncing..." text. Future SSE noted. | Yes |

All 6 risks from the brief are addressed with concrete mitigations.

---

## Additional Observations

**Security enhancement**: The architecture introduces a dual-authentication model (Section 9.1) where user JWT protects the trigger endpoint while the 4-phase handshake secures node-to-node communication. This is a net improvement over Phase 17 where the UI held both authentication contexts. Section 9.2 confirms biomedical data never transits through the UI layer.

**Implementation ordering**: The dependency graph (Section 11) is well-structured with URL resolution first, then core service, then endpoints in parallel, then integration tests before frontend changes, and finally cleanup. This minimizes rework risk.

**Preview endpoint**: The architecture adds a `POST /api/sync/preview` endpoint that was listed as optional in the brief ("Manifest preview can be added via a separate POST /api/sync/preview endpoint if desired"). Including it preserves the user confirmation UX from Phase 17 without requiring the UI to perform remote calls.

---

## Final Verdict

The architecture document comprehensively addresses all 4 business objectives, all 8 functional requirements, all 3 non-functional requirements, and all 6 identified risks from the project brief. The design correctly eliminates the UI as sync middleman, preserves transactional guarantees by reusing `SyncImportService` unchanged, maintains backward compatibility by isolating new endpoints in a separate controller, and introduces a clean dual-authentication model. No gaps or contradictions found.

**[VERDICT:APPROVED]**

---

## Technical Validation (TL)

**Reviewer**: TL (Tech Lead)
**Documents Reviewed**:
- `ARCHITECTURE_PHASE18.md`
- `PROJECT_BRIEF_PHASE18.md`
- `InteroperableResearchNode/CLAUDE.md`
- `INodeChannelClient.cs` (interface, 86 lines)
- `NodeChannelClient.cs` (implementation, lines 341-410 — InvokeAsync/InvokeStreamAsync)
- `NativeInjectorBootStrapper.cs` (DI registration, lines 133-134, 173)
- `Program.cs:85` (INodeChannelClient singleton registration)
- `SyncController.cs` (existing class-level attributes)
- `ResearchNode.cs:34` (NodeUrl property)

---

### 1. SyncPullService Feasibility with Existing INodeChannelClient — PASS

`INodeChannelClient` already exposes the complete method chain required by `SyncPullService`:

- `OpenChannelAsync(string remoteNodeUrl)` — Phase 1 ECDH
- `IdentifyNodeAsync(string channelId, NodeIdentifyRequest request)` — Phase 2
- `RequestChallengeAsync(string channelId, string nodeId)` — Phase 3a
- `AuthenticateAsync(string channelId, ChallengeResponseRequest request)` — Phase 3b
- `InvokeAsync<TResponse>(channelId, sessionToken, method, path, body?)` — post-handshake encrypted calls
- `InvokeStreamAsync(channelId, sessionToken, path)` — binary file downloads
- `CloseChannelAsync(string channelId)` — cleanup

The `NodeChannelClient` implementation confirms that `InvokeAsync` handles encryption/decryption transparently through the channel's symmetric key and that `InvokeStreamAsync` returns raw streams for recording file downloads. The channel context is persisted in `IChannelStore` (Redis or in-memory), so sequential calls within a single service method share the same `channelId` without losing state.

**One concern**: The architecture document mentions challenge signing but does not specify the exact mechanism for `SyncPullService` to access the local node's RSA private key and produce the `ChallengeResponseRequest.Signature`. The existing `IChallengeService` is a singleton and should be injectable. The architecture should explicitly list `IChallengeService` as a dependency if it provides the signing function, or document the PEM-loading approach. This is a minor gap — not a blocker since the test suite (`NodeChannelClientTests`) already demonstrates this pattern.

---

### 2. API Contracts — PASS

Both endpoints (`POST /api/sync/preview` and `POST /api/sync/pull`) have well-defined contracts:

- **Request**: `SyncPullRequest { RemoteNodeId: Guid, Since?: DateTime }` — minimal, unambiguous.
- **Preview response**: Returns only aggregate metadata (counts, timestamps), never PII or clinical data. Correct for the UI layer.
- **Pull response**: Reuses existing `SyncResultDTO` — good reuse, no unnecessary new types.
- **Error responses**: Clear HTTP status codes (400, 401, 404, 502, 500) with a structured error envelope including a `stage` field for UI-friendly error messages. The stage field is a sensible addition.
- **Authentication**: User JWT (`[Authorize]`) for the outer layer, node handshake for the inner layer. Correct separation.

The decision to return the full `SyncManifestResponse` inside `SyncPreviewResponse` is sound — it gives the UI enough information for a confirmation dialog without exposing raw entity data.

---

### 3. Error Handling — PASS

The error handling strategy is comprehensive and covers all failure points in the handshake-fetch-import chain:

- **Channel cleanup**: `try/finally` block ensures `CloseChannelAsync` is called regardless of success or failure. This prevents channel resource leaks in Redis.
- **SyncLog tracking**: Every attempt creates a log entry updated to `failed` or `completed`. This provides auditability.
- **Stage-specific errors**: The `stage` field in the error response enables meaningful UI error messages.
- **Import rollback**: `SyncImportService.ImportAsync` already uses transactional upsert (all-or-nothing), which the architecture correctly preserves.

The architecture specifies "SyncLog created before handshake" in Section 8.2, which is the correct approach for tracking connectivity failures.

---

### 4. DI Registration Approach — PASS

- `SyncPullService` registered as **scoped** in `NativeInjectorBootStrapper.RegisterServices()` — correct because it depends on scoped services (`INodeRepository`, `ISyncImportService`, `ISyncLogRepository` which all depend on `PrismDbContext`).
- `INodeChannelClient` registered as **singleton** in `Program.cs:85` — injecting a singleton into a scoped service is explicitly supported by ASP.NET Core. No captive dependency issue.
- The existing `ISyncExportService` and `ISyncImportService` are already scoped (NativeInjectorBootStrapper lines 133-134), and `ISyncLogRepository` is scoped (line 173). The new registration fits naturally alongside these.

---

### 5. Controller Separation (SyncPullController vs SyncController) — PASS

The decision to create a separate `SyncPullController` with `[Authorize]` (user JWT) rather than adding `[AllowAnonymous]` overrides on `SyncController` (which has class-level `[PrismAuthenticatedSession(RequiredCapability = NodeAccessTypeEnum.ReadWrite)]` + `[PrismSyncEndpoint]`) is architecturally correct. Two controllers can share the `api/sync` route prefix without conflict in ASP.NET Core. This avoids fragile attribute override patterns and keeps the authentication concerns cleanly separated:

- `SyncController` — node-to-node (export, serving data to remote nodes)
- `SyncPullController` — user-facing (triggering local backend to pull from remote)

---

### 6. Security — PASS

The dual-authentication model is well-designed:

- **Outer layer**: User JWT prevents unauthorized sync triggers. Only authenticated researchers can initiate a pull.
- **Inner layer**: Full 4-phase handshake preserves all cryptographic guarantees (PFS, AES-256-GCM, RSA challenge-response).
- **Data sovereignty**: Biomedical data never transits through the UI layer. The preview endpoint returns only aggregate counts. The pull endpoint returns only status metadata.
- **Remote node authorization**: `Status == Authorized` check before handshake prevents connections to pending/revoked nodes.
- **No credential exposure**: Node private keys, certificates, and session tokens remain entirely within the backend process.

All existing security properties from Phases 1-4 are preserved without modification.

---

### 7. Scalability — PASS (with accepted limitations)

- **Synchronous request-response**: The `POST /api/sync/pull` endpoint blocks until the entire sync completes. For large datasets, this may approach the 5-minute timeout. The architecture acknowledges this limitation and proposes `202 Accepted` + polling for a future phase. Acceptable for Phase 18 scope.
- **Paginated entity fetch**: 100 records per page prevents memory pressure during large syncs.
- **No streaming progress**: The UI shows a spinner instead of per-entity progress. This is a UX trade-off, not a scalability concern. Accepted per project brief.

---

### 8. Testability — PASS

- `ISyncPullService` interface enables unit testing with mocked `INodeChannelClient`, `INodeRepository`, `ISyncLogRepository`, and `ISyncImportService`.
- The architecture specifies integration tests (US-1808) that test the full handshake chain before entity fetch logic, which is the correct testing order.
- The existing `test-phase4.sh` and `NodeChannelClientTests.cs` provide a foundation for the handshake chain test.
- The separate `SyncPullController` can be integration-tested independently from the export `SyncController`.

---

### 9. NodeUrl Resolution — PASS

Confirmed that `ResearchNode.NodeUrl` (line 34 of `ResearchNode.cs`) already exists as `string`. No migration needed. The URL is populated during Phase 2 node registration. Risk #2 from the project brief is fully resolved.

---

### 10. Identified Gaps (Non-Blocking)

**G-1: Challenge signing dependency not explicit**. The architecture lists 6 constructor dependencies for `SyncPullService` but does not include `IChallengeService` or an equivalent signing utility. The `PerformHandshake` method needs to sign the challenge with the local node's RSA private key. This should be clarified during implementation (likely US-1801). **Severity**: Low — the pattern is well-established in the test suite.

**G-2: Concurrent pull prevention not addressed**. If two users trigger `POST /api/sync/pull` for the same `remoteNodeId` simultaneously, two handshakes and two imports would execute in parallel. While the transactional import with "newer wins" makes this data-safe, it wastes resources. A distributed lock (Redis `SETNX` on `sync:pull:{remoteNodeId}`) would be a simple guard. **Severity**: Low — unlikely in practice for Phase 18 scope.

**G-3: `InvokeAsync` error handling uses generic `Exception`**. The `NodeChannelClient.InvokeAsync` implementation (line 374) throws `Exception` on HTTP errors. `SyncPullService` would benefit from catching typed exceptions to map to the stage-specific error codes described in Section 8. **Severity**: Low — can be addressed during implementation.

---

### Summary

| Concern | Verdict | Notes |
|---------|---------|-------|
| SyncPullService feasibility | PASS | Full handshake chain supported by existing INodeChannelClient |
| API contracts | PASS | Well-defined, minimal, no PII exposure |
| Error handling | PASS | Comprehensive try/finally, SyncLog tracking, stage-specific errors |
| DI registration | PASS | Scoped service with singleton dependency is valid |
| Controller separation | PASS | Clean auth boundary, no attribute conflicts |
| Security | PASS | Dual-auth model, data sovereignty preserved |
| Scalability | PASS | Accepted limitations documented for Phase 18 |
| Testability | PASS | Interface-based design, correct test ordering |
| NodeUrl resolution | PASS | Already exists, no migration needed |
| Architectural gaps | 3 non-blocking items | G-1 signing dep, G-2 concurrent lock, G-3 typed exceptions |

---

**[VERDICT:APPROVED]**
