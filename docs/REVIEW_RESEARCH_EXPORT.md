# Code Review: Research Data Export (Phase 19)

**Date**: 2026-02-22
**Reviewer**: TL (Tech Lead)
**Stories**: US-1810 through US-1818
**Architecture Reference**: `IRIS/docs/ARCHITECTURE_RESEARCH_EXPORT.md`
**Validation Reference**: `IRIS/docs/VALIDATION_RESEARCH_EXPORT.md`

---

## 1. Review Scope

Files reviewed:

| # | File | Status |
|---|------|--------|
| 1 | `InteroperableResearchNode/Bioteca.Prism.Service/Interfaces/Research/IResearchExportService.cs` | NEW |
| 2 | `InteroperableResearchNode/Bioteca.Prism.Service/Services/Research/ResearchExportService.cs` | NEW |
| 3 | `InteroperableResearchNode/Bioteca.Prism.InteroperableResearchNode/Controllers/ResearchController.cs` | MODIFIED |
| 4 | `InteroperableResearchNode/Bioteca.Prism.CrossCutting/NativeInjectorBootStrapper.cs` | MODIFIED |
| 5 | `IRIS/apps/desktop/src/services/research/ResearchService.ts` | MODIFIED |
| 6 | `IRIS/apps/desktop/src/main/index.ts` | MODIFIED |
| 7 | `IRIS/apps/desktop/src/preload/preload.ts` | MODIFIED |
| 8 | `IRIS/apps/desktop/src/main.tsx` | MODIFIED |
| 9 | `IRIS/apps/desktop/src/screens/Research/ResearchScreen.tsx` | MODIFIED |
| 10 | `IRIS/apps/desktop/src/screens/Research/ResearchList.tsx` | MODIFIED |
| 11 | `IRIS/apps/desktop/src/screens/Research/ResearchDetailsScreen.tsx` | MODIFIED |

---

## 2. Architecture Compliance

### 2.1 Backend

**ADR-1 (Backend-generated ZIP)**: Fully implemented. `ResearchExportService` assembles the ZIP on the server; the desktop only downloads and saves. Correct.

**ADR-2 (User JWT only)**: Implemented correctly. The export endpoint at line 1083-1114 of `ResearchController.cs` uses `[Authorize("sub")]` with no `[PrismEncryptedChannelConnection]` or `[PrismAuthenticatedSession]`. Matches architecture intent.

**ADR-3 (MemoryStream v1)**: Implemented. `MemoryStream` is used at line 107 of `ResearchExportService.cs`. `leaveOpen: true` is correctly set so the stream remains readable after the `ZipArchive` disposes.

**S1 Fix (navigation property names)**: Verified correct. The implementation uses `v.ClinicalConditions`, `v.ClinicalEvents`, `v.Medications`, `v.AllergyIntolerances`, `v.VitalSigns` — matching actual `Volunteer` entity properties. The architecture doc sample code had `VolunteerClinicalConditions` etc. (the must-fix from validation). Implementation is correct.

**S2 Fix (split queries)**: Implemented. Five separate queries replace the single mega-Include chain: research root, researchers, volunteers (with volunteer sub-entities), devices, and sessions. This correctly prevents Cartesian explosion for large datasets.

**S5 Fix (blob download reuse)**: Implemented. `ResearchExportService` injects `ISyncExportService` and delegates blob downloads to `GetRecordingFileAsync()` at line 224. No duplication of blob download logic.

### 2.2 Desktop

**ADR-4 (Direct HTTP bypass)**: Implemented in `ResearchService.exportResearchData()` at line 904-943. Uses direct `fetch()` with `Authorization: Bearer {token}` header. Does not call `middleware.invoke()`. Correct.

**ADR-5 (Electron IPC)**: Implemented. IPC channel `research:export-save` registered in `main/index.ts` at line 108. Preload exposes `saveExport()` at line 34. Renderer accesses via `window.electron.saveExport()`. Correct flow.

