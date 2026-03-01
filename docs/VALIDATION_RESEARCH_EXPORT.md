# Validation: Research Data Export (Phase 19)

**Date**: 2026-02-22
**Validator**: PM (Product Manager)
**Status**: APPROVED
**Documents Reviewed**:
- `IRIS/docs/PROJECT_BRIEF_RESEARCH_EXPORT.md`
- `IRIS/docs/ARCHITECTURE_RESEARCH_EXPORT.md`
- Backlog stories US-1810 through US-1818

---

## 1. Business Objective Coverage

| # | Objective | Covered By | Verdict |
|---|-----------|-----------|---------|
| 1 | Export all data for a research project as a ZIP file | US-1810 (entity graph query), US-1811 (ZIP builder), US-1816/US-1817 (UI triggers) | PASS |
| 2 | Backend generates the ZIP; desktop triggers download via Electron dialog | US-1813 (backend endpoint), US-1814 (direct HTTP fetch), US-1815 (Electron IPC save) | PASS |
| 3 | Exported data is self-contained and human-readable (JSON + signal files) | US-1811 (camelCase pretty-printed JSON), US-1812 (signal files + missing manifest) | PASS |
| 4 | Export respects authorization | US-1813 AC: `[Authorize("sub")]` on endpoint, US-1814 AC: bearer token in header | PASS |

All four business objectives are fully addressed by the architecture and backlog stories. No objective is left uncovered.

---

## 2. Scope Alignment

The project brief defines clear in-scope and out-of-scope boundaries. The architecture and stories stay within these boundaries:

**In-scope items confirmed**: Backend service + endpoint, desktop UI triggers (list and detail), Electron save dialog, progress/loading states, toast notifications, signal file inclusion, missing file manifest.

**Out-of-scope items correctly excluded**: No selective export, no CSV/Excel formats, no bulk export, no scheduled exports, no SNOMED seed data, no mobile app export. None of the stories introduce scope creep beyond what the brief specifies.

---

## 3. Entity Graph Completeness

The entity graph in the project brief (Section 4) lists 15 entity types rooted at Research. The architecture's EF Core `.Include()` chain (Section 4.3) and the ZIP folder structure (Section 6) cover all 15:

- Research (root) -- research.json
- ResearchResearchers -> Researcher -- researchers/researchers.json
- ResearchVolunteers -> Volunteer -- volunteers/volunteers.json
- VolunteerClinicalConditions -- volunteers/{id}/clinical_conditions.json
- VolunteerClinicalEvents -- volunteers/{id}/clinical_events.json
- VolunteerMedications -- volunteers/{id}/medications.json
- VolunteerAllergyIntolerances -- volunteers/{id}/allergies.json
- VitalSigns (volunteer-level) -- volunteers/{id}/vital_signs.json
- Applications -- applications/applications.json
- ResearchDevices -> Device -> Sensors -- devices/ hierarchy
- RecordSessions -- sessions/{id}/session.json
- SessionAnnotations -- embedded in session.json
- Records -> RecordChannels -> TargetAreas -- records/ and channels/ hierarchy
- ClinicalEvents (session-scoped) -- sessions/{id}/clinical_events.json
- VitalSigns (session-scoped) -- sessions/{id}/vital_signs.json

No entity is missing from the graph traversal.

---

## 4. Acceptance Criteria Traceability

Each project brief acceptance criterion (Section 9) maps to at least one story:

| Brief AC | Story Coverage |
|----------|---------------|
| AC1: Click "Export" on list or detail screen | US-1816 (list), US-1817 (detail) |
| AC2: Save dialog for file location | US-1815 (Electron IPC handler) |
| AC3: ZIP contains all entities from Section 4 | US-1810 + US-1811 |
| AC4: JSON pretty-printed, camelCase | US-1811 AC7 |
| AC5: Signal files included; missing listed in manifest | US-1812 |
| AC6: Toast confirms success or failure | US-1817 AC5/AC7, US-1818 |
| AC7: Works for research with zero sessions | US-1811 (implicit: empty arrays) |
| AC8: Works for research with multiple sessions | US-1810 + US-1811 (eager load full graph) |

Full traceability achieved.

---

## 5. Story Dependency Chain

The dependency chain is well-structured and follows a logical build order:

