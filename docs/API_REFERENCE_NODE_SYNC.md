# API Reference — Phase 17: Node-to-Node Data Synchronization

**Phase**: 17
**Date**: 2026-02-18
**Author**: TL (Tech Lead)
**Architecture**: `docs/ARCHITECTURE_NODE_SYNC.md`

---

## Overview

Phase 17 adds a one-way incremental data pull between authorized PRISM nodes. A requesting node (running the IRIS desktop app) pulls data from a remote node (InteroperableResearchNode backend) through the existing encrypted channel infrastructure. All sync endpoints require an active encrypted channel session with `ReadWrite` capability.

All backend endpoints are under the `api/sync` route prefix and protected by:
- `[PrismEncryptedChannelConnection]` — valid AES-256-GCM encrypted channel required
- `[PrismAuthenticatedSession(RequiredCapability = ReadWrite)]` — session token with ReadWrite or Admin level required
- `[PrismSyncEndpoint]` — elevates the rate limit to 600 req/min for the controller class

---

## Backend Endpoints (SyncController)

### POST /api/sync/manifest

Retrieve a summary of available entities on the remote node, optionally filtered by a `since` watermark. The requesting node uses this to confirm what data will be pulled before starting the sync.

**Authentication**: Encrypted channel + ReadWrite session required.

