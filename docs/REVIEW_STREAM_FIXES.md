# Code Review: Stream Data Fixes

**Date**: 2026-02-17
**Reviewer**: TL (Tech Lead)
**Scope**: 9 files across 7 work areas (WA1–WA6 + cleanup)
**Architecture Reference**: `docs/ARCHITECTURE_STREAM_FIXES.md`

---

## Summary

All 9 specified files have been reviewed against the architecture specification and TypeScript strict-mode requirements. The implementation is largely compliant with the design. Two issues require attention before shipping.

| Severity | Count |
|----------|-------|
| BLOCKING | 0 |
| MUST-FIX | 2 |
| SUGGESTION | 5 |

**Gate decision**: [GATE:PASS] — No blocking issues found.

---

## File-by-File Review

---

### 1. `packages/domain/src/models/Stream.ts` — WA1

**Status**: PASS

All 4 constants are present with the correct values and JSDoc comments:
- `DEVICE_SAMPLE_RATE_HZ = 215` ✓
- `CHART_DISPLAY_RATE_HZ = 40` ✓
- `CHART_WINDOW_SECONDS = 4` ✓
- `SIMULATION_SAMPLE_RATE_HZ = 50` ✓

The `StreamConfiguration` interface comment correctly notes that `rate` is informational for real devices. No breaking changes to existing interfaces. No `any` types.

---

### 2. `apps/mobile/src/context/BluetoothContext.tsx` — WA2

**Status**: PASS

- `DEVICE_SAMPLE_RATE_HZ` and `SIMULATION_SAMPLE_RATE_HZ` imported from `@iris/domain` ✓
- Default `streamConfig.rate` initialized to `DEVICE_SAMPLE_RATE_HZ` ✓
- `configureStream()` sends `DEVICE_SAMPLE_RATE_HZ` in payload and stores it in state regardless of the `rate` argument ✓
- No `any` types introduced (the existing `any` in `onDeviceDisconnected` event callback was pre-existing)
- No scope creep

**MUST-FIX M1**: The comment on line 103 reads `// Keep only last 500 packets (~5 seconds at 100Hz) for UI performance`. This references the old 100 Hz assumption. With 215 Hz and ~5–8 samples/packet, 500 packets represent approximately 2.3–3.7 seconds, not 5 seconds. The comment is misleading. Update to: `// Keep last 500 packets (~2-3 seconds at 215 Hz) for UI performance`.

---

### 3. `apps/mobile/src/screens/StreamConfigScreen.tsx` — WA3

**Status**: PASS

- Rate picker replaced with read-only `readOnlyBox` display ✓
- `DEVICE_SAMPLE_RATE_HZ` imported from `@iris/domain` ✓
- `handleSave()` passes `DEVICE_SAMPLE_RATE_HZ` explicitly ✓
- `SAMPLING_RATES` array and `selectedRate` state removed ✓
- `requiresHighSpeed` variable and baud-rate warning removed ✓
- `readOnlyBox`, `readOnlyValue`, `readOnlyHint` styles present ✓
- `navigation: any` on line 15 is pre-existing (not introduced by this PR)
- No scope creep

---

### 4. `apps/mobile/src/screens/CaptureScreen.tsx` — WA4 + WA5

**Status**: PASS WITH NOTE

- `DEVICE_SAMPLE_RATE_HZ` and `SIMULATION_SAMPLE_RATE_HZ` imported from `@iris/domain` ✓
- `useStreamData()` called with 2 parameters (not 3) ✓
  - `processedData = useStreamData(streamData, DEVICE_SAMPLE_RATE_HZ)` ✓
  - `simulationProcessedData = useStreamData(simulationData, SIMULATION_SAMPLE_RATE_HZ)` ✓
- `autoScroll` prop removed from `SEMGChart` ✓
- `sampleRate` in `SEMGChart` uses constants ✓
- CSV timestamp fix: `sampleRate = selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ` ✓
- `calculateMetrics()` uses constants for `frequency` field ✓
- `createCSVContent()` receives the corrected `sampleRate` local variable ✓

**MUST-FIX M2**: In `handleStopRecording()` at line 232, the `recordingData.sampleRate` is set as:
```typescript
sampleRate: selectedDevice ? sampleRate : 50,
```
The `sampleRate` local variable correctly resolves to `DEVICE_SAMPLE_RATE_HZ` (215) when a device is present. However, the fallback `50` is a hardcoded magic number — not `SIMULATION_SAMPLE_RATE_HZ`. It happens to equal `SIMULATION_SAMPLE_RATE_HZ` today, but this is fragile. Change to:
```typescript
sampleRate: sampleRate,
```
The `sampleRate` local variable already branches between `DEVICE_SAMPLE_RATE_HZ` and `SIMULATION_SAMPLE_RATE_HZ` on line 205. The redundant ternary should be collapsed.

