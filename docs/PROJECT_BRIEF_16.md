# Project Brief: Fix Session Data Export for Synced Recordings

**Date**: 2026-02-18
**Author**: PM (Product Manager)
**Status**: DRAFT
**Phase**: 16

---

## 1. Business Objective

After a clinical session's recordings are synchronized to the Research Node backend, the IRIS mobile app's HistoryScreen ZIP export silently produces corrupt output. The root cause is that `SyncService.syncRecordings()` performs a destructive two-step operation: it uploads the local CSV file to blob storage, deletes the local file from disk, and then overwrites `recording.filePath` with the blob storage URL. When the user later taps "Export ZIP", the export handler calls `FileSystem.getInfoAsync()` on what is now a remote URL, which returns `exists: false`, causing the ZIP to contain `# File not found on disk` placeholder text instead of actual sEMG data.

This means any researcher who syncs session data to the backend and later tries to export that session locally receives an empty ZIP with no usable signal data. Since sync is automatic (60-second interval), every session eventually reaches this broken state. The fix must preserve export capability for synced recordings by either retaining the local file or fetching the data from the blob URL at export time.

---

## 2. Scope

### 2.1 In Scope

**Schema Migration (v5)** (`apps/mobile/src/data/migrations/v5_add_blob_url.ts`):

Add a new `blob_url` column to the `recordings` table that stores the remote blob storage URL independently from the local `file_path` column. This is a non-destructive `ALTER TABLE ADD COLUMN` migration that preserves all existing data. The `file_path` column continues to hold the local filesystem path and must never be overwritten with a remote URL.

```sql
ALTER TABLE recordings ADD COLUMN blob_url TEXT DEFAULT NULL;
```

**Domain Type Update** (`packages/domain/src/models/Recording.ts`):

Add an optional `blobUrl?: string` field to the `Recording` interface and the `NewRecordingData` interface. This enables the TypeScript type system to distinguish between local paths and remote URLs throughout the codebase.

**RecordingRepository Update** (`apps/mobile/src/data/repositories/RecordingRepository.ts`):

- Add `blob_url` to the `RecordingRow` interface
- Map `blob_url` to `blobUrl` in `mapRowToRecording()`
- Support `blobUrl` in the `update()` method's dynamic field builder
- Support `blobUrl` in the `create()` method's INSERT statement

**SyncService Fix** (`apps/mobile/src/services/SyncService.ts`):

In `syncRecordings()`, after a successful file upload that returns `uploadResponse.fileUrl`:
1. Store the blob URL in the new `blobUrl` field: `await this.recordingRepo.update(recording.id, { blobUrl: uploadResponse.fileUrl })`
2. Still delete the local file (to reclaim device storage)
3. Clear the local `filePath` to `null` (instead of overwriting it with the blob URL): `await this.recordingRepo.update(recording.id, { filePath: undefined })`

This replaces the current single `update({ filePath: uploadResponse.fileUrl })` call that conflates local and remote paths.

**Export Handler Fix** (`apps/mobile/src/screens/HistoryScreen.tsx`):

In `handleExportSession()`, update the CSV content resolution loop to handle three cases per recording:

1. **Local file exists** (`rec.filePath` is set and `FileSystem.getInfoAsync()` returns `exists: true`): Read from local disk as today.
2. **Blob URL available** (`rec.blobUrl` is set, local file is missing or absent): Fetch the CSV content from the blob URL via an HTTP GET request, then include the response body in the ZIP.
3. **Neither available**: Include `# No recording data available\n` as a fallback placeholder.

The fetch-from-blob path should use `expo-file-system`'s `downloadAsync()` to a temporary file, read its content, then delete the temporary file. This avoids loading the entire CSV into memory as a string via `fetch()` on low-end devices.

**No changes to `csvExport.ts`**: The `exportSessionAsZip()` function already receives pre-read CSV content strings. The resolution logic belongs in the caller (HistoryScreen), not in the utility.

### 2.2 Out of Scope

- Backend (`InteroperableResearchNode`) changes -- the blob storage API and Upload controller are stable and do not need modification.
- Changes to the real-time streaming pipeline, CSV file creation during capture, or the `CaptureScreen` workflow.
- Retroactive repair of recordings that were already synced before this fix (their `file_path` already contains a blob URL). A data migration to split existing blob URLs into the new `blob_url` column and clear `file_path` is in scope (see Acceptance Criteria).
- Desktop app export -- the desktop application does not currently support ZIP export.
- Compression or deduplication of blob storage data.

---

## 3. Acceptance Criteria

1. **New recordings** created after the migration store the local CSV path in `file_path` and, after sync, store the blob URL in `blob_url` while clearing `file_path` to NULL.

2. **Export of synced sessions** produces a ZIP containing actual CSV data fetched from the blob URL (not `# File not found on disk`).

3. **Export of unsynced sessions** continues to work identically to today (reads from local `file_path`).

