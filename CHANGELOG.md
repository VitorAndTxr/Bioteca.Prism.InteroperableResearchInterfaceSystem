# Changelog

All notable changes to the IRIS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Changed

- CSV recording now writes incrementally at full 215 Hz during capture (was bulk-write at ~50 Hz on stop)
- Chart display receives downsampled data (50→10 samples per BT packet, ~43 Hz effective rate)

### Added

- `startRecording(sessionId)` / `stopRecording()` API in BluetoothContext for incremental CSV lifecycle
- `isFlushingRef` re-entrancy guard for async flush operations
- `vitest.config.ts` for mobile app unit testing (37 tests)
- `serializePacketToCSV()` and `downsamplePacket()` pure helper functions

### Removed

- `allStreamPacketsRef` and `getAllStreamPackets()` — replaced by incremental disk writes
- Bulk `createCSVContent()` for real device recordings (kept as `createSimulationCSVContent` for simulation mode)

### Fixed

- Stream data not populating CSV for blob storage upload — root cause: `isStreaming` flag only set via JSON ACK, never triggered with binary protocol firmware (`BluetoothContext.tsx`)
- Chart on CaptureScreen static during real device recording — same root cause: batch flush interval never started without `isStreaming = true`
- Stop recording not sending StopStream command — guard checked `isStreaming` which was always `false` (`CaptureScreen.tsx`)
- Added 200ms delay before CSV export to capture trailing BT packets (`CaptureScreen.tsx`)

---
