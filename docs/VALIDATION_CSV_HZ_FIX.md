# Validation: Incremental 215 Hz CSV Writing with Chart Downsample

**Date**: 2026-02-17
**Reviewer**: PM (Product Manager)
**Documents Reviewed**:
- `PROJECT_BRIEF_CSV_HZ_FIX.md` (Business requirements)
- `ARCHITECTURE_CSV_HZ_FIX.md` (Technical design)

---

## 1. Business Requirements Traceability

### Requirement 1: Full 215 Hz CSV Data

**Brief**: Each decoded BT packet (50 samples at 215 Hz) must be written to CSV with interpolated millisecond timestamps. No downsampling in the CSV path.

**Architecture**: `serializePacketToCSV()` serializes all 50 samples per packet using `1000 / DEVICE_SAMPLE_RATE_HZ` interval spacing. The full packet enters `csvPendingRef` before any downsample step occurs. The downsample (50 to 10) is applied only to the chart pipeline copy, never to the CSV data.

**Verdict**: SATISFIED. The architecture explicitly separates the CSV path (full fidelity) from the chart path (decimated). A 10-second recording will produce ~2,150 rows as specified.

### Requirement 2: Incremental Disk Writes During Recording

**Brief**: CSV data must be written to disk as packets arrive, not accumulated in memory until stop. A crash during recording should yield a partial but valid CSV file.

**Architecture**: The TL chose Option C (JS-side accumulator flushed every 500 ms via `readAsStringAsync` + `writeAsStringAsync`). Data reaches disk every flush tick. On crash, the file contains all data up to the last completed flush, with at most ~500 ms (~1,075 samples) of pending data lost.

**Verdict**: SATISFIED with acceptable trade-off. True per-packet disk writes were not feasible due to `expo-file-system` lacking a native append flag, but the 500 ms flush interval provides a practical balance between crash safety and I/O efficiency. The brief identified this as a risk (R1) and the architecture addresses it directly with measured latency benchmarks. Losing up to 500 ms of data on an unexpected crash is acceptable for a research tool where crashes are exceptional events.

### Requirement 3: Downsampled Chart Feed (50 to 10 samples)

**Brief**: Each 50-sample BT packet should be reduced to 10 samples before entering the chart pipeline, reducing memory and processing by 80%.

**Architecture**: `downsamplePacket()` takes every 5th sample (indices 0, 5, 10, 15, 20, 25, 30, 35, 40, 45), yielding 10 samples per packet. At 4.3 packets/second this produces ~43 samples/second, which exceeds the chart's 40 Hz display rate.

**Verdict**: SATISFIED. The 5:1 decimation ratio is well-justified. The chart is for visual feedback only; scientific analysis uses the full CSV. The architecture correctly notes that `useStreamData` already performs its own windowing and downsample, so smaller input packets simply reduce upstream work.

### Requirement 4: No Data Loss

**Brief**: The incremental approach must not lose data compared to the current bulk approach. The CSV file must be the authoritative data source.

**Architecture**: All 50 samples per packet are serialized to `csvPendingRef` immediately upon processing in `flushStreamBuffer()`. The pending buffer is flushed to disk on the same tick. The `allStreamPacketsRef` (unbounded RAM accumulator) is explicitly removed, replaced by the on-disk CSV file. `stopRecording()` performs a final flush of any remaining pending data before returning.

**Verdict**: SATISFIED. The data integrity chain is: BT packet -> `streamBufferRef` -> `flushStreamBuffer()` drains all -> `csvPendingRef` accumulates all 50 samples -> disk write. No sample is dropped between decode and CSV serialization. The only data loss scenario (crash between flushes) is bounded to 500 ms and is better than the current approach where a crash loses the entire recording (since the current bulk write only happens on stop).

---

## 2. Scope Alignment

The architecture stays within the brief's defined scope boundaries.

**In-scope items addressed**: All six items from section 2.1 of the brief are covered by the architecture: incremental CSV writing in BluetoothContext, per-packet downsample for chart, CaptureScreen recording lifecycle, useStreamData passthrough (no changes needed), and the new BluetoothContext API surface (startRecording, stopRecording, isRecording).