4. **Retroactive data migration**: The v5 migration (or a post-migration repair step in the repository) detects recordings where `file_path` contains a URL pattern (starts with `http://` or `https://`) and moves that value to `blob_url`, setting `file_path` to NULL. This repairs recordings that were synced under the old behavior.

5. **Offline export**: When the device is offline and the blob URL is unreachable, the export shows an informative error per-recording (`# Recording data is on server (offline)`) rather than silently failing or crashing.

6. **Storage reclamation**: After successful upload and blob URL storage, the local CSV file is deleted from the device filesystem (preserving current behavior).

7. **No regression** in the sync cycle: sessions, recordings, and annotations continue to sync correctly with the Research Node backend.

---

## 4. Technical Context

### Current Data Flow (Broken)

```
CaptureScreen writes CSV to local path
  -> recording.filePath = "file:///data/.../rec_001.csv"
  -> SyncService uploads file to blob storage
  -> SyncService deletes local file
  -> SyncService sets recording.filePath = "https://blob.example.com/rec_001.csv"
  -> HistoryScreen export: FileSystem.getInfoAsync("https://blob...") -> exists: false
  -> ZIP contains "# File not found on disk"
```

### Target Data Flow (Fixed)

```
CaptureScreen writes CSV to local path
  -> recording.filePath = "file:///data/.../rec_001.csv"
  -> recording.blobUrl = null
  -> SyncService uploads file to blob storage
  -> SyncService deletes local file
  -> SyncService sets recording.blobUrl = "https://blob.example.com/rec_001.csv"
  -> SyncService sets recording.filePath = null
  -> HistoryScreen export:
     1. filePath is null, skip local read
     2. blobUrl is set, download CSV from blob URL
     3. Include downloaded CSV content in ZIP
```

### Key Files

| File | Role | Change |
|------|------|--------|
| `packages/domain/src/models/Recording.ts` | Domain type | Add `blobUrl?: string` |
| `apps/mobile/src/data/migrations/v5_add_blob_url.ts` | Schema | `ALTER TABLE recordings ADD COLUMN blob_url TEXT` + retroactive repair |
| `apps/mobile/src/data/database.ts` | Migration runner | Register v5 migration |
| `apps/mobile/src/data/repositories/RecordingRepository.ts` | Data access | Map `blob_url` column |
| `apps/mobile/src/services/SyncService.ts` | Sync logic | Store blob URL separately, clear local path |
| `apps/mobile/src/screens/HistoryScreen.tsx` | Export handler | Fetch from blob URL when local file is absent |

### SQLite Schema Change

Current `recordings` table (v1):
```sql
CREATE TABLE recordings (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    sample_count INTEGER DEFAULT 0,
    data_type TEXT DEFAULT 'raw',
    sample_rate INTEGER DEFAULT 215,
    sync_status TEXT DEFAULT 'pending',
    file_path TEXT,               -- currently overwritten with blob URL after sync
    recorded_at TEXT NOT NULL
);
```

After v5 migration:
```sql
-- file_path: always a local filesystem path (or NULL after sync)
-- blob_url: remote blob storage URL (or NULL before sync)
ALTER TABLE recordings ADD COLUMN blob_url TEXT DEFAULT NULL;

-- Retroactive repair: move existing blob URLs from file_path to blob_url
UPDATE recordings
   SET blob_url = file_path, file_path = NULL
 WHERE file_path LIKE 'http://%' OR file_path LIKE 'https://%';
```

---

## 5. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Blob URL fetch fails during export (network error, expired URL) | User gets empty CSV in ZIP | Show `# Recording data is on server (offline)` and surface a user-facing alert explaining the recording requires network access |
| Large CSV files cause OOM when fetched from blob | App crash on export | Use `FileSystem.downloadAsync()` to temp file + sequential read (same pattern as local file reads) |
| Retroactive migration misidentifies a local path as URL | Data corruption | Only match `file_path LIKE 'http://%' OR file_path LIKE 'https://%'` -- local paths always start with `file:///` or are relative |
| Existing synced recordings have no local file and old `filePath` is a blob URL | Export broken until migration runs | The retroactive UPDATE in v5 handles this case; migration runs on app startup before any export is possible |

---

## 6. Dependencies

- **expo-file-system** (`downloadAsync`): Already a project dependency; no new packages required.
- **@iris/domain**: Type change propagates to both mobile and desktop workspaces, but desktop does not use the `Recording` type for export.
- **Backend blob storage**: Assumes the blob URL returned by `POST /api/Upload/recording` remains accessible via unauthenticated GET. If authentication is required, the export handler must include the middleware session token in the download request.

---

## 7. Success Metrics

- Zero occurrences of `# File not found on disk` in exported ZIPs for synced sessions.
- Export works identically for both synced and unsynced sessions (when online).
- No increase in sync failure rate after the SyncService changes.
- Local storage is still reclaimed after successful upload (no regression in disk usage).
