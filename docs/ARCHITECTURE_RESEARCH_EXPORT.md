# Architecture: Research Data Export

**Date**: 2026-02-22
**Author**: TL (Tech Lead)
**Status**: DRAFT
**Phase**: 19
**Project Brief**: `IRIS/docs/PROJECT_BRIEF_RESEARCH_EXPORT.md`

---

## 1. Overview

This document describes the technical architecture for exporting a complete research project as a ZIP archive. The feature spans two layers: a new backend endpoint on `InteroperableResearchNode` that assembles and streams the ZIP, and a new desktop action in `IRIS/apps/desktop` that triggers the download and saves it via Electron.

The design prioritizes streaming over buffering to support large research datasets with many recording sessions and signal files.

---

## 2. Architecture Decision Records

### ADR-1: Backend-Generated ZIP (Not Client-Side Assembly)

**Decision**: The backend produces the ZIP stream; the desktop app only downloads and saves.

**Rationale**: Signal files live in Azure Blob Storage. Having the client fetch them individually would expose raw blob URLs, multiply round-trips, and require the UI layer to understand the entity graph. A single backend endpoint encapsulates data access, authorization, and file assembly.

### ADR-2: User JWT Auth Only (No Encrypted Channel)

**Decision**: The export endpoint uses `[Authorize("sub")]` (user JWT) without `[PrismEncryptedChannelConnection]` or `[PrismAuthenticatedSession]`.

**Rationale**: This is a user-facing feature (researcher exporting their own data), not a node-to-node exchange. The encrypted channel middleware expects JSON request/response pairs and encrypts them symmetrically. A binary ZIP stream cannot be encrypted through this middleware. HTTPS provides transport encryption, and the JWT ensures only authenticated users access the endpoint.

### ADR-3: Streaming ZIP via ZipArchive + PipeWriter

**Decision**: Use `System.IO.Compression.ZipArchive` writing to a pipe, with the controller returning `FileStreamResult` on the reading end.

**Rationale**: `ZipArchive` in `Create` mode writes entries sequentially. By writing to a `Pipe` (or `MemoryStream` for simplicity in v1), the response streams to the client without buffering the entire archive in memory. For v1 we use an intermediate `MemoryStream` since the entity graph for a single research is bounded; a pipe-based approach can be added later if needed.

### ADR-4: Direct HTTP in Desktop (Bypass Middleware)

**Decision**: The desktop `ResearchService.exportResearchData()` method makes a direct `fetch()` call with the JWT `Authorization` header, bypassing `middleware.invoke()`.

**Rationale**: `middleware.invoke()` encrypts the payload with AES-256-GCM and expects an encrypted JSON response. The export endpoint returns raw `application/zip` bytes. The desktop already has access to the JWT token via `UserAuthService` / secure storage, so a direct authenticated fetch is the correct approach.

### ADR-5: Electron IPC for File Save Dialog

**Decision**: Add a new IPC channel `dialog:showSaveDialog` in the Electron main process that opens `dialog.showSaveDialog` and writes the received buffer to disk.

**Rationale**: The renderer process (Vite + React) cannot access the native file system dialog directly due to `contextIsolation: true`. The main process must broker the save operation. The flow is: renderer fetches ZIP as `ArrayBuffer` → sends to main via IPC → main opens save dialog → writes file.

---