```
US-1810 (entity graph query)
  -> US-1811 (ZIP builder)
    -> US-1812 (signal files + manifest)
      -> US-1813 (backend endpoint)
        -> US-1814 (desktop service method)
          -> US-1815 (Electron IPC)
            -> US-1816 (list button) + US-1817 (detail button)
              -> US-1818 (orchestration handler)
```

This is a clean linear chain with a single fan-out at the UI layer (US-1816 and US-1817 are independent siblings). No circular dependencies. The dependency order ensures each story can be developed and tested incrementally.

---

## 6. Risk Coverage

All four risks from the project brief (Section 8) are addressed:

| Risk | Mitigation in Architecture |
|------|---------------------------|
| Large ZIP files | ADR-3: Streaming via ZipArchive; v1 uses MemoryStream bounded by 50MB upload limit per file |
| Missing recording files | US-1812: `_missing_files.json` manifest, export continues on failure |
| Concurrent exports | Acknowledged as acceptable for v1 (infrequent, user-initiated) |
| Authorization bypass | ADR-2: `[Authorize("sub")]` on endpoint; JWT from secure storage |

---

## 7. Architecture Decision Review

The five ADRs are sound and well-justified from a business perspective:

**ADR-1 (Backend-generated ZIP)**: Correct -- keeps blob storage URLs private, reduces client complexity, matches the "backend generates" objective.

**ADR-2 (User JWT only)**: Correct -- this is a user-facing feature, not node-to-node. Encrypted channel middleware is incompatible with binary streams. HTTPS provides transport encryption.

**ADR-3 (MemoryStream for v1)**: Acceptable trade-off. The architecture acknowledges the limitation and provides a future optimization path (PipeWriter). Given the bounded file sizes (50MB upload limit), this is pragmatic.

**ADR-4 (Direct HTTP bypass)**: Correct -- middleware.invoke() encrypts payloads as JSON, which is incompatible with binary ZIP responses. Direct fetch with JWT header is the right approach.

**ADR-5 (Electron IPC)**: Standard Electron pattern. Context isolation requires main-process brokering for native dialogs. Well-documented and low-risk.

---

## 8. Minor Observations (Non-Blocking)

These are observations for awareness, not blockers:

1. **US-1812 AC3** specifies `_missing_files.json` is "always written (empty array if no missing files)." The project brief says "only if files were unavailable." The story's approach (always write) is actually better for consistency -- downstream tooling can always expect the file. No change needed, just noting the minor divergence from the brief.

2. **US-1817 AC5/AC7** use Portuguese labels ("Exportacao concluida", "Falha na exportacao"). This is consistent with the existing desktop app's user-facing language convention. No issue.

3. **Security note**: The architecture (Section 8) acknowledges no row-level authorization (i.e., "is this user assigned to this research?"). This matches the current backend authorization model. For production use, row-level security should be considered in a future phase, but it is correctly out of scope for v1.

---

## 9. Verdict

The architecture document and backlog stories comprehensively address all four business objectives defined in the project brief. The entity graph is complete, the acceptance criteria are fully traceable to stories, the dependency chain is logically ordered, and all identified risks have mitigations. The five ADRs are well-reasoned and appropriate for a v1 implementation.

**[VERDICT:APPROVED]**

---

## Technical Validation (TL)

**Reviewer**: TL (Tech Lead)
**Date**: 2026-02-22

### TL-1. Architecture Alignment with Codebase Patterns

**Backend patterns**: The architecture correctly follows established patterns:

- **Service layer**: `ResearchExportService` uses `PrismDbContext` directly with `AsNoTracking()` and eager loading, matching the `SyncExportService` pattern (`Bioteca.Prism.Service/Services/Sync/SyncExportService.cs`). This is the correct approach for read-only, cross-entity queries that bypass the generic repository pagination overhead.
- **DI registration**: `AddScoped<IResearchExportService, ResearchExportService>()` in `NativeInjectorBootStrapper.cs` follows the existing scoped service pattern used by all research data services (lines 90-95).
- **Controller integration**: Adding the `Export` action to the existing `ResearchController.cs` is correct. The controller already handles `{id:guid}` route patterns (e.g., `GetById`, `UpdateResearch`, `DeleteResearch`), so `{id:guid}/export` is consistent.
- **Error handling**: The `CreateError()` pattern with error codes (`ERR_RESEARCH_NOT_FOUND`, `ERR_EXPORT_FAILED`) matches existing controller conventions.
- **Blob access**: The architecture references `BlobServiceClient` for downloading signal files. The existing `SyncExportService.GetRecordingFileAsync()` already implements this exact pattern (connection string from `IConfiguration`, container name from config, URI parsing). The new service should reuse this logic or call `SyncExportService.GetRecordingFileAsync()` directly rather than duplicating the blob download code.