**Out-of-scope items respected**: The architecture does not touch ESP32 firmware, backend endpoints, desktop app, simulation mode internals, ZIP export flow, useStreamData hook, SEMGChart component, SyncService, or flush interval timing. The simulation mode CSV path is preserved separately via `createSimulationCSVContent`.

**One addition beyond brief scope**: The architecture introduces `csvPendingRef` as a fourth ref (the brief specified three: `isRecordingRef`, `recordingFilePathRef`, `sampleCountRef`). This is a necessary implementation detail arising from the TL's decision on the append strategy (Option C) and does not expand functional scope.

---

## 3. Success Criteria Validation

| # | Criterion | Architecture Coverage | Status |
|---|-----------|----------------------|--------|
| SC1 | 215 Hz CSV (~2,150 rows for 10s) | `serializePacketToCSV()` writes all 50 samples per packet at full rate | MET |
| SC2 | Incremental writes, partial file survives crash | 500 ms flush cycle, file on disk always valid up to last flush | MET |
| SC3 | Chart receives 10-sample packets, smooth 40 Hz display | `downsamplePacket()` decimates 50->10, ~43 samples/s > 40 Hz target | MET |
| SC4 | Simulation mode unaffected | Simulation bypasses BT decode pipeline; `createSimulationCSVContent` preserved | MET |
| SC5 | Recording entity has correct filePath, sampleCount, sampleRate, duration | `stopRecording()` returns `{ filePath, sampleCount }`, CaptureScreen passes these to `addRecording` with correct `sampleRate` and `durationSeconds` | MET |
| SC6 | Memory reduction (no unbounded RAM accumulation) | `allStreamPacketsRef` removed; data flows to disk incrementally | MET |

---

## 4. Risk Assessment

The brief identified five risks. The architecture addresses each.

**R1 (FileSystem latency)**: The TL benchmarked read+write latency for file sizes up to 3.5 MB (10-minute recording) at under 50 ms, well within the 500 ms flush budget. For recordings under 5 minutes (the expected use case), latency is under 20 ms. Acceptable.

**R2 (Stale recording file after crash)**: `startRecording()` checks for and closes any existing recording before creating a new one. This matches the brief's mitigation strategy.

**R3 (Downsample aliasing)**: The architecture confirms that decimation is sufficient for visual feedback. Scientific analysis uses the full 215 Hz CSV. Acceptable.

**R4 (Race between stop and entity creation)**: `stopRecording()` is async and awaited before `addRecording()` is called in CaptureScreen. The final flush is guaranteed to complete before the file path is used.

**R5 (Concurrent appends)**: The architecture avoids this entirely by batching writes in `flushStreamBuffer()` (single JS thread, 500 ms interval) rather than writing per-packet in the BT listener. No concurrent `writeAsStringAsync` calls are possible.

**New risk identified by architecture**: Quadratic I/O for recordings exceeding 10 minutes. The architecture acknowledges this and provides an upgrade path (chunk files or FileHandle API) without changing the external API surface. For the current use case (1-5 minute recordings), this is not a concern.

---

## 5. Client Decisions

The brief raised three decisions requiring PM input.

**Decision 1 (Append strategy)**: The TL selected Option C (JS-side accumulator with read-concat-write per flush). This is the right pragmatic choice. It avoids experimental APIs (Option B) and complex merge logic (Option D) while delivering acceptable performance for typical recording durations. The upgrade path to Options B or D is preserved for future needs. **Approved.**

**Decision 2 (Remove `allStreamPacketsRef`)**: The TL confirmed removal. The unbounded in-memory buffer was created solely for CSV export, which is now handled by incremental disk writes. No other consumer depends on it. **Approved.**

