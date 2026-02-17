# Project Brief: Stream Data Fixes

**Date**: 2026-02-17
**Status**: DRAFT
**Requested by**: Product Owner
**Project Root**: `D:\Repos\Faculdade\PRISM\IRIS\`

---

## 1. Business Objectives

The IRIS mobile application captures real-time sEMG biosignal data from the ESP32 device at a fixed 215 Hz sampling rate via Bluetooth SPP. Three bugs in the stream data consumption and persistence pipelines undermine the clinical utility of the captured data: exports produce an unusable single-CSV file instead of a structured ZIP archive; uploaded recordings reach blob storage with empty headers (no actual signal data); and the recording screen uses an incorrect, user-configurable sampling rate while rendering the chart sub-optimally for real-time monitoring.

Fixing these three issues is essential to ensure that researchers can trust the exported artifacts, that backend-persisted recordings contain valid sEMG signal data, and that the capture screen provides an accurate, ergonomic real-time visualization.

---

## 2. Scope

### 2.1 Bug 1 -- Export Produces Single Disorganized CSV

**Current behavior**: `HistoryScreen.handleExportSession()` calls `exportSessionData()` from `csvExport.ts`, which produces a single `.csv` file containing metadata headers and empty data sections (the `dataPoints` arrays are hard-coded as empty: `recordings.map(() => [])`). All recordings are concatenated into one flat file with no structure.

**Expected behavior**: Export should produce a **ZIP archive** containing:
- A `session.json` file with session metadata (session ID, volunteer, body structure, laterality, start time, duration, sample rate, data type) and a `recordings` array referencing each recording's CSV filename.
- One CSV file **per recording channel** (e.g., `recording_001.csv`, `recording_002.csv`), each containing the actual sEMG signal data read from the local file path stored in the recording entity.

**Affected files**:
- `apps/mobile/src/utils/csvExport.ts` -- needs new ZIP export function
- `apps/mobile/src/screens/HistoryScreen.tsx` -- `handleExportSession()` must read recording file content from disk and call the new ZIP export

**Key constraints**:
- The recording CSV files already exist on disk at `recording.filePath` (written by `CaptureScreen.handleStopRecording`). The export function must read these files and include them in the ZIP rather than re-generating data.
- A ZIP library compatible with Expo/React Native is required (e.g., `jszip` with base64 encoding via `expo-file-system`).
- The share sheet must present the ZIP file with MIME type `application/zip`.

### 2.2 Bug 2 -- Blob Upload CSV Has Empty Header

**Current behavior**: When `SyncService.syncRecordings()` uploads a recording to blob storage, it reads the local CSV file at `recording.filePath` and base64-encodes it for the `UploadRecordingPayload`. The CSV file itself is written by `CaptureScreen.createCSVContent()`, which correctly produces `timestamp,value` rows from the full `allStreamPacketsRef` buffer. However, the `streamConfig.rate` used to calculate inter-sample timestamps is set to the user-chosen value (default 100 Hz) rather than the device's fixed 215 Hz.

**Root cause**: The `streamConfig.rate` state in `BluetoothContext` defaults to `100` and is only updated when the user explicitly calls `configureStream()` from `StreamConfigScreen`. The ESP32 device always streams at 215 Hz regardless of what rate the app requests (the `ConfigStream` command is acknowledged but the hardware rate is fixed). This means the CSV timestamps are computed with an incorrect inter-sample interval, producing distorted time axes, and the header metadata (`sampleRate`) is wrong.

**Expected behavior**: The CSV written to disk must use a fixed 215 Hz sample rate for timestamp interpolation. The recording entity's `sampleRate` field must always be 215 when connected to a real device.

**Affected files**:
- `apps/mobile/src/screens/CaptureScreen.tsx` -- `createCSVContent` and `recordingData` must use 215 Hz constant
- `apps/mobile/src/context/BluetoothContext.tsx` -- `streamConfig.rate` default should be 215
- `apps/mobile/src/screens/StreamConfigScreen.tsx` -- sampling rate picker should be removed or made read-only (device rate is fixed)
- `packages/domain/src/models/Stream.ts` -- optionally add `FIXED_SAMPLE_RATE_HZ = 215` constant

### 2.3 Bug 3 -- Recording Screen Wrong Frequency and Chart Display

**Current behavior**: The `CaptureScreen` passes `streamConfig.rate` (default 100 Hz) to `useStreamData()`, which uses it for buffer sizing and downsampling. The `SEMGChart` renders all buffered data with horizontal scrolling and auto-scroll, showing up to 30 seconds of data. The chart does not constrain its visible window to 4 seconds, does not downsample to a fixed 40 Hz display rate, and does not update at a 1-second cadence.

**Expected behavior**:
- **Fixed 215 Hz sampling rate** used consistently (not user-configurable).
- **Chart shows only the last 4 seconds** of the stream (a sliding window of ~860 samples at 215 Hz).
- **Chart downsampled to 40 Hz** for rendering (160 points visible at any time), reducing CPU/GPU load.
- **Chart updates once per second** (1 Hz refresh), not on every incoming packet flush.

**Affected files**:
- `apps/mobile/src/hooks/useStreamData.ts` -- 4-second window, 40 Hz downsample, 1 Hz update cadence
- `apps/mobile/src/components/SEMGChart.tsx` -- fixed-width viewport (no horizontal scroll), render 160 points
- `apps/mobile/src/screens/CaptureScreen.tsx` -- pass correct 215 Hz rate, chart update throttling

---

## 3. Out of Scope

- Changes to the ESP32 firmware (the 215 Hz rate is correct and immutable at the hardware level).
- Changes to the backend `UploadController` or `ClinicalSessionController` endpoints.
- Desktop application changes.
- Streaming configuration for non-sEMG data types (all sEMG types share the 215 Hz rate).
- Modification of the `StreamingScreen` (legacy dev/debug screen, not the clinical capture flow).

---

## 4. Constraints

| # | Constraint | Rationale |
|---|-----------|-----------|
| C1 | Must use Expo-compatible libraries only | The mobile app runs on Expo 52; native modules must be Expo-compatible |
| C2 | TypeScript strict mode, no `any` types | Project directive from CLAUDE.md |
| C3 | 215 Hz is the authoritative sample rate | ESP32 firmware: `ADC_FIXED_RATE_HZ 215` (860 Hz / 4 downsample) |
| C4 | Recording CSV files already exist on disk | CaptureScreen writes them; export reads them -- do not re-generate from memory |
| C5 | Import aliases use `@/` prefix | Project convention for mobile app imports |
| C6 | All documentation in English | Project directive |
| C7 | Lucide icons only in mobile app | No custom SVG files |

---

## 5. Risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|-----------|-----------|
| R1 | `jszip` bundle size increases app binary | Medium | Medium | Tree-shake; evaluate `fflate` as lighter alternative |
| R2 | Reading large CSV files into memory for ZIP may OOM on low-end devices | High | Low | Stream file reading with chunked base64; set max recording size guard |
| R3 | Changing default `streamConfig.rate` from 100 to 215 may break simulation mode | Medium | High | Simulation mode must retain its own 50 Hz rate, only real-device path uses 215 |
| R4 | 1 Hz chart refresh may feel laggy to users expecting real-time | Low | Medium | Test UX with clinical team; 1 Hz is the specified requirement |
| R5 | Removing StreamConfigScreen rate picker breaks navigation flow | Low | Low | Keep screen but make rate read-only; preserve data type selector |
| R6 | ZIP export MIME type not handled by all Android share targets | Low | Medium | Fallback: offer per-file share if ZIP fails |
| R7 | Existing recordings in SQLite have wrong sampleRate (100 instead of 215) | Medium | High | Data migration or accept historical inaccuracy; document in release notes |

---

## 6. Success Criteria

| # | Criterion | Verification |
|---|----------|-------------|
| SC1 | History export produces a `.zip` file containing `session.json` + per-recording CSV files | Manual test: export session with 2+ recordings, verify ZIP structure |
| SC2 | `session.json` contains accurate metadata and references each CSV by filename | Inspect JSON contents after export |
| SC3 | Per-recording CSVs contain actual sEMG signal data (non-empty, correct `timestamp,value` format) | Open CSV, verify row count matches `sampleCount` |
| SC4 | Blob-uploaded CSV contains correct 215 Hz timestamps and signal data | Inspect uploaded file in Azurite blob storage |
| SC5 | Recording entity `sampleRate` field is always 215 for real-device recordings | Query SQLite after recording |
| SC6 | CaptureScreen chart shows exactly the last 4 seconds of data | Visual verification during streaming |
| SC7 | Chart renders at ~40 Hz display density (160 points for 4 seconds) | Count data points passed to SEMGChart |
| SC8 | Chart refreshes once per second (1 Hz update cadence) | Log or profile render frequency |
| SC9 | StreamConfigScreen displays 215 Hz as fixed (not user-configurable) | UI verification |
| SC10 | Simulation mode (no device) still works with its own 50 Hz rate | Test without BT device connected |
| SC11 | TypeScript strict mode: zero new type errors in modified files | `npm run type-check:all` |

---

## 7. Work Areas

### WA1: Domain Constants
- Add `DEVICE_SAMPLE_RATE_HZ = 215` and `CHART_DISPLAY_RATE_HZ = 40` constants to `@iris/domain`
- Update `StreamConfiguration` default documentation

### WA2: BluetoothContext Rate Fix
- Change `streamConfig.rate` default from 100 to 215
- Ensure `startStream()` and `stopStream()` use the fixed rate
- Preserve simulation mode's independent 50 Hz rate

### WA3: StreamConfigScreen Simplification
- Remove or disable the sampling rate picker (display 215 Hz as read-only)
- Keep data type selector functional
- Update summary section

### WA4: CaptureScreen CSV & Recording Fix
- `createCSVContent()` always uses 215 Hz for real-device timestamp interpolation
- `NewRecordingData.sampleRate` always set to 215 for real-device recordings
- Simulation mode retains 50 Hz

### WA5: Chart Visualization Fix
- `useStreamData()` refactored: 4-second sliding window, 40 Hz downsample output
- 1 Hz update cadence (throttle flush/re-render to once per second)
- `SEMGChart` rendered as fixed viewport (no horizontal ScrollView), 160 data points

### WA6: ZIP Export from History
- New `exportSessionAsZip()` function in `csvExport.ts`
- Builds `session.json` with metadata + recordings manifest
- Reads per-recording CSV from `recording.filePath` on disk
- Produces ZIP via `jszip` (or equivalent), shares via `expo-sharing`
- `HistoryScreen.handleExportSession()` calls the new function

### WA7: Type Safety & Cleanup
- Ensure all modified files pass TypeScript strict mode
- Remove dead code (unused export functions if replaced)
- Verify `@iris/domain` exports are correct

---

## 8. Affected Files Summary

| File | Work Area | Change Type |
|------|----------|-------------|
| `packages/domain/src/models/Stream.ts` | WA1 | Add constants |
| `apps/mobile/src/context/BluetoothContext.tsx` | WA2 | Default rate fix |
| `apps/mobile/src/screens/StreamConfigScreen.tsx` | WA3 | Rate picker read-only |
| `apps/mobile/src/screens/CaptureScreen.tsx` | WA4, WA5 | CSV fix, chart params |
| `apps/mobile/src/hooks/useStreamData.ts` | WA5 | 4s window, 40 Hz downsample, 1 Hz refresh |
| `apps/mobile/src/components/SEMGChart.tsx` | WA5 | Fixed viewport, no scroll |
| `apps/mobile/src/utils/csvExport.ts` | WA6 | New ZIP export function |
| `apps/mobile/src/screens/HistoryScreen.tsx` | WA6 | Wire ZIP export |
| `apps/mobile/package.json` | WA6 | Add `jszip` dependency |

---

## 9. Dependencies

- **jszip** (or equivalent) -- ZIP archive creation library compatible with Expo/React Native
- **expo-file-system** -- already installed, used for reading recording CSVs and writing ZIP
- **expo-sharing** -- already installed, used for sharing the ZIP file
- No backend changes required

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **sEMG** | Surface electromyography -- non-invasive measurement of muscle electrical activity |
| **215 Hz** | Fixed ADC sample rate of the ESP32 device (860 Hz raw / 4x downsample) |
| **StreamDataPacket** | Bluetooth data unit: `{ timestamp, values[] }` with 5-10 samples per packet |
| **allStreamPacketsRef** | Unbounded capture buffer in BluetoothContext holding ALL packets for CSV export |
| **Azurite** | Azure Storage emulator used for blob uploads in development |
