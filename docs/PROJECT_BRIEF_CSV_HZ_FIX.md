# Project Brief: Incremental 215 Hz CSV Writing with Chart Downsample

**Date**: 2026-02-17
**Author**: PM (Product Manager)
**Status**: DRAFT

---

## 1. Business Objective

The IRIS mobile app captures sEMG data from the ESP32 device at 215 Hz, delivered in binary packets of 50 samples each (~4.3 packets per second). Currently, CSV export is performed as a bulk operation when the user presses "Stop Recording": all accumulated packets from `allStreamPacketsRef` are serialized into a CSV string in memory and then written to disk in one shot. This approach has two problems.

First, the CSV data is only written at 50 Hz because `allStreamPacketsRef` stores the same `StreamDataPacket` objects that the chart pipeline consumes, and the batch-flush mechanism (`flushStreamBuffer`, 500 ms interval) feeds both consumers identically. The actual sample timestamps within each packet are correct (interpolated at 215 Hz intervals via `createCSVContent`), but the intermediate accumulation pattern means any packet loss during flush gaps or stop-race conditions results in data gaps. More critically, the entire recording is held in RAM until the stop event, creating memory pressure for long recordings.

Second, the chart rendering pipeline receives the same 50-sample packets at the full 215 Hz rate, even though `useStreamData` ultimately downsamples to 40 Hz for display. Passing all 50 samples per packet through React state and the batch buffer is unnecessary work for visualization.

This initiative restructures the recording flow so that CSV data is written incrementally to disk at the full 215 Hz rate as each Bluetooth packet arrives, while the chart pipeline receives pre-downsampled data (50 to 10 samples per packet) to reduce memory and processing overhead.

---

## 2. Scope

### 2.1 In Scope

**Incremental CSV Writing on Packet Arrival** (`BluetoothContext.tsx`):
- When recording is active, each decoded binary packet (50 samples at 215 Hz) is immediately appended to an open CSV file on disk via `expo-file-system` `appendAsStringAsync`
- The CSV file is opened (with header row written) when recording starts and closed when recording stops
- A `recordingFilePathRef` (React ref) holds the active CSV file path during recording; `null` when not recording
- A `isRecordingRef` (React ref) tracks whether recording is active, readable from the stale BT listener closure
- The CSV format matches the existing `createCSVContent` output: `timestamp,value` header, one row per sample, timestamps interpolated at `1000/215` ms intervals within each packet

**Per-Packet Downsample for Chart** (`BluetoothContext.tsx`):
- After appending the full 50-sample packet to CSV, create a downsampled version with 10 samples (every 5th sample) for the chart pipeline
- Push the downsampled `StreamDataPacket` (10 values instead of 50) into `streamBufferRef`
- This reduces the data volume flowing through React state by 80% while maintaining sufficient chart resolution (10 samples * 4.3 packets/s = ~43 samples/s, close to the 40 Hz chart display rate)

**CaptureScreen Recording Lifecycle** (`CaptureScreen.tsx`):
- On "start recording" (mount/init): call a new `startRecording(sessionId)` function that creates the CSV file with header and sets the recording refs
- On "stop recording": call a new `stopRecording()` function that returns the file path of the completed CSV
- Remove the `createCSVContent()` bulk serialization function and the `getAllStreamPackets()` call from `handleStopRecording`
- The `allStreamPacketsRef` accumulation in `flushStreamBuffer` becomes unnecessary for CSV (data goes to disk incrementally); however, `allStreamPacketsRef` may be retained if other consumers need it, or removed if CSV was its sole purpose

**`useStreamData` Hook** (`useStreamData.ts`):
- No changes required. The hook already accepts `StreamDataPacket[]` and performs its own 4-second windowing + 40 Hz downsample. It will now receive pre-downsampled packets (10 samples each instead of 50), which reduces its flatten step workload but otherwise behaves identically.

