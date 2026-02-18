# Validation: Fix Session Data Export for Synced Recordings

**Phase**: 16
**Date**: 2026-02-18

---

## TL (Tech Lead) Validation

**Reviewer**: TL
**Documents Reviewed**: `PROJECT_BRIEF_16.md`, `ARCHITECTURE_16.md`
**Source Files Inspected**:
- `packages/domain/src/models/Recording.ts`
- `apps/mobile/src/data/database.ts`
- `apps/mobile/src/data/migrations/v1_initial.ts` through `v4_add_session_favorites.ts`
- `apps/mobile/src/data/repositories/RecordingRepository.ts`
- `apps/mobile/src/services/SyncService.ts`
- `apps/mobile/src/screens/HistoryScreen.tsx`
- `apps/mobile/src/utils/csvExport.ts`
- `packages/middleware/src/service/ResearchNodeMiddleware.ts`

---

### 1. SQLite Migration v5: Correctly Structured (Additive Only, No Data Loss)

**PASS**

The proposed migration consists of two SQL statements:

1. `ALTER TABLE recordings ADD COLUMN blob_url TEXT DEFAULT NULL` -- This is a non-destructive, additive-only operation. SQLite supports `ADD COLUMN` without rebuilding the table. All existing rows receive `NULL` for the new column. No data loss.

2. The retroactive repair `UPDATE` (detailed in item 2 below).