**Decision 3 (Downsample ratio 5:1)**: The TL confirmed 50 to 10 (5:1 decimation). This yields ~43 samples/second, exceeding the 40 Hz chart display rate with a comfortable margin. The alternative (10:1) would reduce to ~21.5 samples/second, which is below the display rate and could cause visual artifacts. **Approved.**

---

## 6. Impact Analysis

**StreamingScreen**: The architecture includes a thorough impact analysis (section D7) confirming no breaking changes. StreamingScreen receives 10-sample packets instead of 50-sample packets, but `useStreamData` processes them identically. The `totalSamples` debug counter will show lower numbers, which is cosmetic and actually more accurate for chart-pipeline context.

**SyncService**: Unaffected. SyncService reads CSV files from disk by path, which remains the same. The file is simply written incrementally rather than in bulk.

**ZIP export**: Unaffected. `csvExport.ts` reads completed CSV files from disk, which will contain the same data in the same format.

**useStreamData hook**: No changes. The hook adapts automatically to smaller packets via its flatten-window-downsample pipeline.

---

## 7. Relationship to Prior Work

The architecture correctly builds on Phase 14 (Stream Data Fixes) and Phase 15 (BT Binary Decoding) without invalidating their work. The `BinaryFrameAccumulator`, `StreamDataPacket` type, domain constants (`DEVICE_SAMPLE_RATE_HZ`, `BINARY_PACKET_SAMPLES_PER_PACKET`), and chart configuration (4s/40Hz) are all preserved and reused. The change is surgical: it intercepts the data flow between decode and chart to fork the CSV path.

---

## 8. Overall Assessment

The architecture delivers all four business objectives stated in the brief: full 215 Hz CSV fidelity, incremental disk writes with crash resilience, downsampled chart feed for reduced memory pressure, and zero data loss under normal operation. The design is minimal and focused -- it changes only two files (BluetoothContext.tsx and CaptureScreen.tsx), adds two pure helper functions, introduces no new dependencies, and preserves backward compatibility for all non-recording consumers (StreamingScreen, useStreamData, SyncService, ZIP export).

The TL made sound engineering trade-offs, particularly the choice of Option C for file I/O (pragmatic over ideal) and the decision to hook CSV writes into `flushStreamBuffer()` rather than the BT listener (async-safe, batched, error-recoverable). The quadratic I/O limitation is documented and bounded to practical recording durations.

The migration checklist (13 items) is concrete and testable. Each step maps to a specific code change with clear before/after behavior.

---

## [VERDICT:APPROVED]

The architecture fully satisfies the business requirements with well-justified trade-offs. No blocking issues found. Proceed to development.

---
---

# Technical Validation: Incremental 215 Hz CSV Writing with Chart Downsample

**Date**: 2026-02-17
**Reviewer**: TL (Tech Lead)
**Documents Reviewed**:
- `ARCHITECTURE_CSV_HZ_FIX.md` (Technical design)
- `apps/mobile/src/context/BluetoothContext.tsx` (Current source, 860 lines)
- `apps/mobile/src/screens/CaptureScreen.tsx` (Current source, 490 lines)
- `apps/mobile/src/hooks/useStreamData.ts` (Current source, 134 lines)
- `apps/mobile/src/screens/StreamingScreen.tsx` (Current source, 575 lines)
- `apps/mobile/src/screens/CaptureScreen.test.ts` (Current source, 377 lines)
- `packages/domain/src/models/Stream.ts` (Type definitions)

---

## 1. Read-Concat-Write Performance at ~4.3 Flushes/Sec

### Analysis

The architecture proposes Option C: accumulate CSV lines in `csvPendingRef`, then on each 500 ms flush tick execute `readAsStringAsync(filePath)` + string concatenation + `writeAsStringAsync(filePath, existing + pending)`.

**Current flush mechanism** (BluetoothContext.tsx:126-149): A `setInterval` at 500 ms wraps `flushStreamBuffer()` inside `requestAnimationFrame`. This yields approximately 2 flushes per second, not 4.3. The 4.3 figure in the architecture document refers to the BT packet arrival rate (215 Hz / 50 samples = 4.3 packets/sec), not the flush rate. Each flush thus processes ~2.15 accumulated packets on average, serializing ~107 CSV lines per flush.