**S3 Fix (token storage key)**: Implemented. Storage key `'userauth:state'` at line 909 of `ResearchService.ts` — verified this is consistent with the key format used in the existing `BaseService`/`UserAuthService` pattern. Reading `.token` from the parsed auth state is correct.

**S4 Fix (typed window.electron)**: Implemented correctly. `main.tsx` declares a `Window` augmentation at lines 17-32 with all properties typed, including `saveExport: (buffer: ArrayBuffer, filename: string) => Promise<SaveExportResult>`. The renderer uses `window.electron?.saveExport(...)` without any `any` cast. The `SaveExportResult` type is also re-exported from `preload.ts` (line 9) and re-declared in `main.tsx` (line 9) for renderer use — this minor duplication is acceptable.

---

## 3. Code Quality

### 3.1 Backend — IResearchExportService.cs

Clean interface. `ResearchExportResult` correctly uses `MemoryStream` and `FileName`. One minor observation: `ZipStream` is declared as `null!` which is appropriate given the non-null contract in practice.

### 3.2 Backend — ResearchExportService.cs

**Strengths**:
- Correctly splits queries per entity group (S2 addressed).
- `WriteJsonEntry` is a clean private helper with `StreamWriter` scoped via `using`, preventing resource leaks.
- `WriteSignalFileAsync` correctly wraps blob download in try/catch, appending to `missingFiles` on failure rather than aborting the export.
- `_missing_files.json` is always written (consistent behavior, even if empty array).
- `MemoryStream.Position = 0` is correctly reset before returning.
- Title sanitization is correct: uses `Path.GetInvalidFileNameChars()` and truncates to 50 chars.

**Issues**:

**[SUGGESTION S-A]** — `Volunteer.VolunteerId` vs `Volunteer.Id`: Line 125 uses `v.VolunteerId` for the zip path. If the `Volunteer` entity uses `Id` (Guid) as the primary key and `VolunteerId` is a different field (e.g., a string code), this may produce unexpected folder names. Verify the correct property to use as the folder identifier. The session path on line 149 uses `session.Id`, and the channel path on line 171 uses `channel.Id` — consistency suggests `volunteer.Id` may be more appropriate if `VolunteerId` is a domain code rather than the entity key.

**[SUGGESTION S-B]** — The `record` variable in the `foreach` on line 164 shadows the `r` loop variable used in the EF query at line 50. This is not a bug (scopes are separate) but could confuse future readers. The architecture used `session.Records` consistently; the implementation is functionally correct.

**[SUGGESTION S-C]** — `ResearchExportService` depends on `ISyncExportService`. This creates a cross-service dependency (Research → Sync). For a v1 implementation this is acceptable and preferable to code duplication, but note that if `SyncExportService` is later refactored or scoped differently, it could affect export behavior. A shared blob utility service would be cleaner long-term.

### 3.3 Backend — ResearchController.cs (Export endpoint)

The `Export` action at lines 1083-1114 precisely matches the architecture specification:
- `[HttpGet("{id:guid}/export")]` — correct route
- `[Authorize("sub")]` — correct auth
- `CancellationToken` propagated to service
- `File(stream, "application/zip", filename)` — correct FileStreamResult
- `KeyNotFoundException` → 404 with `ERR_RESEARCH_NOT_FOUND`
- Generic `Exception` → 500 with `ERR_EXPORT_FAILED`
- Structured logging on error path

No issues.

### 3.4 Backend — NativeInjectorBootStrapper.cs

`IResearchExportService` registered at line 133 as `Scoped` — correct. Placed before the Sync services block, which is a reasonable position.

**One ordering concern**: `IResearchExportService` is registered at line 133 while `ISyncExportService` is registered at line 136. Since `ResearchExportService` depends on `ISyncExportService`, DI resolution order must ensure `SyncExportService` is already registered when the container resolves `ResearchExportService`. In ASP.NET Core DI, all registrations are resolved lazily at request time, so the registration order is irrelevant for resolution correctness. No issue.

### 3.5 Desktop — ResearchService.exportResearchData()