The migration follows the same pattern as v2-v4 (exported string constant, registered in `database.ts`'s `MIGRATIONS` array at version 5). The migration runner in `database.ts:64-108` uses `execAsync` for the SQL and records the version in the `migrations` table, preventing re-application. Both statements are idempotent via SQLite semantics (`ADD COLUMN` on an existing column would fail, but the version tracking prevents re-execution).

**Migration version numbering is correct**: v4 is the latest applied migration, v5 is the next sequential version.

---

### 2. Data Migration for Existing Blob URLs in `file_path`: Safe

**PASS**

The retroactive repair:

```sql
UPDATE recordings
   SET blob_url = file_path, file_path = NULL
 WHERE file_path LIKE 'http://%' OR file_path LIKE 'https://%';
```

This is safe because:

- **No false positives**: Local filesystem paths on Android always start with `file:///` or `/data/...`. On iOS they start with `file:///var/...`. The app never stores relative paths beginning with `http`. The `LIKE 'http://%'` and `LIKE 'https://%'` patterns exclusively match blob URLs that were incorrectly written by the current broken SyncService behavior (line 268: `await this.recordingRepo.update(recording.id, { filePath: uploadResponse.fileUrl })`).

- **Atomic operation**: The `UPDATE` copies the value to `blob_url` and clears `file_path` in a single statement, so there is no intermediate state where neither field holds the URL.

- **Idempotent**: Running the UPDATE a second time would match zero rows (since `file_path` was already set to NULL for repaired rows).

- **Timing**: The migration runs in `DatabaseManager.runMigrations()` during `initialize()`, which executes on app startup before any screen renders or service starts. No race condition with export or sync.

---

### 3. SyncService Changes: Backward Compatible

**PASS**

The proposed change replaces lines 260-269 of `SyncService.ts`:

**Current behavior** (broken):
```typescript
await this.recordingRepo.update(recording.id, { filePath: uploadResponse.fileUrl });
```

**Proposed behavior** (fixed):
```typescript
await this.recordingRepo.update(recording.id, { blobUrl: uploadResponse.fileUrl });
// ... delete local file ...
await this.recordingRepo.update(recording.id, { filePath: undefined });
```

Backward compatibility is maintained because:

- The `syncRecordings()` method's external contract (sync pending recordings with synced parents) does not change. The method still calls the same middleware endpoints (`POST /api/ClinicalSession/{sid}/recordings/New` and `POST /api/Upload/recording`).

- The `syncStatus` lifecycle (`pending` -> `synced` / `failed`) is unchanged.

- The `retryWithBackoff` wrapper and error handling remain identical.

- No changes to `syncSessions()` or `syncAnnotations()`.

**Crash safety ordering is correct**: The architecture doc specifies storing `blobUrl` before deleting the local file, then clearing `filePath`. This ensures at least one source (local or remote) is always available if the process crashes mid-operation. Verified: this ordering prevents the scenario where `blobUrl` is not yet saved but the file is already deleted.

**Minor observation (non-blocking)**: The two `update()` calls (one for `blobUrl`, one for `filePath`) could be collapsed into a single call (`{ blobUrl: uploadResponse.fileUrl, filePath: undefined }`), but the architecture doc explicitly justifies keeping them separate for crash-safety clarity. This is acceptable.

---

### 4. Blob Fetch Authentication: Uses Existing Middleware Session (or Not Required)

**PASS**

The project brief (Section 6, Dependencies) states: "Assumes the blob URL returned by `POST /api/Upload/recording` remains accessible via unauthenticated GET." The architecture doc (Section 4.6) confirms this and provides a forward reference for adding Bearer token authentication if the assumption changes.

I verified the middleware's `invoke` method signature in `ResearchNodeMiddleware.ts:46-50` (`InvokeOptions` with `path`, `method`, `payload`). If authentication were needed for blob downloads, `FileSystem.downloadAsync` supports custom headers, and the middleware's session token could be passed. However, this is not needed for the current implementation.

The architecture doc correctly documents the unauthenticated access assumption and the escape hatch for future hardening. This is technically sound.

---

### 5. Error Handling: Covers Network Failures, Partial Exports

**PASS**

The proposed `resolveRecordingContent()` function in `HistoryScreen.tsx` handles five distinct scenarios:

| Scenario | Handling |
|----------|----------|
| Local file exists | Read from disk (unchanged behavior) |
| Local file missing + blob URL + online | Download via `FileSystem.downloadAsync`, read temp file, delete temp |
| Local file missing + blob URL + offline/network error | `# Recording data is on server (offline)\n` |
| Local file missing + blob URL + HTTP error (non-200) | `# Failed to download recording from server\n` |
| Neither `filePath` nor `blobUrl` available | `# No recording data available\n` |

Key observations:

- **No crash risk**: Each error case produces a placeholder string rather than throwing. The export proceeds with partial data (informative placeholders per recording) rather than aborting entirely.

- **Memory safety**: Uses `FileSystem.downloadAsync()` to stream to a temp file in `cacheDirectory` rather than `fetch()` which would load the entire CSV into the JS heap. Temp file is deleted after reading. This matches the existing sequential-read pattern for local files (lines 219-234).

- **Temp file cleanup**: The `deleteAsync` call uses `{ idempotent: true }` and is called in both success and HTTP error paths. In the catch block (network failure), the temp file may not exist, but `deleteAsync` with `idempotent: true` handles that gracefully.

- **No silent failures**: Each error path produces distinct, human-readable placeholder text that helps the user understand why the recording data is missing.

---

### 6. No Breaking Changes to Existing Functionality

**PASS**

Verified the following existing functionality is unaffected:

- **Domain types**: Adding `blobUrl?: string` to `Recording` and `NewRecordingData` is a non-breaking additive change. The field is optional, so all existing consumers (CaptureScreen, SessionRepository, AnnotationRepository, SyncService mappers) remain valid without modification.

- **RecordingRepository**:
  - `RecordingRow` interface gains `blob_url: string | null` (matches SQLite column).
  - `mapRowToRecording()` adds `blobUrl: row.blob_url ?? undefined` (new field, does not affect existing fields).
  - `update()` adds a new `if (data.blobUrl !== undefined)` block (does not affect existing field handlers).
  - `create()` adds `blob_url` to the INSERT column list and parameter list. The `recordings` table gains the column via migration, so the INSERT is consistent.
  - All existing query methods (`getById`, `getAll`, `getBySession`, `getPending`, `getPendingWithSyncedParent`) use `SELECT *`, which automatically includes the new `blob_url` column. No query changes needed.

- **csvExport.ts**: The `exportSessionAsZip()` function's interface is unchanged. It receives pre-read `csvContents: string[]`, which are now resolved by the caller (HistoryScreen) using the new local-first + blob-fallback logic. The utility itself is not modified.

- **HistoryScreen export flow**: The existing export button, loading state (`exportingSessionId`), and share flow are unchanged. Only the CSV content resolution loop (lines 219-234) is replaced with the new `resolveRecordingContent()` helper.

- **Sync cycle**: Session sync and annotation sync are untouched. Recording sync modifies only the post-upload block. The sync status lifecycle, retry logic, and dependency ordering remain identical.

---

### Additional Observations (Non-Blocking)

**S1**: The `resolveRecordingContent` function uses string concatenation for the temp file path (`FileSystem.cacheDirectory + 'tmp_' + rec.id + '.csv'`). If `cacheDirectory` does not end with a trailing slash on some platforms, this could produce an invalid path. Recommend using a path join or ensuring the trailing slash: `FileSystem.cacheDirectory + 'tmp_' + rec.id + '.csv'` -- in practice, Expo's `cacheDirectory` always ends with `/`, so this is safe but worth a defensive check.

**S2**: The architecture doc mentions that the two `update()` calls in SyncService could be collapsed into one. If collapsed, the crash-safety argument still holds (single atomic DB write sets both fields before file deletion). Consider this as a follow-up simplification.

**S3**: No automated tests are proposed. The testing strategy relies on manual verification (8 scenarios listed in Architecture Section 8). This is acceptable for the current project maturity but should be flagged for future test coverage.

---

### Verdict

All six validation criteria pass. The proposed architecture is technically sound, backward compatible, and crash-safe. The SQLite migration is additive-only with a safe retroactive repair step. The SyncService changes correctly decouple local file paths from remote blob URLs. The export handler covers all error scenarios with informative fallback messages. No breaking changes to existing functionality.

[VERDICT:APPROVED]

---

## PM (Product Manager) Validation

**Reviewer**: PM
**Documents Reviewed**: `PROJECT_BRIEF_16.md`, `ARCHITECTURE_16.md`, `backlog.json`

### Business Alignment

**PASS** — The architecture directly addresses the core business problem: researchers cannot export synced session data. The design preserves both the local CSV path and blob URL as separate fields, enabling export in all scenarios (pre-sync, post-sync online, post-sync offline with graceful degradation).

### Acceptance Criteria Coverage

**PASS** — All 7 acceptance criteria from the brief are addressed:
1. New recordings store paths correctly (SyncService changes)
2. Synced session export fetches from blob URL (HistoryScreen changes)
3. Unsynced session export unchanged (local file path still works)
4. Retroactive data migration handles pre-existing broken records (v5 SQL UPDATE)
5. Offline export shows informative message (error handling in resolveRecordingContent)
6. Storage reclamation preserved (local file still deleted after upload)
7. No sync regression (only post-upload storage logic changes)

### User Experience

**PASS** — The export flow remains identical from the user's perspective. The only visible change is that synced sessions now produce valid CSVs in the ZIP instead of placeholder text. Offline export gracefully degrades with a clear message rather than silently failing.

### Risk Assessment

**PASS** — All identified risks have appropriate mitigations. The retroactive migration is safe (URL pattern matching cannot produce false positives against local file paths). No new dependencies are required.

### Verdict

The design fully satisfies the business objective and acceptance criteria. The fix is focused, backward compatible, and handles edge cases appropriately.

[VERDICT:APPROVED]
