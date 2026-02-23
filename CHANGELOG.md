# CHANGELOG

All notable changes to the IRIS project are documented in this file.

---

## [Phase 17] — 2026-02-18

### Node-to-Node Data Synchronization

Phase 17 introduces one-way incremental data pull between authorized PRISM research nodes. A researcher operating the IRIS desktop app can now click **Sync** on any active node connection to pull all remote data (SNOMED catalogs, volunteers, research projects, clinical sessions, and recording files) into the local node — atomically and incrementally.

---

### Added

#### Backend — Sync Export and Import (`InteroperableResearchNode`)

- **`SyncController`** — New ASP.NET Core controller exposing seven sync endpoints, all protected by `[PrismEncryptedChannelConnection]` and `[PrismAuthenticatedSession(RequiredCapability = ReadWrite)]`:
  - `POST /api/sync/manifest` — Returns entity counts and latest timestamps per entity type so the requesting node can preview the transfer scope before committing.
  - `GET /api/sync/snomed/{entityType}` — Exports SNOMED catalog data (body regions, body structures, topographical modifiers, lateralities, clinical conditions, clinical events, medications, allergy intolerances, severity codes). Supports `?since=ISO8601` incremental filtering and `page`/`pageSize` pagination.
  - `GET /api/sync/volunteers` — Exports volunteers with nested clinical sub-entities.
  - `GET /api/sync/research` — Exports research projects with applications, devices, sensors, and researcher assignments.
  - `GET /api/sync/sessions` — Exports clinical sessions with records, record channels, annotations, and target areas.
  - `GET /api/sync/recordings/{id}/file` — Returns a recording's binary file encoded as a base64 JSON payload for encrypted transport.
  - `GET /api/sync/log` — Returns paginated sync history for a given remote node connection.

- **`SyncExportService`** — Queries all syncable entities with `UpdatedAt > since` incremental filtering and eager-loaded sub-entities.

- **`SyncImportService`** — Transactional upsert service that receives all collected sync data and persists it inside a single `IDbContextTransaction`. On any failure, all changes are rolled back. Implements "newer wins" conflict resolution by comparing `UpdatedAt` timestamps before overwriting any existing record.

- **`SyncLog` entity + `AddSyncLog` EF Core migration** — New `sync_logs` table tracking sync history per remote node: status (`in_progress`, `completed`, `failed`, `rolled_back`), watermark timestamp (`LastSyncedAt`) for the next incremental run, entity counts (JSONB), and error messages. The migration also adds missing `UpdatedAt` and `CreatedAt` columns to `SnomedLaterality`, `SnomedTopographicalModifier`, and `RecordChannel`.

- **`PrismSyncEndpointAttribute`** — Marker attribute that elevates the rate limit for sync endpoints from the standard 60 requests/minute to **600 requests/minute**, preventing paginated syncs from being throttled mid-transfer.

- **`NodeChannelClient.InvokeAsync<TResponse>` and `InvokeStreamAsync`** — Two new methods on `INodeChannelClient` enabling arbitrary authenticated API calls through an established encrypted channel after the 4-phase handshake. `InvokeStreamAsync` uses `HttpCompletionOption.ResponseHeadersRead` for efficient binary streaming.

- **Sync DTOs** — `SyncManifestRequest`, `SyncManifestResponse`, `SyncImportPayload`, `SyncResultDTO`, `PagedSyncResult<T>`, `VolunteerSyncDTO`, `ResearchSyncDTO`, `SessionSyncDTO`.

#### Middleware — Sync Orchestration (`@iris/middleware`)

- **`NodeSyncService`** — New TypeScript class that orchestrates the full pull flow:
  1. Fetches the sync manifest to surface entity counts for user confirmation.
  2. Pulls entities in dependency order: SNOMED catalogs → Volunteers → Research → Sessions → Recording files.
  3. Uses paginated requests (100 records/page) per entity type.
  4. Collects all data in memory before submitting a single `POST /api/sync/import` to the local backend, ensuring one atomic transaction boundary.
  5. Reports progress via a `SyncProgressCallback` interface after each page and recording file.

#### Domain — Shared Types (`@iris/domain`)

- **`NodeSync.ts`** — New module exporting: `SyncManifest`, `SyncEntitySummary`, `SyncRecordingSummary`, `SyncProgress`, `SyncResult`, `SyncLogEntry`, `PaginatedSyncResponse<T>`.
- **`ResearchNodeConnection`** — Extended with optional `lastSyncedAt?: string` and `lastSyncStatus?: string` fields for sync history display.

#### Desktop — Sync UI (`IRIS/apps/desktop`)

- **`SyncProgressModal`** — New React component with four states managed via a discriminated union type:
  1. **Confirmation** — Displays manifest entity counts; user can start or cancel.
  2. **In Progress** — Progress bar showing current entity type and completion percentage. Close is blocked during active sync.
  3. **Success** — Summary of all synced entity counts.
  4. **Error** — Displays error message and confirms all changes were rolled back.