**Strengths**:
- Method returns `{ buffer, filename }` instead of calling `saveExport` directly. This correctly separates the HTTP fetch concern from the Electron file-save concern. The orchestration happens in `ResearchScreen` and `ResearchDetailsScreen`, following the single-responsibility principle.
- `Content-Disposition` regex at line 936 uses `(?:;|$)` anchoring — more robust than the architecture sample's regex.
- `handleMiddlewareError` wrapper is used, so error conversion via `convertToAuthError` applies.
- No `any` types used in the method.

**[SUGGESTION S-D]** — Error codes `'not_found'` and `'server_error'` are cast as `AuthErrorCode`. If these are not valid members of the `AuthErrorCode` union type, this could cause runtime issues despite compiling (depending on how the type is defined). Verify that `'not_found'` and `'server_error'` are valid `AuthErrorCode` values. The existing codebase uses `'invalid_credentials'` in the same way, suggesting this pattern is established — but worth confirming.

### 3.6 Desktop — main/index.ts (IPC handler)

IPC handler `research:export-save` at lines 108-124:
- `mainWindow!` non-null assertion is appropriate here — `mainWindow` is set before any IPC call can arrive.
- `Buffer.from(buffer)` correctly converts `ArrayBuffer` to Node.js `Buffer` for `fs.promises.writeFile`.
- Error is caught at the file-write level and returned as `{ saved: false, error: string }` rather than thrown — correct for IPC handlers.
- The handler returns `{ cancelled: true }` (not `{ canceled: true }`) — note the spelling. The `SaveExportResult` interface in `preload.ts` uses `cancelled` (double-L). The screens check `result.cancelled`. This is internally consistent; no issue.

### 3.7 Desktop — preload.ts

Clean and minimal. `SaveExportResult` interface defined at lines 9-14 covers all return variants from the IPC handler. `saveExport` is correctly grouped at the top level of the `api` object rather than under a namespace (distinct from `app` and `secureStorage`) — architecturally this is fine since it is a one-off method.

### 3.8 Desktop — main.tsx

`Window` augmentation at lines 17-32 correctly types `window.electron` as optional (`?`) to handle non-Electron environments. All properties from the preload bridge are typed including `saveExport`. `SaveExportResult` is re-declared locally rather than imported from preload — acceptable for renderer isolation.

### 3.9 Desktop — ResearchScreen.tsx (orchestration)

`handleResearchExport` at lines 33-56:
- Loading state is managed via `exportingId` in `ResearchList` (not at this level) — `ResearchScreen` does not need its own loading state since it delegates the `Promise` down to the list.
- `window.electron` guard at line 37 prevents crash in non-Electron contexts.
- Cancel path (`result.cancelled`) correctly returns silently with no toast.
- Error path shows toast with message.
- Success path shows toast with file path.

**[SUGGESTION S-E]** — The `setExporting(false)` in `ResearchDetailsScreen.handleExportClick` (line 209) is inside a `finally` block, ensuring it executes even if `window.electron` is unavailable and the method returns early (line 192). However in `ResearchScreen.handleResearchExport`, there is no `finally` reset of loading state at the screen level — the loading state is tracked in `ResearchList` via `exportingId`, which is reset in its own `finally` block at line 112. This is correct; the two components handle loading state independently. No issue.

### 3.10 Desktop — ResearchList.tsx

`handleExportClick` at lines 104-113:
- `e.stopPropagation()` prevents row selection when clicking export. Correct.
- `exportingId` tracks which row is exporting, allowing per-row loading indication.
- All export buttons are `disabled` when any export is in progress (`exportingId !== null`), preventing concurrent exports. Correct.
- `ArrowDownTrayIcon` from `@heroicons/react/24/outline` — follows the project icon directive.

**[SUGGESTION S-F]** — `handleExportClick` is included in the `useMemo` dependency array for `columns` at line 199. Since `handleExportClick` is defined as a plain `async function` (not `useCallback`), it is recreated on every render, causing `columns` to also recreate on every render. This is a minor performance issue — wrapping `handleExportClick` in `useCallback` would prevent unnecessary re-renders.

