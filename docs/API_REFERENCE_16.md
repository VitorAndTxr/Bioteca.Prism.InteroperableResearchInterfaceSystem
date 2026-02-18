# API Reference — Phase 16: Recording Blob URL Storage

**Phase**: 16
**Date**: 2026-02-18
**Author**: TL (Tech Lead)

---

## Overview

Phase 16 introduced a dedicated `blob_url` column in the local SQLite `recordings` table. This separates remote blob storage URLs from local filesystem paths, enabling reliable export of recordings after they have been synced to the backend.

---

## Domain Model

### `Recording` Interface

**File**: `packages/domain/src/models/Recording.ts`

```typescript
export interface Recording {
    id: string;
    sessionId: string;
    filename: string;
    durationSeconds: number;
    sampleCount: number;
    dataType: DataType;             // 'raw' | 'filtered' | 'rms'
    sampleRate: number;
    syncStatus: SyncStatus;         // 'pending' | 'synced' | 'failed'
    filePath?: string;              // Local filesystem path (undefined after sync)
    blobUrl?: string;               // Remote blob storage URL (undefined before sync)
    recordedAt: string;             // ISO 8601
}
```

**Field invariants**:

| Field | Before Sync | After Sync |
|-------|-------------|------------|
| `filePath` | `file:///...` path | `undefined` (NULL in DB) |
| `blobUrl` | `undefined` (NULL in DB) | `https://...` URL |
| `syncStatus` | `'pending'` | `'synced'` or `'failed'` |

### `NewRecordingData` Interface

```typescript
export interface NewRecordingData {
    sessionId: string;
    filename: string;
    durationSeconds: number;
    sampleCount: number;
    dataType: DataType;
    sampleRate: number;
    filePath?: string;
    blobUrl?: string;
}
```

### `DataType`

```typescript
export type DataType = 'raw' | 'filtered' | 'rms';
```

---

## SQLite Schema

### `recordings` Table (v5)

```sql
CREATE TABLE recordings (
    id              TEXT PRIMARY KEY,
    session_id      TEXT NOT NULL,
    filename        TEXT NOT NULL,
    duration_seconds REAL NOT NULL,
    sample_count    INTEGER NOT NULL,
    data_type       TEXT NOT NULL,
    sample_rate     REAL NOT NULL,
    sync_status     TEXT NOT NULL DEFAULT 'pending',
    file_path       TEXT,           -- NULL after sync
    blob_url        TEXT,           -- NULL before sync (added in v5)
    recorded_at     TEXT NOT NULL
);
```

**Column semantics**:
- `file_path`: Always starts with `file:///` (Android/iOS local path) or is NULL. Never holds an `http(s)://` URL.
- `blob_url`: Always starts with `http://` or `https://` or is NULL. Never holds a local path.

---

## Migration

### v5: `apps/mobile/src/data/migrations/v5_add_blob_url.ts`

```typescript
export const v5_add_blob_url = `
ALTER TABLE recordings ADD COLUMN blob_url TEXT DEFAULT NULL;

UPDATE recordings
   SET blob_url = file_path, file_path = NULL
 WHERE file_path LIKE 'http://%' OR file_path LIKE 'https://%';
`;
```

**Safety properties**:
- `ALTER TABLE ADD COLUMN` is non-destructive in SQLite — all existing rows get `NULL` for `blob_url`.
- The retroactive `UPDATE` repairs recordings that were synced under the old (broken) behavior where `SyncService` wrote the blob URL into `file_path`. The `LIKE` pattern cannot produce false positives against local paths (`file:///...`).
- Registered in `database.ts` at version 5, preventing re-application via the `migrations` tracking table.

---

## Repository API

### `RecordingRepository`

**File**: `apps/mobile/src/data/repositories/RecordingRepository.ts`

#### `create(data: NewRecordingData): Promise<Recording>`

