# Project Brief: Node-to-Node Data Synchronization

**Date**: 2026-02-18
**Author**: PM (Product Manager)
**Status**: DRAFT
**Phase**: 17

---

## 1. Business Objectives

| # | Objective | Success Criteria | Priority |
|---|-----------|-----------------|----------|
| 1 | Enable one-way incremental data pull between authorized PRISM nodes | A requesting node can click "Sync" on an active connection and receive all SNOMED catalogs, volunteers, research, sessions, and recordings from the requested node | Must |
| 2 | Guarantee transactional integrity of synchronization | If the requested node fails mid-transfer, all changes on the requesting node are rolled back — no partial data | Must |
| 3 | Support incremental sync with "newer wins" conflict resolution | Only records created or modified since the last successful sync are transferred; when both nodes have the same record, the most recently updated version wins | Must |
| 4 | Require ReadWrite capability for sync operations | Only nodes with ReadWrite or Admin access level can initiate or serve sync requests, ensuring a minimum trust level for data exchange | Must |

---

## 2. Scope

### 2.1 In Scope

**Backend — New Sync Endpoints** (`InteroperableResearchNode`):

The requested node (data source) must expose endpoints that serve its data to authenticated remote nodes. These endpoints must support incremental queries via a `since` timestamp parameter, returning only records with `UpdatedAt > since`.

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `POST /api/sync/manifest` | POST | Channel + Session (ReadWrite) | Returns a manifest listing entity counts and latest timestamps per entity type, so the requester knows what to expect |
| `GET /api/sync/snomed/{entityType}` | GET | Channel + Session (ReadWrite) | Exports SNOMED catalog data (BodyRegion, BodyStructure, TopographicalModifier, Laterality, ClinicalCondition, ClinicalEvent, Medication, AllergyIntolerance) |
| `GET /api/sync/volunteers` | GET | Channel + Session (ReadWrite) | Exports volunteers and their clinical sub-entities (VitalSigns, ClinicalConditions, Medications, Allergies) |
| `GET /api/sync/research` | GET | Channel + Session (ReadWrite) | Exports research projects and their sub-entities (Applications, Devices, Sensors, Researchers) |
| `GET /api/sync/sessions` | GET | Channel + Session (ReadWrite) | Exports clinical sessions with recordings, annotations, and target areas |
| `GET /api/sync/recordings/{id}/file` | GET | Channel + Session (ReadWrite) | Streams the raw recording file (binary) for a given recording ID |

All data endpoints accept `?since=ISO8601` for incremental queries and return paginated responses to avoid memory exhaustion on large datasets.

**Backend — Sync Import Service**:

The requesting node (data consumer) needs an internal service that receives the fetched data and persists it within a database transaction. If any step fails, the entire transaction is rolled back. This service handles:

- Upserting SNOMED catalogs by natural key (SNOMED code) — newer `UpdatedAt` wins
- Upserting volunteers by natural key or cross-node identifier — newer wins
- Upserting research projects — newer wins, preserving local `ResearchNodeId` associations
- Upserting sessions, recordings, annotations — newer wins
- Downloading and storing recording files referenced by blob URLs

**Backend — Sync Metadata Tracking**:

A new `SyncLog` table to track sync history between nodes:

```sql
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY,
    remote_node_id UUID NOT NULL REFERENCES research_nodes(id),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, failed, rolled_back
    last_synced_at TIMESTAMPTZ, -- the "since" watermark for next incremental sync
    entities_received JSONB, -- { "snomed": 42, "volunteers": 10, "research": 3, "sessions": 15 }
    error_message TEXT,
    CONSTRAINT fk_sync_remote_node FOREIGN KEY (remote_node_id) REFERENCES research_nodes(id)
);
```

**Backend — NodeChannelClient Extension**:

Extend the existing `NodeChannelClient` with an `InvokeAsync<TResponse>(method, path, body?)` method that sends authenticated requests through the established encrypted channel. This builds on the existing handshake infrastructure — after Phase 4 completes, the client can make arbitrary API calls using the session token.

**Middleware — Sync Service** (`@iris/middleware`):

A new `SyncService` class in the middleware package that orchestrates the sync flow from the desktop app's perspective:

1. Establish connection to remote node (reuse existing 4-phase handshake via `ResearchNodeMiddleware`)
2. Request manifest from remote node (`POST /api/sync/manifest`)
3. Pull entities in dependency order: SNOMED → Volunteers → Research → Sessions → Recordings (files)
4. Report progress via callback (for UI progress indicators)
5. Return sync result (success/failure with details)

**Desktop — Sync UI** (`IRIS/apps/desktop`):

Wire the existing stub sync button in `NodeConnectionsScreen` to trigger the real sync flow:

1. Click "Sync" on an active connection → confirmation dialog with estimated transfer size (from manifest)
2. Progress indicator showing current entity type being synced and completion percentage
3. Success/failure notification with summary (e.g., "Synced: 42 SNOMED concepts, 10 volunteers, 3 research projects, 15 sessions")
4. Sync history visible in connection details (last sync date, status, item counts)