## 3. Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│ Desktop App (Renderer)                                               │
│                                                                      │
│  ResearchList / ResearchDetails                                      │
│       │ click "Export"                                                │
│       ▼                                                              │
│  ResearchService.exportResearchData(researchId)                      │
│       │ fetch(GET /api/research/{id}/export, {Authorization: JWT})   │
│       ▼                                                              │
│  Receives ArrayBuffer (ZIP bytes)                                    │
│       │ ipcRenderer.invoke('dialog:saveFile', buffer, filename)      │
│       ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ Main Process                                                  │    │
│  │  dialog.showSaveDialog() → fs.writeFile(path, buffer)        │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + JWT
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ InteroperableResearchNode                                            │
│                                                                      │
│  ResearchController                                                  │
│       │ GET /api/research/{id}/export                                │
│       │ [Authorize("sub")]                                           │
│       ▼                                                              │
│  ResearchExportService.ExportAsync(researchId)                       │
│       │                                                              │
│       ├─ Query PrismDbContext (eager load full entity graph)         │
│       │   Research → Researchers, Volunteers (+ clinical),           │
│       │   Applications, Devices (+ Sensors),                         │
│       │   Sessions (+ Annotations, Records, Channels, TargetAreas)  │
│       │                                                              │
│       ├─ For each RecordChannel with FileUrl:                        │
│       │   BlobContainerClient.GetBlobClient(path).DownloadAsync()   │
│       │                                                              │
│       ├─ Write JSON + signal files into ZipArchive(MemoryStream)    │
│       │                                                              │
│       └─ Return MemoryStream → FileStreamResult(application/zip)    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture

### 4.1 New Files

| Layer | File | Purpose |
|-------|------|---------|
| Service Interface | `Bioteca.Prism.Service/Interfaces/Research/IResearchExportService.cs` | Export service contract |
| Service Implementation | `Bioteca.Prism.Service/Services/Research/ResearchExportService.cs` | ZIP assembly logic |
| Controller | `ResearchController.cs` (existing) | New `Export` action method |
| DI | `NativeInjectorBootStrapper.cs` (existing) | Register export service |

### 4.2 IResearchExportService Interface

```csharp
namespace Bioteca.Prism.Service.Interfaces.Research;

public interface IResearchExportService
{
    Task<ResearchExportResult> ExportAsync(Guid researchId, CancellationToken cancellationToken = default);
}

public class ResearchExportResult
{
    public MemoryStream ZipStream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
}
```

### 4.3 ResearchExportService Implementation

The service uses `PrismDbContext` directly (like `SyncExportService`) for read-only queries with eager loading. This avoids the pagination overhead of the generic repository pattern and allows fetching the full entity graph in minimal round-trips.

**Constructor dependencies**:
- `PrismDbContext` — entity graph queries
- `BlobContainerClient` — signal file download (injected via `IConfiguration`, same pattern as `FileUploadService`)
- `ILogger<ResearchExportService>` — structured logging

**Core algorithm**:

```
1. Load Research with .Include() chain for full graph
2. If null → throw KeyNotFoundException
3. Create MemoryStream + ZipArchive(stream, Create, leaveOpen: true)
4. Write research.json (research metadata, pretty-printed)
5. Write researchers/researchers.json
6. For each volunteer:
   a. Write volunteers/{volunteerId}/clinical_conditions.json
   b. Write volunteers/{volunteerId}/clinical_events.json
   c. Write volunteers/{volunteerId}/medications.json
   d. Write volunteers/{volunteerId}/allergies.json
   e. Write volunteers/{volunteerId}/vital_signs.json
7. Write volunteers/volunteers.json (summary)
8. Write applications/applications.json
9. For each device:
   a. Write devices/{deviceId}/sensors.json
10. Write devices/devices.json (summary)
11. For each session:
    a. Write sessions/{sessionId}/session.json (metadata + annotations)
    b. Write sessions/{sessionId}/clinical_events.json
    c. Write sessions/{sessionId}/vital_signs.json
    d. For each record:
       i.  Write sessions/{sessionId}/records/{recordId}/record.json
       ii. For each channel:
           - Write channel.json (metadata + target areas)
           - If FileUrl is set: download blob → write signal file
           - If download fails: add to missing files list
12. Write _missing_files.json (if any)
13. Dispose ZipArchive, reset MemoryStream position to 0
14. Return ResearchExportResult { ZipStream, FileName }
```

**Entity graph query** (single query with includes):