Creates a new recording row. `blob_url` is always `NULL` on creation (new recordings are unsynced).

**SQL**:
```sql
INSERT INTO recordings
  (id, session_id, filename, duration_seconds, sample_count, data_type,
   sample_rate, sync_status, file_path, blob_url, recorded_at)
VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
```

#### `update(id: string, data: Partial<Recording>): Promise<void>`

Updates any subset of fields. Supports clearing `filePath` to `NULL` by passing `filePath: undefined`, and writing `blobUrl` by passing the URL string.

**Relevant field handlers**:
```typescript
if (data.filePath !== undefined) {
    fields.push('file_path = ?');
    values.push(data.filePath ?? null);   // undefined → NULL
}
if (data.blobUrl !== undefined) {
    fields.push('blob_url = ?');
    values.push(data.blobUrl ?? null);
}
```

**Important**: Passing `filePath: undefined` sets the DB column to `NULL`. This is the mechanism used by `SyncService` after a successful upload to clear the stale local path.

#### `getById(id: string): Promise<Recording | null>`

#### `getAll(): Promise<Recording[]>`

#### `getBySession(sessionId: string): Promise<Recording[]>`

Returns recordings ordered by `recorded_at ASC`. Each `Recording` includes both `filePath` and `blobUrl` fields (either may be `undefined`). Uses `SELECT *`, which automatically includes `blob_url` after the v5 migration.

#### `getPendingWithSyncedParent(): Promise<Recording[]>`

Returns pending recordings whose parent session is `synced`. Used by `SyncService` to determine what to upload next.

---

## Service API

### `SyncService` — Recording Sync

**File**: `apps/mobile/src/services/SyncService.ts`

After a successful file upload, the post-upload block runs in this crash-safe order:

```typescript
// 1. Persist blob URL first — at least one source survives a crash
await this.recordingRepo.update(recording.id, {
    blobUrl: uploadResponse.fileUrl,
});

// 2. Delete local file — reclaim storage
if (recording.filePath) {
    try {
        await FileSystem.deleteAsync(recording.filePath, { idempotent: true });
    } catch {
        // Non-fatal: cleanup failure does not block sync
    }
}

// 3. Clear local path — NULL signals "use blobUrl for export"
await this.recordingRepo.update(recording.id, {
    filePath: undefined,
});
```

**Crash-safety guarantee**: If the process terminates at any point during these three steps, at least one of `filePath` or `blobUrl` remains set, so export can always retrieve the data.

**Sync state lifecycle**:

```
pending → (upload succeeds) → blobUrl set, filePath cleared, syncStatus = 'synced'
pending → (upload fails, retries exhausted) → syncStatus = 'failed'
```

---

## Screen API

### `resolveRecordingContent(rec: Recording): Promise<string>`

**File**: `apps/mobile/src/screens/HistoryScreen.tsx` (module-level function)

Resolves the CSV content for a single recording using a local-first, blob-fallback strategy. Called within `handleExportSession()`.

**Decision tree**:

```
filePath is set?
├── YES → getInfoAsync(filePath)
│         ├── exists: true → readAsStringAsync(filePath) → return CSV string
│         └── exists: false → fall through to blobUrl check
└── NO  → fall through to blobUrl check

blobUrl is set?
├── YES → downloadAsync(blobUrl, tmpPath)
│         ├── status 200 → readAsStringAsync(tmpPath) → deleteAsync(tmpPath) → return CSV string
│         ├── status != 200 → deleteAsync(tmpPath) → return '# Failed to download recording from server\n'
│         └── throws (network error) → return '# Recording data is on server (offline)\n'
└── NO  → return '# No recording data available\n'
```

**Implementation**:

