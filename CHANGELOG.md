# Changelog

All notable changes to the IRIS project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Fixed

- Stream data not populating CSV for blob storage upload — root cause: `isStreaming` flag only set via JSON ACK, never triggered with binary protocol firmware (`BluetoothContext.tsx`)
- Chart on CaptureScreen static during real device recording — same root cause: batch flush interval never started without `isStreaming = true`
- Stop recording not sending StopStream command — guard checked `isStreaming` which was always `false` (`CaptureScreen.tsx`)
- Added 200ms delay before CSV export to capture trailing BT packets (`CaptureScreen.tsx`)

---