**Request body** (JSON, encrypted):
```json
{
    "since": "2026-02-01T00:00:00Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `since` | string (ISO 8601) | No | Only count entities updated after this timestamp. Omit for a full-sync manifest. |

**Response** `200 OK` (JSON, encrypted):
```json
{
    "nodeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nodeName": "Node Alpha",
    "generatedAt": "2026-02-18T12:00:00Z",
    "lastSyncedAt": "2026-02-01T00:00:00Z",
    "entities": {
        "snomed": { "count": 420, "latestUpdate": "2026-01-15T08:00:00Z" },
        "volunteers": { "count": 35, "latestUpdate": "2026-02-10T14:30:00Z" },
        "research": { "count": 8, "latestUpdate": "2026-02-05T09:00:00Z" },
        "sessions": { "count": 120, "latestUpdate": "2026-02-17T22:00:00Z" },
        "recordings": { "count": 45, "totalSizeBytes": 1258291200 }
    }
}
```

---

### GET /api/sync/snomed/{entityType}

Retrieve a paginated list of SNOMED catalog entities updated after `since`.

**Authentication**: Encrypted channel + ReadWrite session required.

**Path parameter**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `entityType` | string | One of: `body-regions`, `body-structures`, `topographical-modifiers`, `lateralities`, `clinical-conditions`, `clinical-events`, `medications`, `allergy-intolerances`, `severity-codes` |

**Query parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `since` | string (ISO 8601) | — | Only return entities with `UpdatedAt > since`. Omit for all entities. |
| `page` | int | `1` | Page number (1-indexed). |
| `pageSize` | int | `100` | Records per page. |

**Response** `200 OK`:
```json
{
    "data": [
        {
            "snomedCode": "123037004",
            "description": "Body structure",
            "updatedAt": "2026-01-15T08:00:00Z",
            "createdAt": "2025-10-01T00:00:00Z"
        }
    ],
    "page": 1,
    "pageSize": 100,
    "totalRecords": 342,
    "totalPages": 4
}
```

**Error responses**:
- `400 Bad Request` — unknown `entityType`
- `401 Unauthorized` — missing or invalid channel/session headers
- `403 Forbidden` — session lacks ReadWrite capability

---

### GET /api/sync/volunteers

Retrieve a paginated list of volunteers with their nested clinical sub-entities.

**Authentication**: Encrypted channel + ReadWrite session required.

**Query parameters**: same as `/api/sync/snomed/{entityType}` — `since`, `page`, `pageSize`.

**Response** `200 OK`:
```json
{
    "data": [
        {
            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "name": "Jane Doe",
            "dateOfBirth": "1985-03-15",
            "updatedAt": "2026-02-10T14:30:00Z",
            "clinicalConditions": [...],
            "medications": [...],
            "allergyIntolerances": [...],
            "vitalSigns": [...]
        }
    ],
    "page": 1,
    "pageSize": 100,
    "totalRecords": 35,
    "totalPages": 1
}
```

Nested sub-entities follow the same shape as their individual CRUD endpoints. All sub-entities belonging to a volunteer are included in a single page entry (no separate pagination for sub-entities).

---

### GET /api/sync/research

Retrieve a paginated list of research projects with nested sub-entities.

**Authentication**: Encrypted channel + ReadWrite session required.

**Query parameters**: `since`, `page`, `pageSize`.

**Response** `200 OK`:
```json
{
    "data": [
        {
            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "title": "EMG Study Alpha",
            "updatedAt": "2026-02-05T09:00:00Z",
            "applications": [...],
            "researchDevices": [...],
            "researchers": [...],
            "volunteers": [...]
        }
    ],
    "page": 1,
    "pageSize": 100,
    "totalRecords": 8,
    "totalPages": 1
}
```

**Import note**: When importing research entities, the `researchNodeId` FK is remapped to the requesting node's own ID. The original remote `researchNodeId` is discarded.

---

### GET /api/sync/sessions

Retrieve a paginated list of clinical sessions with records, annotations, target areas, and record channels.

**Authentication**: Encrypted channel + ReadWrite session required.

**Query parameters**: `since`, `page`, `pageSize`.

**Response** `200 OK`:
```json
{
    "data": [
        {
            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "researchId": "...",
            "volunteerId": "...",
            "updatedAt": "2026-02-17T22:00:00Z",
            "records": [
                {
                    "id": "...",
                    "recordChannels": [
                        {
                            "id": "...",
                            "fileUrl": "https://storage.example.com/..."
                        }
                    ]
                }
            ],
            "sessionAnnotations": [...],
            "targetAreas": [...]
        }
    ],
    "page": 1,
    "pageSize": 100,
    "totalRecords": 120,
    "totalPages": 2
}
```

Recording channels that have a `fileUrl` indicate a file blob that must be downloaded separately via `GET /api/sync/recordings/{id}/file`.

---

### GET /api/sync/recordings/{id}/file

Retrieve the binary content of a recording file, returned as a base64-encoded JSON payload within the encrypted channel envelope.

**Authentication**: Encrypted channel + ReadWrite session required.

**Path parameter**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | GUID | ID of the `RecordChannel` entry whose file is being downloaded. |

**Response** `200 OK` (JSON, encrypted):
```json
{
    "contentBase64": "<base64-encoded file bytes>",
    "contentType": "application/octet-stream",
    "fileName": "recording_abc123.bin"
}
```

**Error responses**:
- `404 Not Found` — `RecordChannel` not found or has no associated file (`FileUrl` is null/empty).

**Implementation note**: The response is intentionally JSON (not a binary `FileResult`) so that it passes through the standard `PrismEncryptedChannelConnection` serialization/deserialization pipeline used by all other sync endpoints and by `ResearchNodeMiddleware.invoke()` on the client side. The `contentBase64` field contains the raw file bytes encoded with `Convert.ToBase64String`.

**Dependency on JSON naming policy**: The C# anonymous object fields (`ContentBase64`, `ContentType`, `FileName`) must be serialized to camelCase by the global `JsonNamingPolicy.CamelCase` configured in `Program.cs`. Verify this is active to avoid a silent field name mismatch on the TypeScript client.

---

### POST /api/sync/import

Import a collected payload of entities into the requesting node's local database within a single database transaction. This endpoint is called by the IRIS desktop middleware after all entity pages have been fetched from the remote node.

**Authentication**: None — this endpoint is called from the local middleware and has no `[PrismEncryptedChannelConnection]` or `[PrismAuthenticatedSession]` attributes. It is not accessible through the remote channel. Access should be restricted to localhost or protected by `[Authorize]` (user JWT) in production deployments.

**Request body** (JSON):
```json
{
    "manifestGeneratedAt": "2026-02-18T12:00:00Z",
    "snomed": {
        "bodyRegions": [...],
        "bodyStructures": [...],
        "topographicalModifiers": [...],
        "lateralities": [...],
        "clinicalConditions": [...],
        "clinicalEvents": [...],
        "medications": [...],
        "allergyIntolerances": [...],
        "severityCodes": [...]
    },
    "volunteers": [...],
    "research": [...],
    "sessions": [...],
    "recordings": [
        {
            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "contentBase64": "<base64>",
            "contentType": "application/octet-stream",
            "fileName": "recording_abc123.bin"
        }
    ]
}
```

**Response** `200 OK`:
```json
{
    "status": "completed",
    "startedAt": "2026-02-18T12:00:01Z",
    "completedAt": "2026-02-18T12:00:45Z",
    "entitiesReceived": {
        "snomed": 420,
        "volunteers": 35,
        "research": 8,
        "sessions": 120,
        "recordings": 45
    }
}
```

**Response** `200 OK` (on rollback):
```json
{
    "status": "rolled_back",
    "startedAt": "2026-02-18T12:00:01Z",
    "completedAt": "2026-02-18T12:00:10Z",
    "entitiesReceived": {},
    "errorMessage": "FK constraint violation: ResearchId not found"
}
```

**Transaction guarantee**: All upserts execute inside a single `IDbContextTransaction`. Any failure causes a full rollback — no partial data is written. A `SyncLog` entry with `status = "failed"` and the error message is written in a separate implicit transaction after the rollback.

**Upsert conflict resolution**: "Newer wins" — if a record exists locally with a more recent `UpdatedAt`, the remote version is skipped. If the remote is newer, all columns are overwritten.

**Import dependency order**: SNOMED → Volunteers → Research → Sessions → Recordings. Sub-entities are inserted after their parents to satisfy FK constraints.

---

### GET /api/sync/log

Retrieve paginated sync history for a given remote node.

**Authentication**: Encrypted channel + ReadWrite session required.

**Query parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `remoteNodeId` | GUID | Yes | The remote node whose sync history to retrieve. |
| `page` | int | No (default: 1) | Page number. |
| `pageSize` | int | No (default: 10) | Records per page. |

**Response** `200 OK`:
```json
{
    "data": [
        {
            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "remoteNodeId": "...",
            "startedAt": "2026-02-18T12:00:01Z",
            "completedAt": "2026-02-18T12:00:45Z",
            "status": "completed",
            "lastSyncedAt": "2026-02-18T12:00:00Z",
            "entitiesReceived": {
                "snomed": 420,
                "volunteers": 35,
                "research": 8,
                "sessions": 120,
                "recordings": 45
            },
            "errorMessage": null
        }
    ],
    "page": 1,
    "pageSize": 10,
    "totalRecords": 3,
    "totalPages": 1
}
```

The most recent entry (lowest `startedAt` DESC) is used by the desktop UI to display the "Last synced X ago" badge on the connection table.

---

## Middleware API (NodeSyncService)

### Class: `NodeSyncService`

**Package**: `@iris/middleware`
**File**: `packages/middleware/src/sync/NodeSyncService.ts`

Orchestrates the full sync pull flow: fetches the manifest, iterates all entity pages from the remote node, and submits a single import payload to the local backend.

#### Constructor

```typescript
new NodeSyncService(options: NodeSyncServiceOptions)
```

```typescript
interface NodeSyncServiceOptions {
    remoteMiddleware: ResearchNodeMiddleware;  // targets the remote node
    localMiddleware: ResearchNodeMiddleware;   // targets the local backend
    onProgress?: SyncProgressCallback;
}
```

#### Method: `pull(since?: string): Promise<SyncPreview>`

Fetches the manifest from the remote node. Returns a `SyncPreview` containing the manifest summary and a `proceed()` function that the caller invokes after user confirmation.

```typescript
const preview = await svc.pull('2026-02-01T00:00:00Z');
// show manifest to user...
const result = await preview.proceed();
```

The `since` parameter is the ISO 8601 watermark from the most recent completed `SyncLog` entry. Pass `undefined` for a full sync.

#### Progress Callback

```typescript
interface SyncProgress {
    phase: 'manifest' | 'snomed' | 'volunteers' | 'research' | 'sessions' | 'recordings';
    current: number;   // entities fetched so far in this phase
    total: number;     // total entities expected in this phase
    entityType: string;
}