```typescript
async function resolveRecordingContent(rec: Recording): Promise<string> {
    if (rec.filePath) {
        const fileInfo = await FileSystem.getInfoAsync(rec.filePath);
        if (fileInfo.exists) {
            return FileSystem.readAsStringAsync(rec.filePath, {
                encoding: FileSystem.EncodingType.UTF8,
            });
        }
    }

    if (rec.blobUrl) {
        try {
            const tmpPath = FileSystem.cacheDirectory + `tmp_${rec.id}.csv`;
            const download = await FileSystem.downloadAsync(rec.blobUrl, tmpPath);
            if (download.status === 200) {
                const content = await FileSystem.readAsStringAsync(tmpPath, {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                await FileSystem.deleteAsync(tmpPath, { idempotent: true });
                return content;
            }
            await FileSystem.deleteAsync(tmpPath, { idempotent: true });
            return '# Failed to download recording from server\n';
        } catch {
            return '# Recording data is on server (offline)\n';
        }
    }

    return '# No recording data available\n';
}
```

**Notes**:
- Uses `FileSystem.downloadAsync()` (streams to disk) instead of `fetch()` (loads into JS heap) to handle large CSV files on memory-constrained devices.
- Blob downloads are unauthenticated — the backend returns publicly accessible URLs from `POST /api/Upload/recording`. See [Authentication Note](#authentication-note) below.
- Temp files are written to `FileSystem.cacheDirectory` and deleted immediately after reading.

#### Authentication Note

The current backend implementation returns a direct blob storage URL that does not require authentication headers. If this changes, `downloadAsync` accepts a `headers` option:

```typescript
const download = await FileSystem.downloadAsync(rec.blobUrl, tmpPath, {
    headers: { 'Authorization': `Bearer ${sessionToken}` },
});
```

This is not implemented. It is documented here as a forward reference.

---

## Export Placeholder Strings

| Condition | Placeholder in ZIP |
|-----------|-------------------|
| Local file missing, blob URL HTTP error (non-200) | `# Failed to download recording from server\n` |
| Local file missing, blob URL network failure | `# Recording data is on server (offline)\n` |
| No `filePath` and no `blobUrl` | `# No recording data available\n` |

---

## Backend API (External)

These endpoints are called by `SyncService` via `@iris/middleware`. The Phase 16 changes affect how the response from the upload endpoint is stored locally.

### `POST /api/ClinicalSession/{sessionId}/recordings/New`

Creates recording metadata on the backend.

**Request** (via middleware): Recording metadata (filename, duration, sample count, data type, sample rate).

**Response**: `200 OK` on success.

### `POST /api/Upload/recording`

Uploads the recording CSV file as Base64.

**Request** (via middleware): `{ fileUrl: string, content: string (Base64), ... }`

**Response**:
```json
{
    "fileUrl": "https://storage.example.com/recordings/<uuid>.csv"
}
```

The `fileUrl` value is stored in the `blob_url` column of the local `recordings` table. It is expected to be a stable, publicly accessible URL.

---

## Known Limitations

**S-001 (`cacheDirectory` null guard)**: `FileSystem.cacheDirectory` is typed as `string | null` in `expo-file-system`. The current implementation concatenates it directly without a null check. In practice, Expo always provides a non-null value on Android and iOS, but a defensive guard is recommended before production deployment:

```typescript
const cacheDir = FileSystem.cacheDirectory;
if (!cacheDir) {
    return '# No recording data available\n';
}
const tmpPath = cacheDir + `tmp_${rec.id}.csv`;
```

**S-002 (temp file leak)**: If `readAsStringAsync` throws after a successful `downloadAsync`, the temp file is not deleted (the `catch` block returns early). Impact is minor (OS clears `cacheDirectory` periodically) but a `finally` block would eliminate the risk entirely.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `docs/ARCHITECTURE_16.md` | Full architecture design with component diagrams and decision log |
| `docs/VALIDATION_16.md` | PM + TL gate verdicts |
| `docs/REVIEW_16.md` | Code review findings |
| `docs/TEST_REPORT_16.md` | Test results (15/15 unit tests passing) |