**Domain Types** (`@iris/domain`):

New types for the sync protocol:

```typescript
interface SyncManifest {
    nodeId: string;
    nodeName: string;
    generatedAt: string;
    lastSyncedAt: string | null;
    entities: {
        snomed: { count: number; latestUpdate: string };
        volunteers: { count: number; latestUpdate: string };
        research: { count: number; latestUpdate: string };
        sessions: { count: number; latestUpdate: string };
        recordings: { count: number; totalSizeBytes: number };
    };
}

interface SyncProgress {
    phase: 'manifest' | 'snomed' | 'volunteers' | 'research' | 'sessions' | 'recordings';
    current: number;
    total: number;
    entityType: string;
}

interface SyncResult {
    status: 'completed' | 'failed' | 'rolled_back';
    startedAt: string;
    completedAt: string;
    entitiesReceived: Record<string, number>;
    errorMessage?: string;
}
```

### 2.2 Out of Scope

- **Bidirectional sync** — this phase is one-way pull only (requester receives data from requested node)
- **Real-time / automatic sync** — sync is manual, triggered by user clicking the button
- **Conflict resolution UI** — "newer wins" is applied automatically; no user-facing merge interface
- **Mobile app sync** — this feature is desktop-only; mobile's existing `SyncService` (local → backend) is unrelated
- **File deduplication** — recording files are transferred as-is with no dedup across nodes
- **ABAC / fine-grained permissions** — all data visible to the remote node is synced; no per-entity access control beyond the ReadWrite capability check
- **Event sourcing / vector clocks** — previously identified as Phase 5 risks, deferred to a future phase; this implementation uses timestamp-based watermarks which are sufficient for the one-way pull model
- **Partial entity selection** — the user cannot choose to sync only SNOMED or only volunteers; it's all-or-nothing per sync operation

---

## 3. Acceptance Criteria

1. **Sync button works**: Clicking "Sync" on an active connection in `NodeConnectionsScreen` initiates a sync transaction against the remote node.

2. **Manifest preview**: Before transferring data, the user sees a summary of what will be synced (entity counts, estimated size) and can confirm or cancel.

3. **Incremental transfer**: The second and subsequent syncs only transfer records with `UpdatedAt` greater than the last successful sync's watermark timestamp.

4. **Newer wins**: When a record exists on both nodes (matched by natural key or ID), the version with the more recent `UpdatedAt` is kept.

5. **Transactional rollback**: If the remote node fails mid-transfer (network error, timeout, server error), all changes on the requesting node are rolled back — no partial data persists.

6. **Recording files**: Binary recording files referenced by sessions are downloaded and stored locally on the requesting node.

7. **Progress feedback**: The UI shows a progress indicator during sync with the current entity type and completion percentage.

8. **Sync history**: The connection details screen shows the last sync date, status, and item counts.

9. **ReadWrite enforcement**: Attempting to sync with a ReadOnly connection returns a clear error message explaining insufficient capability.

10. **No regression**: Existing handshake, session management, and all CRUD operations continue to work correctly.

---

## 4. Technical Context