type SyncProgressCallback = (progress: SyncProgress) => void;
```

---

### Class: `NodeSyncServiceAdapter`

**File**: `apps/desktop/src/services/NodeSyncServiceAdapter.ts`

Desktop service adapter that integrates `NodeSyncService` with the BaseService pattern. Extends `BaseService` to get `ensureSession()` and dependency injection.

#### Method: `preview(connection: ResearchNodeConnection, since: string | undefined, onProgress?: SyncProgressCallback): Promise<SyncPreview>`

Creates a connection-specific remote middleware instance targeting `connection.nodeUrl` and calls `NodeSyncService.pull(since)`. The connection must have `nodeAccessLevel === NodeAccessLevel.READ_WRITE` or `ADMIN`; the caller is responsible for enforcing this guard before invoking.

---

## Domain Types (@iris/domain)

**File**: `packages/domain/src/models/NodeSync.ts`

```typescript
export interface SyncManifest {
    nodeId: string;
    nodeName: string;
    generatedAt: string;                // ISO 8601
    lastSyncedAt: string | null;
    entities: {
        snomed: SyncEntitySummary;
        volunteers: SyncEntitySummary;
        research: SyncEntitySummary;
        sessions: SyncEntitySummary;
        recordings: SyncRecordingSummary;
    };
}