**Desktop patterns**: The architecture correctly follows established patterns:

- **ResearchService**: Adding `exportResearchData()` to the existing `ResearchService.ts` (`IRIS/apps/desktop/src/services/research/ResearchService.ts`) is correct. The service already extends `BaseService` with `middleware`, `storage`, and error handling.
- **IPC handlers**: The `dialog:saveFile` handler in `src/main/index.ts` follows the existing `ipcMain.handle()` pattern (secure storage handlers at lines 92-104). The naming convention `dialog:saveFile` is consistent with `secureStorage:get/set/remove` and `app:getVersion/getPath`.
- **Preload bridge**: Adding `dialog.saveFile()` to the `api` object in `src/preload/preload.ts` follows the existing pattern of grouping related methods under namespace objects (`app`, `secureStorage`).

### TL-2. ADR Review

| ADR | Assessment |
|-----|-----------|
| **ADR-1: Backend-generated ZIP** | APPROVED. Correct separation of concerns. Signal files in Azure Blob should not be exposed to the client. |
| **ADR-2: User JWT only (no encrypted channel)** | APPROVED. The `[PrismEncryptedChannelConnection]` middleware encrypts/decrypts JSON payloads and cannot handle binary ZIP streams. Using `[Authorize("sub")]` alone is the correct approach for user-facing binary endpoints. |
| **ADR-3: MemoryStream for v1** | APPROVED with note. Acceptable for v1 given the bounded size of research exports (signal files capped at 50MB by `FileUploadService`). The architecture correctly documents the future path to `Pipe`-based streaming. |
| **ADR-4: Direct HTTP bypass** | APPROVED. The middleware `invoke()` encrypts payloads with AES-256-GCM and expects encrypted JSON responses. A raw ZIP binary stream cannot flow through this channel. Direct `fetch()` with JWT header is correct. |
| **ADR-5: Electron IPC for file save** | APPROVED. `contextIsolation: true` is set in `src/main/index.ts:28`, so the renderer cannot access `dialog` directly. IPC is the standard Electron approach. |

### TL-3. Entity Graph Verification

**ISSUE FOUND (S1 - Must Fix)**: The architecture's sample EF Core Include chain uses incorrect navigation property names on the `Volunteer` entity.

The architecture specifies:
```csharp
.Include(r => r.ResearchVolunteers).ThenInclude(rv => rv.Volunteer)
    .ThenInclude(v => v.VolunteerClinicalConditions)
// ... same for VolunteerClinicalEvents, VolunteerMedications, VolunteerAllergyIntolerances
```

But the actual `Volunteer` entity (`Bioteca.Prism.Domain/Entities/Volunteer/Volunteer.cs`) has:
- `ClinicalConditions` (not `VolunteerClinicalConditions`)
- `ClinicalEvents` (not `VolunteerClinicalEvents`)
- `Medications` (not `VolunteerMedications`)
- `AllergyIntolerances` (not `VolunteerAllergyIntolerances`)
- `VitalSigns` (correct)

The correct Include chain must reference the actual property names. This would cause a compile error if copied verbatim.

**Full navigation property verification** (all confirmed against source):
- `Research.ResearchResearchers` -> `ResearchResearcher.Researcher` -- confirmed
- `Research.ResearchVolunteers` -> `ResearchVolunteer.Volunteer` -- confirmed
- `Volunteer.ClinicalConditions` (type: `VolunteerClinicalCondition`) -- confirmed at line 84
- `Volunteer.ClinicalEvents` (type: `VolunteerClinicalEvent`) -- confirmed at line 85
- `Volunteer.Medications` (type: `VolunteerMedication`) -- confirmed at line 86
- `Volunteer.AllergyIntolerances` (type: `VolunteerAllergyIntolerance`) -- confirmed at line 87
- `Volunteer.VitalSigns` -- confirmed at line 88
- `Research.Applications` -- confirmed at line 58
- `Research.ResearchDevices` -> `ResearchDevice.Device` -> `Device.Sensors` -- confirmed
- `Research.RecordSessions` -> `RecordSession.SessionAnnotations` -- confirmed at line 53
- `Research.RecordSessions` -> `RecordSession.Records` -> `Record.RecordChannels` -> `RecordChannel.TargetAreas` -- confirmed (RecordChannel.cs lines 33, 68)
- `RecordSession.ClinicalEvents` -- confirmed at line 56
- `RecordSession.VitalSigns` -- confirmed at line 57

