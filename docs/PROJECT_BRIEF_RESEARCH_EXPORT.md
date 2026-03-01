# Project Brief: Research Data Export

**Date**: 2026-02-22
**Author**: PM (Product Manager)
**Status**: DRAFT
**Phase**: 19

---

## 1. Business Objectives

| # | Objective | Success Criteria | Priority |
|---|-----------|-----------------|----------|
| 1 | Allow researchers to export all data for a research project as a ZIP file | Clicking "Export Research Data" on the research list produces a downloadable ZIP containing all related records, organized in folders per entity | Must |
| 2 | Backend generates the ZIP to avoid exposing raw data to the UI layer | A single backend endpoint accepts a research ID and returns a ZIP file stream; the desktop app triggers the download and saves it via Electron's dialog | Must |
| 3 | Exported data must be self-contained and human-readable | Each entity folder contains JSON files with all fields; binary recording files (referenced by `RecordChannel.FileUrl`) are included when available | Must |
| 4 | Export respects authorization | Only authenticated users with access to the research can trigger the export | Must |

---

## 2. Background

Researchers need a way to extract all data associated with a research project for offline analysis, auditing, regulatory submissions, or data archival. Currently there is no single action that bundles a research project's full dataset. The existing sync infrastructure moves data between nodes but does not produce a downloadable archive for human consumption.

The export targets a single research project and traverses its full entity graph: the research metadata, assigned researchers, enrolled volunteers (with clinical data), assigned devices and sensors, applications, recording sessions (with annotations, records, record channels, and target areas), and any associated signal files.

---

## 3. Scope

### In Scope

**Backend (InteroperableResearchNode)**:
- New `ResearchExportService` that queries the full entity graph for a given research ID
- New `GET /api/research/{id}/export` endpoint that returns a `application/zip` stream
- ZIP structure organized by entity type (see Section 5)
- Include binary recording files from `RecordChannel.FileUrl` (blob storage or local path)
- Authenticated via `[Authorize("sub")]` (user JWT)

**Desktop (IRIS/apps/desktop)**:
- New "Export" action button in the research list row actions
- New "Export" button in the research details screen header
- Service method in `ResearchService` to call the export endpoint
- Electron `dialog.showSaveDialog` to let the user choose the save location
- Progress indication (loading state) during export
- Toast notification on success/failure

### Out of Scope

- Selective export (choosing which entities to include) -- full export only for v1
- Export format options (CSV, Excel) -- JSON only for v1
- Bulk export of multiple research projects at once
- Scheduled or automated exports
- Export of SNOMED reference data (already available as seed data)
- Mobile app export (desktop only for now)

---

## 4. Entity Graph (What Gets Exported)

The export traverses the following entity hierarchy rooted at `Research`:

```
Research
├── ResearchResearchers → Researcher (profile data)
├── ResearchVolunteers → Volunteer
│   ├── VolunteerClinicalConditions
│   ├── VolunteerClinicalEvents
│   ├── VolunteerMedications
│   ├── VolunteerAllergyIntolerances
│   └── VitalSigns
├── Applications
├── ResearchDevices → Device
│   └── Sensors
├── RecordSessions
│   ├── SessionAnnotations
│   ├── ClinicalEvents (session-scoped)
│   ├── VitalSigns (session-scoped)
│   └── Records
│       └── RecordChannels
│           ├── TargetAreas
│           └── [Signal file from FileUrl]
```

---

## 5. ZIP File Structure

```
{research-title}_{research-id}/
├── research.json                          # Research metadata
├── researchers/
│   └── researchers.json                   # Array of assigned researchers
├── volunteers/
│   ├── volunteers.json                    # Array of enrolled volunteers
│   └── {volunteer-id}/
│       ├── clinical_conditions.json
│       ├── clinical_events.json
│       ├── medications.json
│       ├── allergies.json
│       └── vital_signs.json
├── applications/
│   └── applications.json                  # Array of applications
├── devices/
│   ├── devices.json                       # Array of assigned devices
│   └── {device-id}/
│       └── sensors.json                   # Sensors for this device
├── sessions/
│   └── {session-id}/
│       ├── session.json                   # Session metadata + annotations
│       ├── clinical_events.json
│       ├── vital_signs.json
│       └── records/
│           └── {record-id}/
│               ├── record.json            # Record metadata
│               └── channels/
│                   └── {channel-id}/
│                       ├── channel.json   # Channel metadata + target areas
│                       └── signal.*       # Signal data file (if FileUrl exists)
```

---

## 6. Technical Approach

### Backend

The `ResearchExportService` uses `PrismDbContext` with eager loading to fetch the complete entity graph in a minimal number of queries. It writes JSON files into a `ZipArchive` stream using `System.IO.Compression`. For recording files referenced by `RecordChannel.FileUrl`, it reads from blob storage (Azure Blob via existing `BlobServiceClient`) or skips with a placeholder note if the file is unavailable.

The controller endpoint uses `[Authorize("sub")]` (user JWT auth, not node session auth) since this is a user-facing feature. It returns `FileStreamResult` with `application/zip` content type. No encrypted channel middleware is needed because this is a local user operation, not a node-to-node exchange.

### Desktop

The desktop `ResearchService` gets a new `exportResearchData(researchId)` method. Because the response is a binary stream (not JSON), this method bypasses the normal middleware encryption layer and makes a direct authenticated HTTP request to the backend. The Electron main process handles the file save dialog via IPC, and the renderer displays a loading indicator while the download is in progress.

### File Size Considerations

For large research projects with many recording sessions, the ZIP could be substantial. The backend streams the ZIP response (does not buffer the entire file in memory). The endpoint sets appropriate headers (`Content-Disposition: attachment`) for browser/Electron download handling.

---

## 7. API Contract

### `GET /api/research/{id:guid}/export`

**Authentication**: Bearer JWT (`[Authorize("sub")]`)

**Response**:
- `200 OK` with `Content-Type: application/zip`, `Content-Disposition: attachment; filename="{title}_{id}.zip"`
- `404 Not Found` if research ID does not exist
- `500 Internal Server Error` on export failure

**No request body.** The research ID in the URL is the only parameter.

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Large ZIP files for research with many recording sessions | Memory pressure, slow downloads | Stream ZIP to response (no full buffering); set reasonable timeout |
| Recording files missing from blob storage | Incomplete export | Write a `_missing_files.json` manifest listing unavailable files; do not fail the export |
| Concurrent exports for the same research | Redundant load | Acceptable for v1; can add caching/deduplication later |
| Export endpoint used without proper authorization | Data leak | `[Authorize("sub")]` ensures only authenticated users can export |

---

## 9. Acceptance Criteria

1. User clicks "Export" on a research project in the desktop list or detail screen
2. A save dialog appears allowing the user to choose the file location
3. The ZIP file is downloaded and contains all entities listed in Section 4
4. JSON files are pretty-printed and use camelCase field names
5. Recording signal files are included when available; missing files are listed in `_missing_files.json`
6. A toast notification confirms success or reports failure
7. The export works for research projects with zero sessions (minimal export)
8. The export works for research projects with multiple sessions and recordings (full export)