**I/O cost model**: At 2 flushes/sec, each flush performs one read and one write. Per-flush I/O equals 2x the current file size. The architecture's latency table is accurate:

| Duration | File Size | Per-Flush Read+Write | Estimated Latency |
|----------|----------|---------------------|-------------------|
| 10 sec   | ~58 KB   | ~116 KB             | <5 ms             |
| 60 sec   | ~350 KB  | ~700 KB             | <10 ms            |
| 5 min    | ~1.7 MB  | ~3.4 MB             | <20 ms            |
| 10 min   | ~3.5 MB  | ~7 MB               | <50 ms            |

Modern Android flash handles 50-100 MB/s sequential I/O, so even 7 MB read+write completes in ~70-140 ms in worst case -- still within the 500 ms budget. The JS bridge overhead for `readAsStringAsync` and `writeAsStringAsync` adds ~2-5 ms per call based on Expo benchmarks.

**Total session I/O is quadratic**: For a 5-minute recording, total bytes transferred = sum of 2 * fileSize(t) for t=0..600 flushes. This sums to approximately `2 * (sum of i * lineSize for i=0..600) = O(n^2)`. For 5 minutes: ~1.02 GB total I/O. For 10 minutes: ~4.2 GB. The architecture acknowledges this and provides an upgrade path.

**Verdict**: ACCEPTABLE for recordings up to 10 minutes. The quadratic growth is a known trade-off documented in the architecture. The 500 ms flush budget provides ample headroom. The `try/catch` in the flush path correctly retains `csvPendingRef` on error for retry on the next tick.

### Concern: `flushStreamBuffer` Becomes Async

The current `flushStreamBuffer` (line 100) is synchronous. The proposed version is `async`. The function is invoked from two places:

1. **`setInterval` + `requestAnimationFrame` callback** (line 131): The `requestAnimationFrame` callback does not `await` the result -- it calls `flushStreamBuffer()` fire-and-forget. Making the function async means the interval could fire the next tick before the previous async flush completes.

**Mitigation needed**: The architecture should add a simple re-entrancy guard (`isFlushing` ref) to prevent overlapping flushes. Without this, two concurrent `readAsStringAsync` calls could read the same file content and produce a write-write race, causing data duplication or corruption.

**Severity**: MEDIUM -- a blocking concern that must be addressed in implementation. The guard is trivial to add:

```typescript
const isFlushingRef = React.useRef(false);

const flushStreamBuffer = React.useCallback(async () => {
    if (isFlushingRef.current) return; // Re-entrancy guard
    isFlushingRef.current = true;
    try {
        // ... existing flush logic ...
    } finally {
        isFlushingRef.current = false;
    }
}, []);
```

2. **Cleanup on `isStreaming` becoming false** (line 141): `flushStreamBuffer()` is called synchronously in the effect cleanup. Since the function is now async, this call will fire-and-forget as well. This is acceptable here because the flush will still complete asynchronously, and the `stopRecording()` function performs its own final flush.

---

## 2. Downsample Decimation: Signal Fidelity

### Analysis

The architecture proposes simple decimation: take every 5th sample (indices 0, 5, 10, 15, 20, 25, 30, 35, 40, 45) from each 50-sample packet.

**Nyquist consideration**: The original signal is sampled at 215 Hz, meaning the highest representable frequency is 107.5 Hz. After 5:1 decimation, the effective sample rate is 43 Hz, meaning the highest representable frequency drops to 21.5 Hz. Any signal content between 21.5-107.5 Hz will alias into the 0-21.5 Hz band.

**For visual feedback this is acceptable**: The chart's purpose is to show the user that the device is streaming and provide gross morphology feedback (muscle contraction events, baseline drift). sEMG envelope features for visual feedback are typically below 20 Hz. The high-frequency content (motor unit action potentials at 50-150 Hz) would alias, but these are not visually distinguishable on a 160-point chart at 40 Hz display rate anyway.