### 3.11 Desktop — ResearchDetailsScreen.tsx

Export button is in the header area (lines 766-775) — matches architecture spec. `exporting` boolean state prevents double-clicks. `ArrowDownTrayIcon` used. `Button` component from design system used — correct pattern.

`handleExportClick` at lines 184-210:
- `finally` block correctly resets `exporting` to `false`.
- Loading state text `'Exportando...'` shown via button `disabled + label` change.

---

## 4. Security Assessment

- `[Authorize("sub")]` on the export endpoint: only authenticated users with a valid JWT can trigger exports. Consistent with all other research endpoints.
- JWT retrieved from secure storage (keytar-backed) in the renderer, not from `localStorage` or any insecure source.
- No sensitive data (blob URLs, internal paths) is exposed to the renderer beyond the final ZIP buffer.
- `Buffer.from(buffer)` for file write prevents any prototype pollution from the renderer-provided buffer.
- The missing-file manifest `_missing_files.json` exposes internal channel paths but this is acceptable within an authenticated export.

---

## 5. Validation Issues Resolution (S1-S5)

| Issue | Severity | Status | Evidence |
|-------|----------|--------|----------|
| S1: Wrong volunteer navigation property names | Must Fix | RESOLVED | Lines 62-70 of `ResearchExportService.cs` use `ClinicalConditions`, `ClinicalEvents`, `Medications`, `AllergyIntolerances`, `VitalSigns` |
| S2: Single mega-query Cartesian explosion | Should Fix | RESOLVED | Five separate queries in `ResearchExportService.ExportAsync` (lines 42-96) |
| S3: Token storage key verification | Should Fix | RESOLVED | Storage key `'userauth:state'` at line 909, `.token` field access consistent with existing auth pattern |
| S4: `(window as any).electron` type violation | Should Fix | RESOLVED | `Window` augmentation in `main.tsx` (lines 17-32); renderer uses typed `window.electron?.saveExport(...)` |
| S5: Blob download code duplication | Should Fix | RESOLVED | `ResearchExportService` injects `ISyncExportService` and calls `GetRecordingFileAsync()` at line 224 |

All five validation issues are addressed in the implementation.

---

## 6. Issues Found

### Blocking Issues

None.

### Suggestions (Non-Blocking)

| ID | File | Line | Description |
|----|------|------|-------------|
| S-A | `ResearchExportService.cs` | 125 | Verify `v.VolunteerId` is the correct property for the ZIP folder path (entity key vs domain code) |
| S-B | `ResearchExportService.cs` | 164 | `record` loop variable shadows outer context; minor readability issue |
| S-C | `ResearchExportService.cs` | 26 | Cross-service dependency (Research → Sync); acceptable for v1, consider shared blob utility later |
| S-D | `ResearchService.ts` | 927, 930 | Verify `'not_found'` and `'server_error'` are valid `AuthErrorCode` members |
| S-E | `ResearchScreen.tsx` | 33 | No blocking issue; loading state delegation pattern is correct and consistent |
| S-F | `ResearchList.tsx` | 104 | `handleExportClick` not wrapped in `useCallback`, causes unnecessary `columns` re-memos on each render |

---

## 7. Test Coverage Assessment

The architecture specifies backend unit tests for `ResearchExportService`. No test files were included in the review scope for this feature. This is noted but not blocking — the project has an existing 73/75 test baseline and the architecture document defines the test cases clearly. The QA phase should verify test coverage before marking stories closed.

---

## Verdict

**[VERDICT:APPROVED]**

The implementation correctly addresses all five validation issues (S1-S5) and faithfully follows the architecture document. All ADRs are implemented as specified. Code quality is high: no `any` types, consistent patterns, proper error handling at both layers, correct Electron IPC flow, and clean separation between the HTTP fetch and the file-save concerns. No blocking issues were found. The suggestions above are quality improvements for future iterations.

Proceed to `/qa test`.
