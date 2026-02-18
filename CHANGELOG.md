# CHANGELOG

All notable changes to the IRIS project are documented in this file.

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