```csharp
var research = await _context.Research
    .AsNoTracking()
    .Include(r => r.ResearchResearchers).ThenInclude(rr => rr.Researcher)
    .Include(r => r.ResearchVolunteers).ThenInclude(rv => rv.Volunteer)
        .ThenInclude(v => v.VolunteerClinicalConditions)
    .Include(r => r.ResearchVolunteers).ThenInclude(rv => rv.Volunteer)
        .ThenInclude(v => v.VolunteerClinicalEvents)
    .Include(r => r.ResearchVolunteers).ThenInclude(rv => rv.Volunteer)
        .ThenInclude(v => v.VolunteerMedications)
    .Include(r => r.ResearchVolunteers).ThenInclude(rv => rv.Volunteer)
        .ThenInclude(v => v.VolunteerAllergyIntolerances)
    .Include(r => r.ResearchVolunteers).ThenInclude(rv => rv.Volunteer)
        .ThenInclude(v => v.VitalSigns)
    .Include(r => r.Applications)
    .Include(r => r.ResearchDevices).ThenInclude(rd => rd.Device)
        .ThenInclude(d => d.Sensors)
    .Include(r => r.RecordSessions).ThenInclude(s => s.SessionAnnotations)
    .Include(r => r.RecordSessions).ThenInclude(s => s.Records)
        .ThenInclude(r => r.RecordChannels).ThenInclude(rc => rc.TargetAreas)
    .Include(r => r.RecordSessions).ThenInclude(s => s.ClinicalEvents)
    .Include(r => r.RecordSessions).ThenInclude(s => s.VitalSigns)
    .FirstOrDefaultAsync(r => r.Id == researchId, cancellationToken);
```

**JSON serialization**: Use `System.Text.Json.JsonSerializer` with `JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase }` to produce human-readable, camelCase JSON matching the project brief requirements.

**Blob download**: For each `RecordChannel` where `FileUrl` is not empty, extract the blob path from the URL and download via `BlobContainerClient`. If the download fails (404, network error), log a warning and add the entry to `_missing_files.json` rather than failing the entire export.

### 4.4 Controller Endpoint

New action method in `ResearchController.cs`:

```csharp
[HttpGet("{id:guid}/export")]
[Authorize("sub")]
[ProducesResponseType(typeof(FileStreamResult), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<IActionResult> Export(Guid id, CancellationToken cancellationToken)
{
    try
    {
        var result = await _researchExportService.ExportAsync(id, cancellationToken);
        return File(result.ZipStream, "application/zip", result.FileName);
    }
    catch (KeyNotFoundException)
    {
        return NotFound(CreateError("ERR_RESEARCH_NOT_FOUND",
            $"Research with ID {id} not found"));
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to export research {ResearchId}", id);
        return StatusCode(500, CreateError("ERR_EXPORT_FAILED",
            "Failed to export research data"));
    }
}
```

Key differences from other endpoints:
- No `[PrismEncryptedChannelConnection]` — returns binary ZIP, not encrypted JSON
- No `[PrismAuthenticatedSession]` — uses user JWT directly
- Uses route parameter `{id:guid}/export` instead of `[action]` attribute routing
- Returns `FileStreamResult` instead of `JsonResponseMessage`
- Accepts `CancellationToken` for long-running export cancellation support

### 4.5 DI Registration

Add to `NativeInjectorBootStrapper.cs`:

```csharp
services.AddScoped<IResearchExportService, ResearchExportService>();
```

---

## 5. Desktop Architecture

### 5.1 Modified Files

| File | Change |
|------|--------|
| `src/main/index.ts` | Add `dialog:saveFile` IPC handler |
| `src/preload/preload.ts` | Expose `saveFile` method to renderer |
| `src/services/research/ResearchService.ts` | Add `exportResearchData()` method |
| `src/screens/Research/ResearchList.tsx` | Add "Export" action button |
| `src/screens/Research/ResearchDetailsScreen.tsx` | Add "Export" button in header |