- **`NodeSyncServiceAdapter`** — Desktop adapter that constructs connection-specific `ResearchNodeMiddleware` instances targeting the correct remote node URL, wiring `NodeSyncService` with the remote middleware for pulling and the local middleware for importing.

#### Testing

- **`SyncImportServiceTests.cs`** — 19 passing unit tests (1 skipped due to EF Core InMemory provider limitation) covering: full sync insert flow, incremental sync (same watermark = zero inserts), "newer wins" conflict resolution in both directions, transaction rollback, `SyncLog` failure tracking, manifest `since`-filter, pagination, unknown SNOMED entity type handling, rate limit override (600 req/min), and `ReadWrite`/`Admin`/`ReadOnly` capability enforcement.

---

### Changed

- **`NodeConnectionsScreen`** — Sync button stub (`console.log`) replaced with a real handler that validates access level, opens `SyncProgressModal`, and reloads connection data after sync completes.
- **`PrismAuthenticatedSessionAttribute`** — Checks for `PrismSyncEndpointAttribute` in endpoint metadata and passes an elevated rate limit to `SessionService.RecordRequestAsync`.
- **`SessionService.RecordRequestAsync`** — Added optional `overrideLimit` parameter; when non-zero, it replaces `MaxRequestsPerMinute` for that call.
- **`INodeChannelClient`** — Extended with `InvokeAsync<TResponse>` and `InvokeStreamAsync` signatures.
- **`NativeInjectorBootStrapper`** — DI registrations added for `ISyncExportService`, `ISyncImportService`, and `ISyncLogRepository` (all `Scoped`).
- **`PrismDbContext`** — `DbSet<SyncLog>` added.
- **`@iris/middleware` index** — Re-exports `NodeSyncService` sync types.
- **`@iris/domain` index** — Exports new `NodeSync` module.

---

### Fixed

- **B-001 — Transaction boundary for `SyncLog` creation**: `SyncLog` was previously committed to the database before `BeginTransactionAsync()` was called, leaving orphaned `in_progress` entries when the import transaction rolled back. Fixed by opening the transaction first and including the `SyncLog` insert inside it. The failure log path uses `ChangeTracker.Clear()` + a fresh implicit transaction so the error entry is persisted independently of the rollback.

- **B-002 — Recording file response format mismatch**: `SyncController.GetRecordingFile` returned a binary `FileResult` while `ResearchNodeMiddleware.invoke()` expected an encrypted JSON envelope, causing a JSON parse failure for every sync containing recording files. Fixed by returning the file as `{ contentBase64, contentType, fileName }` JSON, consistent with all other sync endpoints.

- **S-005 — Remote middleware wiring in `NodeSyncServiceAdapter`**: Both `remoteMiddleware` and `localMiddleware` pointed to the same local middleware instance, causing the sync to pull from the local node into itself. Fixed by constructing a connection-specific middleware instance targeting the remote node's URL for the pull step.

---

### Known Limitations (Accepted for Phase 17)

- Sync is **one-way pull only** — bidirectional sync is deferred to a future phase.
- Sync is **manual only** — no scheduled or event-driven sync.
- Volunteer deduplication across nodes (same person, different GUIDs) is deferred.
- Recording files are held in memory before import; streaming optimization is future work.
- `POST /api/sync/import` endpoint lacks application-layer authentication (S-002) — relies on network-level access control.
- `SyncController.GetSyncLog` uses service-locator pattern for `ISyncLogRepository` instead of constructor injection (S-001).
- Manifest `LastSyncedAt` is always `null` in the response — UI shows "Never synced" after the first sync until S-004 is fixed.
- 68 pre-existing integration test failures in `TestWebApplicationFactory` suites (DI startup validation failure) were not introduced by Phase 17 but remain unresolved.

---

*Phase 17 delivered: 7 backend sync endpoints, SyncImportService (transactional upsert across 28 tables), SyncLog entity + EF Core migration, NodeChannelClient.InvokeAsync extension, PrismSyncEndpointAttribute (600 req/min), NodeSyncService pull orchestrator, SyncProgressModal, sync button wiring, sync history display, NodeSync domain types, 19 unit tests.*

---

## [Phase 16] — 2026-02-18

### Fixed

**ZIP export produces corrupt output for synced sessions**

After a recording was synchronized to the Research Node backend, the mobile app's History screen ZIP export silently produced placeholder text instead of real sEMG data. The root cause was that SyncService overwrote the local file path (`filePath`) with the blob storage URL after upload, then deleted the local file. At export time, `FileSystem.getInfoAsync()` called on a remote URL returned `exists: false`, causing the ZIP to contain `# File not found on disk` for every synced recording.

Since sync runs automatically every 60 seconds, every session eventually reached this broken state. Researchers who synced their data and later attempted a local export received an empty archive with no usable signal data.

**What changed:**