### Data Flow

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│   Requesting Node (Desktop) │         │   Requested Node (Backend)  │
│                             │         │                             │
│  1. User clicks "Sync"     │         │                             │
│  2. Desktop → Middleware    │         │                             │
│     SyncService.pull()      │         │                             │
│  3. 4-phase handshake       │────────▶│  Validate channel + session │
│  4. POST /api/sync/manifest │────────▶│  Return entity counts       │
│  5. Show manifest to user   │◀────────│                             │
│  6. User confirms           │         │                             │
│  7. GET /api/sync/snomed/*  │────────▶│  Return SNOMED records      │
│  8. GET /api/sync/volunteers│────────▶│  Return Volunteer records   │
│  9. GET /api/sync/research  │────────▶│  Return Research records    │
│ 10. GET /api/sync/sessions  │────────▶│  Return Session records     │
│ 11. GET recordings/files    │────────▶│  Stream recording binaries  │
│                             │◀────────│                             │
│ 12. BEGIN TRANSACTION       │         │                             │
│ 13. Upsert all entities     │         │                             │
│ 14. COMMIT (or ROLLBACK)    │         │                             │
│ 15. Write SyncLog entry     │         │                             │
│ 16. Show result to user     │         │                             │
└─────────────────────────────┘         └─────────────────────────────┘
```

### Entity Sync Order (dependency-first)

1. **SNOMED catalogs** — no FK dependencies, natural keys (SNOMED codes)
2. **Volunteers** — depends on SNOMED (clinical conditions reference SNOMED codes)
3. **Research** — depends on Researchers
4. **Sessions** — depends on Research + Volunteer
5. **Recordings/Annotations** — depends on Sessions

### Key Existing Infrastructure

| Component | What exists | What's needed |
|-----------|-------------|---------------|
| `NodeChannelClient` | Handshake only (open, identify, challenge, authenticate) | Add `InvokeAsync<T>()` for arbitrary authenticated requests |
| `PrismAuthenticatedSession` | Capability check (ReadOnly/ReadWrite/Admin) | Use `RequiredCapability = ReadWrite` on sync endpoints |
| `ResearchNodeMiddleware` | Full `invoke<T>()` abstraction in TypeScript | Build `SyncService` on top of it |
| `NodeConnectionsScreen` | Sync button stub (`console.log`) | Wire to real `SyncService.pull()` |
| `SyncStatus` type | Exists in `@iris/domain` | Extend with `SyncManifest`, `SyncProgress`, `SyncResult` |
| `BaseRepository<T,K>` | Standard CRUD + pagination | Add bulk upsert methods for sync import |
| `UpdatedAt` columns | Exist on most entities via `BaseEntity` | Use as watermark for incremental queries |

### Database Tables Affected

**New table**: `sync_logs`

**Existing tables receiving synced data** (28 total, grouped by sync phase):

| Phase | Tables |
|-------|--------|
| SNOMED | `snomed_body_regions`, `snomed_body_structures`, `snomed_topographical_modifiers`, `snomed_lateralities`, `clinical_conditions`, `clinical_events`, `medications`, `allergy_intolerances` |
| Volunteers | `volunteers`, `vital_signs`, `volunteer_clinical_conditions`, `volunteer_medications`, `volunteer_allergy_intolerances` |
| Research | `researches`, `researchers`, `research_applications`, `research_devices`, `research_sensors` |
| Sessions | `record_sessions`, `records`, `record_channels`, `session_annotations`, `target_areas` |

---

## 5. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | Large dataset transfer causes timeouts | Med | High | Paginated responses (max 100 records/page), streaming for recording files, configurable timeout on `NodeChannelClient` |
| 2 | Timestamp-based "newer wins" conflicts with clock skew between nodes | Low | Med | Use `UpdatedAt` from the source node as-is (no cross-node comparison for first version); document requirement for NTP-synced clocks |
| 3 | Recording file download fails mid-transfer | Med | Med | Download files after entity upsert within same transaction; if file download fails, rollback entire sync |
| 4 | Duplicate volunteers across nodes (same person, different IDs) | Med | Med | First version: treat as separate records (different GUIDs = different entities). Future: optional cross-node ID mapping |
| 5 | Rate limiting (60 req/min) blocks sync with many pages | High | Med | Sync endpoints should be exempt from standard rate limiting or use a dedicated sync rate limit (e.g., 600 req/min for sync operations) |
| 6 | PII transfer (volunteer names, birthdates) between institutions | Low | High | ReadWrite capability ensures institutional trust; future phase can add field-level consent/anonymization |

---

## 6. Effort Estimation (T-shirt sizing)

| Component | Effort | Rationale |
|-----------|--------|-----------|
| Backend sync export endpoints (6 endpoints) | L | New controller, query logic for all entity types with incremental filtering, file streaming |
| Backend sync import service + transaction | XL | Bulk upsert across 20+ tables within a single transaction, conflict resolution, error handling |
| Backend `NodeChannelClient.InvokeAsync<T>` | S | Extend existing class with HTTP call using session token |
| Backend `SyncLog` table + migration | S | New entity, repository, simple CRUD |
| Backend rate limit exemption for sync | S | Modify `ISessionService` rate limiter to check endpoint category |
| Middleware `SyncService` | M | Orchestrate pull flow, progress callbacks, error mapping |
| Domain types (`SyncManifest`, `SyncProgress`, `SyncResult`) | S | Type definitions only |
| Desktop sync UI (dialog, progress, history) | M | Confirmation modal, progress bar, result notification, sync log display |
| **Total** | **XL** | Estimated 4-6 development cycles |

---

## 7. Dependencies

- **EF Core migrations**: A new migration is required for the `sync_logs` table. Must be run on both nodes.
- **`UpdatedAt` column coverage**: Verify all syncable entities have `UpdatedAt` populated reliably. Any entity missing this column will need a migration.
- **Docker multi-node testing**: The sync feature requires two running nodes — use `docker-compose.application.yml` (NodeA + NodeB) for end-to-end testing.
- **No new packages**: All required libraries (HTTP client, JSON serialization, EF Core) are already present in the backend. The desktop app uses `@iris/middleware` which already has `invoke()`.

---

## 8. Success Metrics

- Sync between two Docker nodes completes without errors for a dataset of 1000+ records across all entity types.
- Incremental sync (second run with no changes) transfers zero records and completes in under 2 seconds.
- Sync with simulated mid-transfer failure results in zero persisted changes on the requesting node.
- Desktop UI shows accurate progress and final summary for every sync operation.

---

## Technical Risk Assessment

> To be added by Tech Lead (`/tl plan`).

## Specialist Notes

> To be added by Dev Specialist (`/dev plan`) and QA Specialist (`/qa plan`).