### TL-4. Security Assessment

The `[Authorize("sub")]` without `[PrismEncryptedChannelConnection]` or `[PrismAuthenticatedSession]` is appropriate here. The architecture correctly explains this in ADR-2. Transport security is provided by HTTPS, and user identity is validated by the JWT.

The architecture acknowledges (Section 8) that v1 does not implement row-level authorization (checking if the requesting user is assigned to the specific research). This is consistent with all existing research endpoints in `ResearchController.cs`, which also use `[Authorize("sub")]` without per-research ownership checks. Acceptable for v1.

### TL-5. Performance Assessment

The single EF Core query with 12+ Include chains will produce a Cartesian explosion in the SQL JOIN. For a research with many volunteers, sessions, and records, this could result in large intermediate result sets. The architecture acknowledges this (Section 9) and proposes splitting queries as a future optimization.

**Recommendation (S2 - Should Fix)**: Consider splitting the entity graph into separate queries rather than one monolithic Include chain. This is what `SyncExportService` does -- it has separate methods (`GetVolunteersAsync`, `GetResearchAsync`, `GetSessionsAsync`) rather than a single mega-query. Suggested split:
1. Research + ResearchResearchers + ResearchVolunteers + ResearchDevices + Applications (shallow)
2. Per-volunteer: clinical sub-entities
3. Per-session: records, channels, target areas, annotations, clinical events, vital signs

This avoids the Cartesian product and is more resilient for large datasets.

### TL-6. Desktop Architecture Assessment

**Token retrieval (S3 - Should Fix)**: The architecture shows:
```typescript
const authState = await this.storage.getItem('userauth:state') as { token?: string } | null;
const token = authState?.token;
```

This should be verified against the actual `UserAuthService` or `AuthContext` implementation to confirm the storage key and token structure. The `BaseService` already has access to `this.storage` (from `MiddlewareServices`), so the approach is correct, but the exact storage key format must match.

**Type safety (S4 - Should Fix)**: The architecture shows `(window as any).electron.dialog.saveFile(...)`. Since `preload.ts` already exports `ElectronAPI` as a type (line 36), the renderer should use properly typed access. The `ElectronAPI` type should be updated to include the `dialog` namespace, and the cast should use the typed interface to maintain TypeScript strict mode compliance (project directive: no `any` types).

### TL-7. Blob Download Code Reuse (S5 - Should Fix)

The `SyncExportService.GetRecordingFileAsync()` already implements the full blob download pipeline: connection string from config, container name resolution, URI path parsing (removing account/container prefix), existence check, and download to byte array. Rather than duplicating this logic in `ResearchExportService`, the implementation should either:
- Extract the blob download logic into a shared utility method, or
- Inject `ISyncExportService` into `ResearchExportService` and call `GetRecordingFileAsync()` directly

This reduces duplication and ensures consistent blob path handling.

### TL-8. Issues Summary

| # | Severity | Description | Action |
|---|----------|-------------|--------|
| S1 | Must Fix | Volunteer navigation property names in Include chain are wrong (`VolunteerClinicalConditions` should be `ClinicalConditions`, etc.) | Fix in architecture doc and implementation |
| S2 | Should Fix | Single mega-query with 12+ Includes risks Cartesian explosion; split into separate queries like SyncExportService | Recommended for implementation |
| S3 | Should Fix | Token retrieval storage key must be verified against actual AuthContext/UserAuthService | Verify during implementation |
| S4 | Should Fix | `(window as any).electron` violates TypeScript strict mode; use typed ElectronAPI | Fix type cast |
| S5 | Should Fix | Blob download logic duplicates SyncExportService.GetRecordingFileAsync(); reuse or extract | Reduce duplication |

### TL-9. Verdict

The architecture is technically sound, well-documented, and follows existing codebase patterns. The ADRs are well-reasoned with correct justifications. The data flow, error handling, and security model are appropriate.

The one **must-fix** issue (S1) is a naming error in the sample code that would cause a compile error -- easy to fix during implementation. The should-fix items (S2-S5) are implementation-quality improvements that do not block development.

**[VERDICT:APPROVED]**

The architecture is approved for implementation with the S1 fix applied during development and S2-S5 as recommended improvements.