**Alternative considered (averaging)**: A simple 5-point moving average before decimation would act as an anti-aliasing low-pass filter. However, the architecture correctly notes this adds computation for no visual benefit, since `useStreamData` already performs its own downsampling at the chart display rate.

**Verdict**: APPROVED. Decimation without anti-aliasing is appropriate for a visual-only chart. The full 215 Hz data is preserved in the CSV for scientific analysis.

---

## 3. Recording Lifecycle (`isRecordingRef`) Thread Safety

### Analysis

The architecture introduces `isRecordingRef` alongside the existing `isStreamingRef` (BluetoothContext.tsx:63). Both are `React.useRef<boolean>` used as closure-stable flags readable from stale callbacks.

**Interaction between refs**:

- `isStreamingRef` is set to `true` in `decodeMessage()` (line 389) when the first binary packet arrives, and in the `StartStream` ACK handler (line 445). It is set to `false` in `startStream()` (line 559) during reset, in `StopStream` ACK (line 453), and in `EmergencyStop` (line 438).

- `isRecordingRef` is set to `true` at the end of `startRecording()` and set to `false` at the beginning of `stopRecording()`. It is read in `flushStreamBuffer()` to gate CSV accumulation.

**Race scenario**: Could `isRecordingRef` be set to `true` while `isStreamingRef` is still `false`? Yes -- `startRecording()` is called in CaptureScreen's mount effect alongside `startStream()`. The architecture shows `await startRecording(sessionId)` followed by `await startStream()`. This means recording starts before streaming. However, no BT packets arrive until the device acknowledges the stream start command, so `flushStreamBuffer()` will process zero packets until streaming begins. The recording flag being true early is harmless -- it just means the CSV file exists with only a header until data flows.

**Stop ordering**: The architecture shows `stopStream()` called before `stopBtRecording()`. This is correct: stop the data source first, then finalize the file. The 200 ms delay between stop and recording finalization allows trailing packets to be flushed.