**New BluetoothContext API Surface**:
- `startRecording(sessionId: string): Promise<string>` — creates CSV file, returns file path, sets recording refs
- `stopRecording(): Promise<{ filePath: string; sampleCount: number }>` — closes CSV file, returns path and total sample count
- `isRecording: boolean` — exposed state for UI (recording indicator)

### 2.2 Out of Scope

- Changes to the ESP32 firmware or binary packet protocol
- Backend (`InteroperableResearchNode`) changes
- Desktop app changes
- Simulation mode rework (simulation data path remains unchanged; it does not go through the BT decode pipeline)
- Changes to the ZIP export flow in `csvExport.ts` (ZIP reads completed CSV files from disk, which will still work)
- `useStreamData` hook modifications (it adapts automatically to smaller packets)
- Chart rendering or `SEMGChart` component changes
- `SyncService` upload path changes (it reads CSV files from disk by path, which is unchanged)
- Performance optimization of the batch-flush interval timing

---

## 3. Success Criteria

1. **Full 215 Hz in CSV**: A 10-second recording produces a CSV file with approximately 2,150 data rows (215 Hz * 10 s), each with an interpolated millisecond timestamp and sEMG value. No downsampling occurs in the CSV path.
2. **Incremental disk writes**: CSV data is written to disk on each BT packet arrival (~4.3 times per second), not accumulated in memory until stop. A crash or forced kill during recording still yields a partial but valid CSV file with all data received up to that point.
3. **Chart receives downsampled data**: Each 50-sample BT packet is reduced to 10 samples before entering `streamBufferRef`. The chart continues to display a smooth 4-second sliding window at ~40 Hz effective resolution.
4. **No regression in simulation mode**: Simulation mode (no device connected) continues to work identically since it bypasses the BT decode pipeline entirely.
5. **Recording entity integrity**: The `NewRecordingData` entity created on stop contains the correct `filePath`, `sampleCount` (total 215 Hz samples written), `sampleRate` (215), and `durationSeconds`.
6. **Memory reduction**: `allStreamPacketsRef` is no longer the primary CSV data source. For a 60-second recording at 215 Hz, approximately 12,900 sample values are written incrementally to disk instead of held in a growing array.

---

## 4. Constraints

1. **`expo-file-system` append performance**: `FileSystem.writeAsStringAsync` with `{ append: true }` (via `expo-file-system`) is the only file append API available in Expo managed workflow. At ~4.3 calls per second (one per BT packet), this must complete within the ~232 ms inter-packet interval. Each append writes ~500-600 bytes (10 lines of `timestamp,value`). This is well within typical filesystem throughput but should be validated on low-end Android devices.
2. **Stale closure in BT listener**: The `onDataReceived` callback is registered once at connection time and captures refs by closure. The recording file path and recording-active flag must be stored in React refs (`useRef`), not state, to be readable from this stale closure.
3. **TypeScript strict mode**: All new code must satisfy `strict: true`. No `any` types.
4. **Existing batch-flush pipeline**: The downsampled packets still flow through the existing `streamBufferRef` / `flushStreamBuffer()` mechanism. No changes to the batch interval (500 ms) or UI update strategy.
5. **CSV format compatibility**: The incremental CSV must produce the exact same format as the current `createCSVContent()` function: header row `timestamp,value`, one sample per row, timestamps as milliseconds with two decimal places.
6. **File handle lifecycle**: The CSV file must be properly closed (no further appends) before the file path is used to create the recording entity or read by `SyncService`. `stopRecording()` must be awaited before proceeding.

---

