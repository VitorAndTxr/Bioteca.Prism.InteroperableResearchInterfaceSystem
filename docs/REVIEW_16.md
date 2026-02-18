# Code Review — Phase 16: Fix Session Data Export for Synced Recordings

> Phase 16 output — Tech Lead leads review.

## Review Summary

**Date:** 2026-02-18
**Reviewer:** Tech Lead
**Overall verdict:** PASS WITH SUGGESTIONS

---

## Architecture Compliance

| Component | Matches Design | Notes |
|-----------|---------------|-------|
| Domain model (`Recording.ts`) | Yes | `blobUrl?: string` added to both `Recording` and `NewRecordingData` as specified |
| SQLite migration v5 | Yes | `ALTER TABLE ADD COLUMN` + retroactive URL repair, exactly as designed |
| Migration registration (`database.ts`) | Yes | v5 registered at correct position, import added |
| `RecordingRepository` | Yes | `blob_url` added to `RecordingRow`, mapper, `create()`, and `update()` |
| `SyncService` — crash-safe ordering | Yes | blobUrl stored → local file deleted → filePath cleared to NULL |
| `HistoryScreen` — local-first + blob fallback | Yes | `resolveRecordingContent()` correctly implements the 3-case logic |
| Error handling strategy | Yes | Distinguishes offline vs. HTTP-error vs. no-data cases with informative placeholders |
| No new dependencies introduced | Yes | Uses existing `expo-file-system` |

---

## Issues Found

### Blocking Issues

_None._

---

### Suggestions (non-blocking improvements)

#### S-001: `cacheDirectory` may be `null` at runtime

- **File:** `apps/mobile/src/screens/HistoryScreen.tsx:141`
- **Category:** Correctness
- **Description:** `FileSystem.cacheDirectory` is typed as `string | null` in `expo-file-system`. Concatenating it directly with a filename without a null guard can produce `"nulltmp_<id>.csv"` as the path, which would cause a silent, hard-to-diagnose failure on `downloadAsync`.
- **Recommendation:** Guard before use:
  ```typescript
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
      return '# No recording data available\n';
  }
  const tmpPath = cacheDir + `tmp_${rec.id}.csv`;
  ```

#### S-002: Temp file may leak on read failure after successful download

- **File:** `apps/mobile/src/screens/HistoryScreen.tsx:144–154`
- **Category:** Code quality
- **Description:** If `readAsStringAsync` throws after a successful `downloadAsync` (status 200), execution jumps to the `catch` block and returns the offline message — but `deleteAsync(tmpPath)` is never called. The temp file remains in `cacheDirectory` until the OS clears it. For large CSVs this could accumulate.
- **Recommendation:** Use a `finally` block for cleanup:
  ```typescript
  const tmpPath = cacheDir + `tmp_${rec.id}.csv`;
  let downloaded = false;
  try {
      const download = await FileSystem.downloadAsync(rec.blobUrl, tmpPath);
      downloaded = true;
      if (download.status === 200) {
          const content = await FileSystem.readAsStringAsync(tmpPath, {
              encoding: FileSystem.EncodingType.UTF8,
          });
          return content;
      }
      return '# Failed to download recording from server\n';
  } catch {
      return '# Recording data is on server (offline)\n';
  } finally {
      if (downloaded) {
          await FileSystem.deleteAsync(tmpPath, { idempotent: true }).catch(() => {});
      }
  }
  ```

#### S-003: `update()` with `filePath: undefined` relies on an implicit type coercion

- **File:** `apps/mobile/src/services/SyncService.ts:272–274`
- **Category:** Code quality / Convention
- **Description:** Passing `filePath: undefined` to `update()` works correctly because the repository's `update()` method handles `undefined` as "set to NULL". However, this is subtle — a future reader might not know whether `undefined` means "don't update this field" or "set to NULL". The architecture doc (§4.4) notes this with a comment, but the code comment is terse.
- **Recommendation:** The existing comment `// Clear local path (maps to NULL in DB)` is adequate. No code change required, but consider adding a brief note to the repository JSDoc for `update()` to document that passing `undefined` for a nullable field sets it to NULL.

#### S-004: `syncStatus: 'synced'` marker written after file operations that can partially fail

- **File:** `apps/mobile/src/services/SyncService.ts:283`
- **Category:** Architecture
- **Description:** `syncStatus: 'synced'` is written after the entire `retryWithBackoff` block. If `blobUrl` was successfully stored but `filePath` was not cleared (e.g., the second `update()` call threw), the recording is still marked as `synced`. On the next export it will correctly fall through to the blob URL, so the data is accessible. However, the partial state (blobUrl set, filePath still set to its old value) is technically an inconsistency.
- **Recommendation:** This is acceptable given the crash-safety ordering already designed (§4.4 — "at least one source survives a crash"). The existing behavior is correct. Documenting the known partial state in the code comment would suffice.

---

## Convention Adherence