- A new `blob_url` column was added to the SQLite `recordings` table (migration v5). Local file paths and remote blob URLs are now stored independently. After upload, `file_path` is cleared to NULL and `blob_url` holds the remote URL.
- The export handler in HistoryScreen now resolves recording content in three tiers: local file (if present), blob URL download (if synced and online), or an informative offline message. It uses `FileSystem.downloadAsync()` to stream from blob storage to a temporary file rather than loading the entire CSV into memory.
- The v5 migration includes a retroactive repair step that moves any blob URLs previously stored in `file_path` to the new `blob_url` column, repairing all recordings that were synced under the old behavior.

**Files changed:**

| File | Change |
|------|--------|
| `packages/domain/src/models/Recording.ts` | Added `blobUrl?: string` to `Recording` and `NewRecordingData` interfaces |
| `apps/mobile/src/data/migrations/v5_add_blob_url.ts` | New migration: `ALTER TABLE recordings ADD COLUMN blob_url TEXT DEFAULT NULL` + retroactive URL repair |
| `apps/mobile/src/data/database.ts` | Registered v5 migration |
| `apps/mobile/src/data/repositories/RecordingRepository.ts` | Added `blob_url` to row type, mapper, `create()`, and `update()` |
| `apps/mobile/src/services/SyncService.ts` | Store blob URL in `blobUrl` field, clear `filePath` to NULL after upload |
| `apps/mobile/src/screens/HistoryScreen.tsx` | Added `resolveRecordingContent()` with local-first + blob-URL fallback export logic |
| `apps/mobile/src/services/SyncService.test.ts` | Fixed mock object to satisfy updated `Recording` interface |

**Behavior after this fix:**

- Synced sessions export successfully with actual CSV data fetched from blob storage.
- Unsynced sessions export identically to before (local file read).
- When the device is offline and recording data is only on the server, the ZIP includes `# Recording data is on server (offline)` as an informative placeholder per recording.
- Device storage continues to be reclaimed after successful upload (local file deleted).
- Sync cycle behavior is unchanged.

**Test results:** 15/15 unit tests passing. TypeScript strict mode: no errors in Phase 16 files.

---

## [Phase 15] — 2026-02-17

### Added

**Binary Bluetooth protocol decoder**

Added support for the ESP32 binary packet format (magic byte `0xAA`, code `0x0D`, 108-byte total packet, 50 samples per packet). The Bluetooth SPP accumulator now routes incoming data by first byte: JSON messages (first byte < 0x80) continue through the existing JSON parser; binary packets are decoded by a dedicated `binaryDecoder` utility. This enables the mobile app to receive the full 215 Hz sEMG data stream from the device.

---

## [Phase 14] — 2026-02-17

### Fixed

**Stream data pipeline and ZIP export correctness**

Corrected the sample rate from 100 Hz to 215 Hz throughout the streaming pipeline. Fixed the chart display to use a 4-second rolling window at 40 Hz. Fixed ZIP export to use the correct file system API for reading CSV content. Fixed simulation mode to use 50 Hz to match the binary packet delivery rate.

---

## [Phase 13] — 2026-02-17

### Added

**Session configuration form state persistence**

Session configuration (muscle group, topography, channel settings) now persists across navigation via `SessionConfigFormContext`. A reset button restores all fields to defaults. Configuration state is no longer lost when navigating away from the setup screen mid-configuration.

---

## [Phase 12] — 2026-02-16

### Added

**Device ID and laterality fields in session favorites**

Session favorites now store `deviceId` and `laterality` fields, allowing a saved favorite to restore the full session configuration including device association and anatomical side.

---

## [Phase 11] — 2026-02-16

### Added

**Session configuration favorites**

Researchers can save session configuration presets as named favorites and recall them with one tap when starting a new session. Favorites are stored in a new SQLite table (migration v4). The favorites screen supports create, read, update, and delete operations.

---

## [Phase 10] — 2026-02-16

### Added

**Topography selection screen**

A dedicated TopographySelectScreen allows researchers to select muscle group topographies from a searchable list. Laterality (left/right) selection was removed from the session configuration form as it is no longer part of the data model.

---

## [Phases 6–9] — 2026-02-14

### Added

**Backend integration: session and recording synchronization**

SyncService was updated to call real Research Node endpoints instead of mock data. Sessions, recordings, and annotations now synchronize to the backend. Sync status badges appear on session list items. VolunteerService and SnomedService were connected to real middleware endpoints.

---

## [Phases 2–5] — 2026-02-06 to 2026-02-07

### Added

**Research project CRUD and backend integration**

Full create, read, update, and delete workflow for research projects, with 22 backend endpoints and 9 mobile screens. Research details screens for sub-entities (volunteers, protocols, ethical approvals, publications, datasets). All 23 middleware methods swapped from mock implementations to real `middleware.invoke()` calls.

---

## [Phase 1] — Initial Release

### Added

**Core session workflow**

Authentication via 4-phase cryptographic handshake, Bluetooth device pairing and control, real-time sEMG signal visualization, session recording and CSV export, session history screen, and the foundational SQLite schema (migration v1).