---

### 5. `apps/mobile/src/hooks/useStreamData.ts` — WA5

**Status**: PASS

Architecture compliance:
- 4-second sliding window: `maxSamples = sampleRate * CHART_WINDOW_SECONDS` → 215 × 4 = 860 ✓
- 40 Hz downsample: `downsampleStep = Math.round(215 / 40)` = 5, yielding ~172 points from 860 ✓
- 1 Hz refresh: `setInterval(processData, 1000)` ✓
- `useRef`-based latest data avoids stale closures ✓
- Immediate call to `processData()` on mount ✓
- Interval cleanup on unmount ✓
- `EMPTY_RESULT` sentinel avoids repeated object allocation ✓
- 3-parameter signature removed (no `maxBufferSeconds`) ✓

**Note on math**: `Math.round(215 / 40) = 5`. With 860 windowed samples and step=5, the chart will have `Math.floor(860 / 5) = 172` points — slightly more than the 160 described in the spec. The spec describes this as "~160 points", acknowledging the approximation. This is acceptable; the fixed viewport design means extra points simply increase resolution slightly. No action needed.

Statistics use `windowed` data (not `flatSamples`), which means `totalSamples` correctly reports total stream length while stats reflect the visible window — correct behavior.

**SUGGESTION S1**: The `StreamType` import on line... wait — `StreamType` is imported in the old version but the new implementation only imports `ProcessedStreamData`, `ChartDataPoint`, `StreamDataPacket`, `DEVICE_SAMPLE_RATE_HZ`, `CHART_DISPLAY_RATE_HZ`, `CHART_WINDOW_SECONDS`. Checking the actual file — confirmed `StreamType` is NOT imported in the new hook (it is used only by `getYAxisRange` which still exports `StreamType` in its signature). This is clean; no dead import.

No `any` types. Import alias `@iris/domain` used correctly (not a relative path). No scope creep.

---

### 6. `apps/mobile/src/components/SEMGChart.tsx` — WA5

**Status**: PASS

- `ScrollView` and `scrollViewRef` removed ✓
- Auto-scroll `useEffect` removed ✓
- `autoScroll` prop removed from interface ✓
- Width uses full `availableWidth = screenWidth - 80` ✓
- `spacing = availableWidth / Math.max(data.length - 1, 1)` — dynamic ✓
- Sub-header text: `{sampleRate} Hz | Last {CHART_WINDOW_SECONDS}s window | {CHART_DISPLAY_RATE_HZ} Hz display` ✓
- "Auto-scrolling" text removed ✓
- Imports `CHART_WINDOW_SECONDS, CHART_DISPLAY_RATE_HZ` from `@iris/domain` ✓

**SUGGESTION S2**: The `LineChart` renders with `maxValue={100}` and `mostNegativeValue={-100}`, but the Y-axis label on line 113 reads `Amplitude (-500 to +500, zero-centered)`. There is a mismatch between the displayed range label and the chart's actual Y-axis bounds. The `getYAxisRange` helper in `useStreamData.ts` returns `[-500, 500]` but SEMGChart does not call it — the chart clip range is hardcoded at ±100. This mismatch existed before this PR (architecture does not specify chart bounds change), but the label is now more visible with the fixed viewport. Consider aligning the label with the actual bounds, or wiring `getYAxisRange` to the chart props. Non-blocking but visually confusing.

**SUGGESTION S3**: The empty state `chartData` fallback (lines 31–34) generates 3 synthetic placeholder points with `value: 0`, `500`, `0`. This causes a visual spike to 500 in an empty chart. A flat zero line `[{value: 0}, {value: 0}, {value: 0}]` would be cleaner. Non-blocking.

---

### 7. `apps/mobile/src/utils/csvExport.ts` — WA6

**Status**: PASS