| Convention | Followed | Notes |
|-----------|---------|-------|
| TypeScript strict mode — no `any` | Yes | All types are explicit throughout the changeset |
| Naming conventions (camelCase domain, snake_case DB rows) | Yes | `blobUrl` (domain), `blob_url` (DB row), consistent throughout |
| Error handling pattern | Yes | No swallowed exceptions; informative fallback strings returned |
| Path alias `@/` for internal imports | Yes | All new `HistoryScreen` imports use `@/` alias |
| Self-documenting names | Yes | `resolveRecordingContent`, `blob_url`, `tmpPath` are clear |
| Single-responsibility functions | Yes | `resolveRecordingContent` extracted cleanly from `handleExportSession` |
| No magic numbers | Yes | Status code `200` is the only literal; acceptable for HTTP semantics |
| Comments explain "why" | Yes | SyncService crash-safety ordering comment is clear and accurate |

---

## Detailed File Findings

### `packages/domain/src/models/Recording.ts`

Clean additive change. `blobUrl?: string` added with a JSDoc-style inline comment to both interfaces. Non-breaking for all existing consumers. Comment "Remote blob storage URL (set after sync, NULL before)" accurately describes the field semantics.

### `apps/mobile/src/data/migrations/v5_add_blob_url.ts`

SQL is correct. `ALTER TABLE recordings ADD COLUMN blob_url TEXT DEFAULT NULL` is safe in SQLite (non-destructive, existing rows get NULL). The retroactive `UPDATE` correctly targets only rows where `file_path` was overwritten with an HTTP URL by the old SyncService behavior. The `LIKE 'http://%' OR LIKE 'https://%'` pattern is sound — local paths on Android/iOS always start with `file:///` or `/data/...`.

The migration template is a plain SQL string exported as a constant, consistent with all prior migrations (v1–v4). No issues.

### `apps/mobile/src/data/database.ts`

Import and array registration are correct and follow the exact same pattern as v1–v4. Version number 5 is correct. No issues.

### `apps/mobile/src/data/repositories/RecordingRepository.ts`

All four touch points are correctly updated:
- `RecordingRow`: `blob_url: string | null` added.
- `mapRowToRecording()`: `blobUrl: row.blob_url ?? undefined` — correctly converts SQL NULL to `undefined` (not `null`), preserving domain type consistency.
- `create()`: `blob_url` added to INSERT with 11-column parameter list. Parameter count matches column count.
- `update()`: Dynamic field builder correctly handles `blobUrl !== undefined` with `data.blobUrl ?? null` conversion.

The `update()` method taking `Partial<Recording>` means callers pass `filePath: undefined` to clear the value. This works because the check is `!== undefined`, so passing `undefined` explicitly is still caught. Correct.

### `apps/mobile/src/services/SyncService.ts`

The crash-safe ordering is correctly implemented (lines 261–274):
1. `update(id, { blobUrl })` — persists remote URL first
2. `FileSystem.deleteAsync(filePath)` — deletes local file (non-fatal catch)
3. `update(id, { filePath: undefined })` — clears local path to NULL

This matches ARCHITECTURE_16.md §4.4 exactly. The `try/catch` around `deleteAsync` is appropriate — local cleanup failure must not block the sync transaction.

One observation: `syncStatus: 'synced'` is written at line 283 regardless of whether the `filePath` clear succeeded. This is correct behavior because export still works via `blobUrl`, but the recording technically has an inconsistent state. This is a low-severity observation and does not affect correctness (see S-004).

### `apps/mobile/src/screens/HistoryScreen.tsx`

`resolveRecordingContent` (lines 127–159) is correctly extracted as a module-level async function, which avoids it being unnecessarily recreated on each render. The 3-case logic matches the approved design exactly.

One correctness concern: `FileSystem.cacheDirectory` can be `null` (see S-001). The remaining code is well-structured. The function is properly integrated into `handleExportSession` via the sequential `for...of` loop (lines 258–261), which is correct for sequential I/O without overwhelming the file system.

---

## Security Assessment

- No credential or token leakage: blob URLs are treated as opaque strings, never logged.
- No URL validation on `blobUrl` before passing to `downloadAsync`. Given the URL originates from the backend (trusted source stored in SQLite), this is acceptable — no user-supplied URLs are involved.
- The migration's `LIKE` pattern cannot be manipulated by an attacker since it runs once at DB initialization time on locally-stored data.
- Temp file path is deterministic (`tmp_<uuid>.csv`) but this is acceptable for a `cacheDirectory` context that is app-sandboxed.

---

## Next Steps

- S-001 is the highest-priority suggestion — `FileSystem.cacheDirectory` null guard should be addressed before the feature ships to production to avoid a silent runtime failure on edge-case device configurations. It is non-blocking for this review cycle but recommended.
- S-002 (temp file leak on read failure) is a minor quality improvement and can be addressed in a follow-up.
- S-003 and S-004 are documentation-only suggestions, no code changes required.

Proceed to `/qa test`.

---

[GATE:PASS]

The implementation correctly and completely addresses the root cause identified in the problem statement. All six modified files match the approved architecture in ARCHITECTURE_16.md. TypeScript strict compliance is maintained throughout. Crash-safe ordering in SyncService prevents data loss. The local-first + blob fallback export logic is sound. No blocking issues were found.