## 5. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | `FileSystem.writeAsStringAsync` with append flag may have measurable latency on low-end devices, causing BT packet processing delays | Low | Medium | Benchmark on target device; if latency exceeds 50 ms, batch 2-3 packets before appending (still incremental, just slightly buffered) |
| R2 | File left open (recording refs set) after app crash or unexpected navigation, leading to stale file on next recording | Medium | Low | `startRecording` checks for and closes any existing recording file before creating a new one; add cleanup in BluetoothContext unmount |
| R3 | Downsample ratio (50 to 10, every 5th sample) may alias high-frequency components in the signal | Low | Low | 10 samples at 4.3 packets/s yields ~43 Hz, which exceeds the chart display rate of 40 Hz. The chart is for visual feedback only; scientific analysis uses the full 215 Hz CSV |
| R4 | Race between `stopRecording` file close and `addRecording` entity creation if stop is triggered rapidly | Low | Medium | `stopRecording` is async and awaited; `addRecording` only called after it resolves |
| R5 | Concurrent `appendAsStringAsync` calls if two BT packets arrive before the first append completes | Medium | Medium | `appendAsStringAsync` calls are serialized by the single JS thread; `expo-file-system` queues operations internally. If issues arise, add a write queue with sequential drain |

---

## 6. Affected Components

| Component | File | Change |
|-----------|------|--------|
| BluetoothContext | `apps/mobile/src/context/BluetoothContext.tsx` | Add `recordingFilePathRef`, `isRecordingRef`, `sampleCountRef`. In binary packet decode path: append full 50 samples to CSV file, then downsample to 10 and push to `streamBufferRef`. Add `startRecording()`, `stopRecording()`, `isRecording` to context API. |
| CaptureScreen | `apps/mobile/src/screens/CaptureScreen.tsx` | Call `startRecording(sessionId)` on mount, `stopRecording()` on stop. Remove `createCSVContent()` function and `getAllStreamPackets()` call. Use returned `filePath` and `sampleCount` for recording entity. |
| BluetoothContext types | `apps/mobile/src/context/BluetoothContext.tsx` (interface) | Add `startRecording`, `stopRecording`, `isRecording` to `BluetoothContextData` interface. |

---

## 7. Data Flow (Before vs After)

### Before (Current)

```
BT Packet (50 samples)
  |
  v
streamBufferRef.push(packet)          <-- full 50 samples
  |
  v
flushStreamBuffer() [500ms interval]
  |
  +---> allStreamPacketsRef.push()    <-- unbounded RAM accumulation
  |
  +---> setStreamData()              <-- React state, capped 500 packets
          |
          v
        useStreamData()              <-- flatten, window, downsample to 40Hz
          |
          v
        SEMGChart

On Stop Recording:
  getAllStreamPackets()               <-- read entire allStreamPacketsRef
  createCSVContent()                 <-- bulk serialize in memory
  FileSystem.writeAsStringAsync()    <-- single write to disk
```

### After (Proposed)

```
BT Packet (50 samples)
  |
  +---> CSV append (50 samples)      <-- immediate disk write, full 215 Hz
  |
  +---> downsample 50 -> 10 samples
        |
        v
      streamBufferRef.push(packet)   <-- only 10 samples per packet
        |
        v
      flushStreamBuffer() [500ms]
        |
        +---> setStreamData()        <-- React state, smaller packets
                |
                v
              useStreamData()        <-- flatten, window, downsample
                |
                v
              SEMGChart

On Stop Recording:
  stopRecording()                    <-- close file, return path + count
  addRecording({ filePath, ... })    <-- entity uses existing file
```

---

## 8. Implementation Notes

**CSV Append Format**: Each BT packet produces 50 CSV lines. The append string for one packet looks like:

```
1234.56,142
1239.21,138
1243.86,145
... (50 lines total)
```

Timestamps are interpolated within the packet: `packet.timestamp + (i * (1000 / 215))` for `i` in `[0, 49]`, formatted to two decimal places. This matches the existing `createCSVContent` logic.

**Downsample Strategy**: Simple decimation — take every 5th sample from the 50-sample array (`indices 0, 5, 10, 15, 20, 25, 30, 35, 40, 45`). The downsampled packet retains the original packet timestamp and contains 10 values. The timestamp interpolation within the downsampled packet adjusts to `packet.timestamp + (selectedIndex * (1000 / 215))` — but since `useStreamData` re-interpolates timestamps from the packet anyway, the exact sub-packet timestamps are informational.