export interface SyncEntitySummary {
    count: number;
    latestUpdate: string;               // ISO 8601
}

export interface SyncRecordingSummary {
    count: number;
    totalSizeBytes: number;
}

export interface SyncProgress {
    phase: 'manifest' | 'snomed' | 'volunteers' | 'research' | 'sessions' | 'recordings';
    current: number;
    total: number;
    entityType: string;
}

export interface SyncResult {
    status: 'completed' | 'failed' | 'rolled_back';
    startedAt: string;                  // ISO 8601
    completedAt: string;                // ISO 8601
    entitiesReceived: Record<string, number>;
    errorMessage?: string;
}

export interface SyncLogEntry {
    id: string;
    remoteNodeId: string;
    startedAt: string;
    completedAt: string | null;
    status: 'in_progress' | 'completed' | 'failed' | 'rolled_back';
    lastSyncedAt: string | null;
    entitiesReceived: Record<string, number> | null;
    errorMessage: string | null;
}

export interface PaginatedSyncResponse<T = unknown> {
    data: T[];
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}
```

**ResearchNodeConnection extension** (in `packages/domain/src/models/Research.ts`):
```typescript
export interface ResearchNodeConnection {
    // ... existing fields ...
    lastSyncedAt?: string;       // ISO 8601 — populated from SyncLog
    lastSyncStatus?: string;     // 'completed' | 'failed' | 'rolled_back' | undefined
}
```

---

## Desktop UI: SyncProgressModal

**File**: `apps/desktop/src/screens/NodeConnections/SyncProgressModal.tsx`

A modal component with four states managed via a discriminated union (`ModalState`):

| State | Description | User Actions |
|-------|-------------|--------------|
| `confirmation` | Shows manifest entity counts. Prompts user to confirm. | "Start Sync" / "Cancel" |
| `in_progress` | Shows phase label + progress bar. Close is blocked. | (none while active) |
| `success` | Shows per-entity counts from `SyncResult`. | "Close" |
| `error` | Shows error message + confirms transaction was rolled back. | "Close" |

The `isSyncingRef` guard prevents double-invocation of `proceed()`. `handleSyncClose` re-fetches the connection list to update the last-sync badge after modal dismissal.

---

## Rate Limiting

Sync endpoints use an elevated rate limit of **600 requests/minute** instead of the standard 60. This is controlled by the `[PrismSyncEndpoint]` marker attribute on `SyncController`. The `PrismAuthenticatedSessionAttribute` checks for this marker and passes `overrideLimit = 600` to `SessionService.RecordRequestAsync()`.

At 100 records/page across 5 entity categories, 600 req/min allows approximately 60,000 records/minute — well above expected research dataset sizes.

---

## Database Schema: sync_logs

```sql
CREATE TABLE sync_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remote_node_id  UUID NOT NULL REFERENCES research_nodes(id),
    started_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at    TIMESTAMP WITH TIME ZONE,
    status          VARCHAR(20) NOT NULL DEFAULT 'in_progress',
                    -- 'in_progress' | 'completed' | 'failed' | 'rolled_back'
    last_synced_at  TIMESTAMP WITH TIME ZONE,
    entities_received JSONB,
                    -- {"snomed":420,"volunteers":35,"research":8,"sessions":120,"recordings":45}
    error_message   TEXT
);

CREATE INDEX IX_sync_logs_remote_node_id ON sync_logs(remote_node_id);
CREATE INDEX IX_sync_logs_status ON sync_logs(status);
```

EF Core migration: `20260218000000_AddSyncLog`

The `last_synced_at` column on the most recent completed `SyncLog` row serves as the watermark for the next incremental sync. The requesting node queries this value before calling `POST /api/sync/manifest` to determine the `since` parameter.