- `jszip` imported at top level ✓
- `SessionJsonMetadata` interface defined (not exported — correct, it's internal) ✓
- `SessionMetadata` exported interface present ✓
- `RecordingForExport` exported interface present ✓
- `exportSessionAsZip()` signature matches spec ✓
- Validation guards: `recordings.length === 0` and `recordings.length !== csvContents.length` ✓
- `session.json` content: all spec fields present ✓
- Per-recording CSV files named `recording_001.csv`, `recording_002.csv` ✓
- ZIP generation uses `type: 'base64'` ✓
- Written with `FileSystem.EncodingType.Base64` ✓
- `shareZip()` function present with `mimeType: 'application/zip'` ✓
- Existing `exportSessionData()` and `shareCSV()` retained for backward compatibility ✓
- Local `StreamDataPacket` interface on lines 13–16 is a **duplicate** of the domain type — pre-existing and used by `exportStreamDataSimpleCSV`/`exportStreamDataSingleLineCSV`. This was not introduced by this PR.

**SUGGESTION S4**: The `exportSessionData()` function (legacy) should be marked `@deprecated` with a JSDoc tag as recommended in the architecture doc (section 3.7, item 2). It is not called by `HistoryScreen` anymore. Low-urgency but improves code discoverability.

---

### 8. `apps/mobile/src/screens/HistoryScreen.tsx` — WA6

**Status**: PASS

- Imports `exportSessionAsZip`, `shareZip`, `SessionMetadata`, `RecordingForExport` from `@/utils/csvExport` ✓
- `exportSessionData`, `shareCSV`, `RecordingDataPoint` removed from imports ✓
- `import * as FileSystem from 'expo-file-system'` present ✓
- `handleExportSession()` rewritten with file-reads from disk ✓
- Sequential `for...of` loop (not `Promise.all`) for OOM safety ✓
- Fallback strings for missing files: `'# File not found on disk\n'` and `'# No file path recorded\n'` ✓
- `setExportingSessionId(null)` in `finally` block ✓
- Button label updated to "Export ZIP" ✓
- No `any` types introduced

**SUGGESTION S5**: The `metadata.sampleRate` is taken from `recordings[0]?.sampleRate ?? 215` (line 205). The hardcoded fallback `215` is appropriate but should ideally reference `DEVICE_SAMPLE_RATE_HZ` from `@iris/domain` for consistency. Import cost is zero since the package is already a dependency. Non-blocking.

---

### 9. `apps/mobile/package.json` — WA6

**Status**: PASS

- `"jszip": "^3.10.1"` present in `dependencies` ✓
- No `@types/jszip` entry — consistent with jszip 3.10+ shipping its own type declarations ✓
- No other unexpected dependency changes

---

## Must-Fix Summary

**M1 — Stale comment in BluetoothContext.tsx (line 103)**
File: `apps/mobile/src/context/BluetoothContext.tsx`
Change: `// Keep only last 500 packets (~5 seconds at 100Hz) for UI performance` → `// Keep last 500 packets (~2-3 seconds at 215 Hz) for UI performance`

**M2 — Magic number in CaptureScreen.tsx (line 232)**
File: `apps/mobile/src/screens/CaptureScreen.tsx`
Change: `sampleRate: selectedDevice ? sampleRate : 50` → `sampleRate: sampleRate`

The `sampleRate` local variable (line 205) already uses `SIMULATION_SAMPLE_RATE_HZ` for the no-device path. The redundant conditional reintroduces a magic number that will silently break if `SIMULATION_SAMPLE_RATE_HZ` changes.

---

## Suggestions Summary

| # | File | Issue |
|---|------|-------|
| S1 | (none) | No stale imports found — N/A |
| S2 | `SEMGChart.tsx` | Y-axis label says ±500 but chart clips at ±100 |
| S3 | `SEMGChart.tsx` | Empty state placeholder shows a spike at value 500 |
| S4 | `csvExport.ts` | `exportSessionData()` should be marked `@deprecated` |
| S5 | `HistoryScreen.tsx` | Hardcoded `215` fallback should use `DEVICE_SAMPLE_RATE_HZ` |

---

## Architecture Compliance Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| WA1: 4 domain constants at correct values | PASS | |
| WA2: Default rate = 215, configureStream hardened | PASS | |
| WA3: Rate picker → read-only display | PASS | |
| WA4: CSV timestamps use DEVICE_SAMPLE_RATE_HZ | PASS | M2 needed for sampleRate stored in recording |
| WA5: 4s window, 40 Hz downsample, 1 Hz refresh | PASS | |
| WA5: SEMGChart fixed viewport, no ScrollView | PASS | |
| WA6: jszip dependency added | PASS | |
| WA6: exportSessionAsZip() implemented | PASS | |
| WA6: HistoryScreen reads files from disk | PASS | |
| WA7: No dead imports, no `any` introduced | PASS | |
| TypeScript strict compliance | PASS | No new `any` types |
| Import aliases (@/) and (@iris/domain) | PASS | |
| No scope creep outside 9 listed files | PASS | |

---

[GATE:PASS]