**Recording Refs**: Three refs manage the recording lifecycle inside BluetoothContext:
- `recordingFilePathRef: React.MutableRefObject<string | null>` — path to the open CSV file, or `null`
- `isRecordingRef: React.MutableRefObject<boolean>` — whether recording is active (readable from stale closure)
- `sampleCountRef: React.MutableRefObject<number>` — running count of samples written to CSV

**`allStreamPacketsRef` Disposition**: This ref was created specifically for CSV export (comment on line 77: "Unbounded capture buffer -- accumulates ALL packets during streaming for CSV export"). With incremental CSV writing, it is no longer needed for that purpose. It can be removed along with `getAllStreamPackets()`, or retained if a future consumer needs in-memory access to all packets.

---

## 9. Dependencies

- **`expo-file-system`**: Already in use. The `writeAsStringAsync` function supports an `append` option (via `FileSystem.writeAsStringAsync(path, content, { encoding: UTF8 })` — note: Expo's `writeAsStringAsync` does not have a native `append` flag; appending requires reading current content or using `StorageAccessFramework`. **Alternative**: Use `FileSystem.writeAsStringAsync` for the header, then use `FileSystem.writeAsStringAsync` with the full accumulated content per flush cycle. **Clarification needed from TL**: Verify the best append strategy for `expo-file-system`. If true append is not supported, a small write-queue buffer (e.g., accumulate 10 packets ~2.3 seconds, then rewrite) may be needed.
- **`@iris/domain`**: No changes needed. `StreamDataPacket`, `DEVICE_SAMPLE_RATE_HZ`, and `BINARY_PACKET_SAMPLES_PER_PACKET` are already exported.
- **Binary decoder**: No changes needed. `BinaryFrameAccumulator` produces `StreamDataPacket` objects as before; the new CSV append logic intercepts them before they enter `streamBufferRef`.

---

## 10. Client Decisions Required

1. **`expo-file-system` append strategy**: The exact mechanism for incremental file append must be confirmed by the Tech Lead. If `expo-file-system` does not support true append, a micro-buffer approach (accumulate N packets, then write a chunk) is acceptable as long as each chunk is written within a few seconds of reception.
2. **`allStreamPacketsRef` removal**: Should this unbounded in-memory buffer be removed entirely (saves RAM), or retained as a secondary backup? **Recommendation**: Remove it. The CSV file on disk is the authoritative data source. The `exportStreamData()` function on BluetoothContext that uses it can be deprecated or redirected to read from the CSV file.
3. **Downsample ratio**: 50 to 10 (5:1) is proposed. An alternative is 50 to 5 (10:1) for even less chart data. **Recommendation**: 5:1 (10 samples) provides a comfortable margin above the 40 Hz chart display rate.

---

## 11. Relationship to Prior Work

This initiative builds directly on two prior phases:

- **Phase 14 (Stream Data Fixes)**: Established the 215 Hz sample rate constant, the `createCSVContent` function with interpolated timestamps, and the 4s/40Hz/1Hz chart configuration. This brief replaces the bulk CSV pattern introduced in Phase 14 with an incremental approach.
- **Phase 15 (BT Binary Decoding)**: Implemented the `BinaryFrameAccumulator` and first-byte routing in `decodeMessage()`. This brief adds a CSV append step between the binary decoder output and the `streamBufferRef` push, and introduces downsample logic at the same injection point.

The **Stream Data Bug Investigation** brief (`PROJECT_BRIEF_BUG_STREAM_CSV.md`) identified the risk of `isStreaming` gating preventing data flow. The `isRecordingRef` introduced here is independent of `isStreaming` — it is set explicitly by `startRecording()` and cleared by `stopRecording()`, avoiding the ACK-dependency issue identified in that investigation.