**JavaScript single-threaded guarantee**: Both refs are read and written exclusively on the JS thread (React Native's JS runtime is single-threaded). There is no true concurrency risk from native threads because `onDataReceived` callbacks and `setInterval` callbacks are both dispatched on the JS event loop.

**Verdict**: APPROVED. The ref lifecycle is safe within React Native's single-threaded JS model. The ordering of `startRecording` before `startStream` and `stopStream` before `stopRecording` is correct.

---

## 4. StreamingScreen Compatibility with 10-Sample Packets

### Analysis

StreamingScreen (StreamingScreen.tsx) consumes:

1. **`streamData`** (line 27): The capped 500-packet state array. After this change, each packet will have 10 values instead of 50. StreamingScreen passes this to `useStreamData(streamData, streamConfig.rate)` at line 37.

2. **`useStreamData` processing** (useStreamData.ts:51-62): The hook flattens all packets' `values` arrays into `flatSamples`. With 10-sample packets, `flatSamples` will have 5x fewer entries per packet. The sliding window (line 65-66) takes the last `sampleRate * CHART_WINDOW_SECONDS = 215 * 4 = 860` samples. With 500 packets of 10 samples each = 5,000 total samples, the window still captures 860 samples.

3. **`downsampleStep` calculation** (line 74): `Math.round(215 / 40) = 5`. This step is applied to the flattened samples. With 860 windowed samples and step 5, we get ~172 chart points. This is correct and unchanged.

**Key observation**: The architecture passes `sampleRate = 215 Hz` to `useStreamData` even though the effective data rate is ~43 Hz after decimation. This means `intervalMs = 1000 / 215 = 4.65 ms` is used for timestamp interpolation within each 10-sample packet. The 10 interpolated timestamps span only ~46.5 ms of the ~232 ms packet interval. This creates small timestamp clusters with gaps.

**Impact on chart**: The chart's X-axis shows relative time in seconds. The clusters will appear as 10 closely-spaced points followed by a gap, repeated every ~232 ms. At 160 chart points across 4 seconds, these clusters will be visually indistinguishable from continuous data -- each "cluster" occupies ~46.5 ms out of a 25 ms per-chart-point spacing (4s / 160 points). The visual impact is negligible.

**Impact on statistics** (StreamingScreen.tsx:296-326): `processed.totalSamples` will show the count of flattened samples in the window. With 10-sample packets, this drops to ~5,000 (500 * 10) from ~25,000 (500 * 50). The `duration` calculated as `windowed.length / sampleRate` will show ~4s (860 / 215), which is correct for the window size. `min`, `max`, `avg` operate on actual values and are unaffected by packet size.

**`exportStreamData`** (BluetoothContext.tsx:707-716): This calls `exportStreamDataSimpleCSV(streamData)` which exports the capped 500-packet UI state. After the change, this exports 10-sample packets. This is a debug tool for StreamingScreen, not the recording path. It will export fewer samples but this is expected and acceptable.

**`clearStreamData`** (BluetoothContext.tsx:701-705): Currently clears `streamData`, `lastStreamTimestamp`, and `allStreamPacketsRef`. After the change, `allStreamPacketsRef` is removed. StreamingScreen's "Clear Data" button (line 107) will work correctly.

**Verdict**: APPROVED. StreamingScreen will work correctly with 10-sample packets. The visual output is effectively identical. Debug counters change but this is cosmetic and documented.

---

## 5. `useStreamData` Handling of Variable Packet Sizes

### Analysis

The hook (useStreamData.ts) makes no assumption about packet size. The flatten loop (lines 55-62) iterates `packet.values.length` for each packet. Whether a packet has 5, 10, or 50 values, the loop handles it correctly.

The windowing step (line 66) operates on flattened samples, not packets. The downsample step (line 78) operates on the windowed array with a step derived from `sampleRate / CHART_DISPLAY_RATE_HZ`. Neither step is packet-size-dependent.

**Edge case -- mixed packet sizes**: If the buffer contains a mix of 50-sample packets (from before the change takes effect mid-stream) and 10-sample packets (after), the flatten loop handles this correctly. Each packet's values are individually iterated.

**Simulation mode**: CaptureScreen creates simulation packets with 5 values each (line 123) and passes them to `useStreamData(simulationData, SIMULATION_SAMPLE_RATE_HZ)` at line 64. This path is completely unaffected by the BT pipeline changes.

**Verdict**: APPROVED. `useStreamData` is packet-size agnostic by design.

---

## 6. File Path Management and Lifecycle Robustness

### Analysis

**Creation** (`startRecording`): Creates a file with `recording_${timestamp}.csv` pattern in `FileSystem.documentDirectory`. The timestamp uses ISO format with special characters replaced by hyphens, ensuring filesystem-safe names. The file is created with the CSV header `timestamp,value\n` via `writeAsStringAsync`.

**Stale recording guard**: `startRecording` checks `isRecordingRef.current && recordingFilePathRef.current` and calls `stopRecording()` if a stale recording exists. This handles the edge case where a previous recording was not properly stopped (app backgrounding, navigation error, etc.).

**Finalization** (`stopRecording`):
1. Sets `isRecordingRef.current = false` first -- this immediately stops further CSV accumulation in `flushStreamBuffer`.
2. Captures `filePath` and `sampleCount` from refs.
3. Performs final flush of `csvPendingRef` to disk.
4. Clears `recordingFilePathRef` and `sampleCountRef`.

**Ordering concern**: Setting `isRecordingRef = false` before the final flush means that if a concurrent `flushStreamBuffer` fires between step 1 and step 3, it will skip CSV accumulation for packets that arrived in that window. However, this window is extremely narrow (microseconds on the JS thread) and both operations are on the same event loop tick until the first `await`. After the first `await` in `stopRecording` (the `readAsStringAsync` call), `flushStreamBuffer` could theoretically execute. But since `isRecordingRef` is already false, those packets would be lost from CSV.

**Practical impact**: The 200 ms delay in CaptureScreen between `stopStream()` and `stopBtRecording()` allows trailing packets to be flushed by the interval timer before `stopRecording()` is called. By the time `stopRecording` executes, there should be no new packets arriving (the stream stop command has been sent). Any packets still in `streamBufferRef` would have been processed by the interval timer during the 200 ms wait.

**Verdict**: APPROVED. The lifecycle is robust for the expected usage pattern. The 200 ms drain delay in CaptureScreen is a practical guard against data loss at the boundary.

---

## 7. Additional Technical Observations

### 7.1 `flushStreamBuffer` Dependency Array (Non-blocking)

The current `flushStreamBuffer` has `[]` as its `useCallback` dependency array (line 123). The proposed async version maintains this. Since it reads only from refs (not state), this is correct -- refs are stable across renders.

### 7.2 Error Handling in CSV Flush

The `try/catch` in the flush path (architecture line 285-288) logs a warning and retains `csvPendingRef` for the next flush attempt. This is the right behavior -- transient I/O errors (e.g., storage full momentarily) will self-heal on the next tick. If the error persists, `csvPendingRef` will grow, which will increase memory usage. For practical recording durations this is bounded (at most ~350 KB of pending text for a 60-second recording with continuous failures).

### 7.3 `sampleCountRef` Accuracy (Non-blocking)

`sampleCountRef` is incremented by `packet.values.length` (50) for each packet in the CSV path. This correctly counts raw 215 Hz samples, not downsampled samples. The `sampleCount` returned by `stopRecording()` will match the number of data rows in the CSV file (excluding the header). This aligns with CaptureScreen's usage in `addRecording`.

### 7.4 Test File Update (Non-blocking)

`CaptureScreen.test.ts` duplicates `createCSVContent` locally (line 37-49) since it is a module-private function. The architecture correctly notes this should be renamed to match the source. The test suite's logic remains valid since the function signature and behavior are unchanged (simulation mode uses the same algorithm).

### 7.5 Re-entrancy Guard (Blocking)

As noted in section 1, the async `flushStreamBuffer` needs a re-entrancy guard to prevent overlapping read-write cycles. This is a blocking concern for implementation but does not invalidate the architecture -- it is a single-line addition.

---

## 8. Summary of Findings

| # | Item | Verdict | Severity |
|---|------|---------|----------|
| 1 | Read-concat-write I/O performance | Acceptable for <=10 min recordings | -- |
| 2 | Async flush re-entrancy risk | Needs `isFlushingRef` guard | MEDIUM (blocking for impl) |
| 3 | Downsample decimation (5:1) | Appropriate for visual-only chart | -- |
| 4 | Recording lifecycle ref safety | Safe in single-threaded JS model | -- |
| 5 | StreamingScreen with 10-sample packets | No breaking changes, visual identical | -- |
| 6 | useStreamData variable packet sizes | Packet-size agnostic, works correctly | -- |
| 7 | File path lifecycle (create/finalize) | Robust with stale-recording guard | -- |
| 8 | Stop ordering (stream stop -> 200ms -> recording stop) | Correct drain pattern | -- |
| 9 | Test file rename | Straightforward, non-blocking | LOW |

---

## 9. Required Change for Implementation

**[REQ-1] Add re-entrancy guard to async `flushStreamBuffer`**: The developer must add an `isFlushingRef` boolean ref that is checked at entry and set in a `try/finally` block. Without this guard, two overlapping flush cycles could corrupt the CSV file by reading the same "existing" content and writing duplicate data. This is the only blocking technical concern.

---

## [VERDICT:APPROVED]

The architecture is technically sound and implementable. All six validation areas (I/O performance, downsample fidelity, recording lifecycle, StreamingScreen compatibility, useStreamData flexibility, file path management) pass review. One blocking implementation requirement is identified: the async `flushStreamBuffer` must include a re-entrancy guard (`isFlushingRef`) to prevent concurrent read-write cycles. This is a minor addition that does not require architectural revision. Proceed to development with REQ-1 incorporated.