### 5.2 Electron Main Process (IPC Handler)

New IPC handler in `src/main/index.ts`:

```typescript
import { dialog } from 'electron';
import * as fs from 'fs';

ipcMain.handle('dialog:saveFile', async (_event, buffer: ArrayBuffer, defaultFileName: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
        defaultPath: defaultFileName,
        filters: [{ name: 'ZIP Archives', extensions: ['zip'] }]
    });

    if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
    }

    await fs.promises.writeFile(result.filePath, Buffer.from(buffer));
    return { success: true, filePath: result.filePath };
});
```

### 5.3 Preload Bridge

Add to `src/preload/preload.ts`:

```typescript
const api = {
    // ... existing methods ...

    dialog: {
        saveFile: (buffer: ArrayBuffer, defaultFileName: string) =>
            ipcRenderer.invoke('dialog:saveFile', buffer, defaultFileName)
    }
};
```

Update `ElectronAPI` type export accordingly.

### 5.4 ResearchService.exportResearchData()

This method bypasses `middleware.invoke()` and makes a direct `fetch()` with the JWT token:

```typescript
async exportResearchData(researchId: string): Promise<{ success: boolean; filePath?: string; canceled?: boolean }> {
    this.log(`Exporting research data: ${researchId}`);

    // Get JWT token from secure storage
    const authState = await this.storage.getItem('userauth:state') as { token?: string } | null;
    const token = authState?.token;

    if (!token) {
        throw this.createAuthError('invalid_credentials' as AuthErrorCode, 'No authentication token available');
    }

    // Direct fetch (bypasses encrypted channel — ZIP binary cannot be encrypted via middleware)
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/Research/${researchId}/export`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw this.createAuthError('not_found' as AuthErrorCode, 'Research not found');
        }
        throw this.createAuthError('server_error' as AuthErrorCode, `Export failed: ${response.statusText}`);
    }

    // Extract filename from Content-Disposition header
    const disposition = response.headers.get('Content-Disposition') ?? '';
    const filenameMatch = disposition.match(/filename="?(.+?)"?$/);
    const filename = filenameMatch?.[1] ?? `research_${researchId}.zip`;

    // Get ZIP as ArrayBuffer
    const buffer = await response.arrayBuffer();

    // Save via Electron dialog
    const result = await (window as any).electron.dialog.saveFile(buffer, filename);
    return result;
}
```

### 5.5 UI Integration

**ResearchList.tsx**: Add an export icon button in the row actions column, alongside the existing View and Edit buttons. Uses `ArrowDownTrayIcon` from `@heroicons/react/24/outline`.

**ResearchDetailsScreen.tsx**: Add an "Export" button in the header area, next to any existing action buttons. When clicked, calls `researchService.exportResearchData(researchId)` with loading state and toast notifications.

Both use the same pattern:
1. Set loading state for the specific research row/button
2. Call `researchService.exportResearchData(researchId)`
3. On success: show success toast with file path
4. On cancel: reset loading state (no toast)
5. On error: show error toast

---

## 6. ZIP Structure Reference

```
{sanitized-title}_{research-id}/
├── research.json
├── researchers/
│   └── researchers.json
├── volunteers/
│   ├── volunteers.json
│   └── {volunteer-id}/
│       ├── clinical_conditions.json
│       ├── clinical_events.json
│       ├── medications.json
│       ├── allergies.json
│       └── vital_signs.json
├── applications/
│   └── applications.json
├── devices/
│   ├── devices.json
│   └── {device-id}/
│       └── sensors.json
├── sessions/
│   └── {session-id}/
│       ├── session.json
│       ├── clinical_events.json
│       ├── vital_signs.json
│       └── records/
│           └── {record-id}/
│               ├── record.json
│               └── channels/
│                   └── {channel-id}/
│                       ├── channel.json
│                       └── signal.csv
└── _missing_files.json  (only if files were unavailable)
```

The root folder name is derived from `{title}_{id}` where `title` is sanitized to remove filesystem-unsafe characters (replaced with underscores, truncated to 50 chars).

---

## 7. Error Handling

| Scenario | Backend Behavior | Desktop Behavior |
|----------|-----------------|------------------|
| Research not found | 404 + `ERR_RESEARCH_NOT_FOUND` | Error toast: "Research not found" |
| Blob file missing | Log warning, add to `_missing_files.json`, continue export | N/A (transparent to user, file listed in manifest) |
| Blob download failure | Log warning, add to `_missing_files.json`, continue export | N/A |
| Database query failure | 500 + `ERR_EXPORT_FAILED` | Error toast: "Export failed" |
| User cancels save dialog | N/A | Reset loading state, no toast |
| No JWT token | N/A (401 from backend) | Error toast: "Authentication required" |
| Large export timeout | Backend supports `CancellationToken`; controller propagates it | `fetch` can be aborted via `AbortController` (future enhancement) |

---

## 8. Security Considerations

The export endpoint uses `[Authorize("sub")]` which validates the user JWT. This ensures only authenticated researchers can trigger exports. The endpoint does not add additional research-level authorization (e.g., "is this user assigned to this research?") in v1, since the IRN backend does not currently implement row-level security on research entities. This matches the authorization model of all existing research endpoints.

The direct `fetch()` in the desktop app uses HTTPS transport encryption. The JWT token is retrieved from Electron's secure storage (keytar). No sensitive data is cached in the renderer process beyond the response `ArrayBuffer` which is immediately passed to the main process for disk write.

---

## 9. Performance Considerations

**Entity graph query**: The single EF Core query with many `.Include()` chains will produce a large SQL JOIN. For research projects with many sessions/records/channels, this could be slow. Acceptable for v1 since exports are infrequent, user-initiated operations. If performance becomes an issue, the query can be split into multiple smaller queries (load sessions separately, then records per session).

**Memory usage**: The entire ZIP is assembled in a `MemoryStream` before streaming to the client. For a research project with 100 sessions × 10 records × 1 channel × 1MB CSV each = ~1GB, this would be problematic. Mitigation: signal CSV files in the current system are typically 50KB-500KB (a few seconds of 215Hz sEMG data), so even large projects should stay under 100MB total. The 50MB upload limit per file (`FileUploadService.MaxFileSizeBytes`) provides a natural bound.

**Future optimization**: If needed, replace `MemoryStream` with `System.IO.Pipelines.Pipe` to stream the ZIP incrementally. This requires writing entries sequentially and flushing after each file.

---

## 10. Testing Strategy

**Backend unit tests** (in `Bioteca.Prism.InteroperableResearchNode.Test`):
- `ResearchExportService` with in-memory `PrismDbContext` and mocked `BlobContainerClient`
- Test: empty research (no sessions) produces valid ZIP with `research.json`
- Test: research with sessions produces correct folder structure
- Test: missing blob file produces `_missing_files.json` entry
- Test: nonexistent research ID throws `KeyNotFoundException`

**Desktop manual testing**:
- Export from research list row action
- Export from research details header
- Cancel save dialog
- Export with no sessions (minimal ZIP)
- Verify ZIP contents match expected structure

---

## 11. Dependencies and Risks

| Dependency | Risk | Mitigation |
|------------|------|-----------|
| `System.IO.Compression` | None (built-in .NET) | Already available |
| `Azure.Storage.Blobs` | Already used by `FileUploadService` | Same `BlobContainerClient` pattern |
| Electron `dialog.showSaveDialog` | Requires main process IPC | Standard Electron pattern, well-documented |
| Large entity graph query | Could be slow for very large research projects | Acceptable for v1; split queries if needed |
| `ArrayBuffer` IPC transfer | Electron serializes the buffer over IPC | For files >100MB, consider streaming to temp file first |
