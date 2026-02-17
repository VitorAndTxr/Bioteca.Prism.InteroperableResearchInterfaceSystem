# Project Brief: Stream Data Bug Investigation

> Bug investigation brief — Product Manager leads, all roles assist.

## Problem Statement

Two related symptoms have been observed in the IRIS mobile app during real device recording sessions:

1. **Empty CSV uploads**: CSV files uploaded to blob storage via SyncService contain no sEMG stream data (empty or only a header line), despite a recording session having been completed.
2. **Static chart during recording**: The real-time waveform chart on CaptureScreen remains flat/static during device recording, suggesting stream data is not flowing from Bluetooth to the UI rendering pipeline.

Both symptoms point to a single root cause somewhere in the data pipeline between the ESP32 Bluetooth SPP transport and the consumers (chart + CSV export).

## Business Objectives

| # | Objective | Success Criteria | Priority |
|---|-----------|-----------------|----------|
| 1 | Identify the root cause of empty stream data in CSV exports | Root cause documented with specific file, line, and code path identified | Must |
| 2 | Identify the root cause of static chart during real device recording | Root cause documented; confirm whether it shares the same root cause as #1 | Must |
| 3 | Produce a fix plan with minimal code changes | Fix plan with specific code changes documented; no unnecessary refactoring | Must |
| 4 | Verify the fix does not regress simulation mode | Simulation mode chart + CSV export remain functional after fix | Should |

## Scope

### In Scope

- Root cause analysis of the entire stream data pipeline: Bluetooth SPP -> Base64 decode -> first-byte routing -> BinaryFrameAccumulator -> streamBufferRef -> batch flush -> allStreamPacketsRef / streamData state -> useStreamData hook -> SEMGChart / CSV export
- Analysis of CaptureScreen's interaction with BluetoothContext (startStream, getAllStreamPackets, streamData)
- Analysis of SyncService's recording upload path (local CSV read -> base64 -> upload)
- Identifying whether the problem is in data production (BT decode), accumulation (buffer/flush), or consumption (chart hook / CSV creation)

### Out of Scope

- Changes to the ESP32 firmware or binary packet protocol
- Changes to the backend Upload controller or blob storage layer
- New features or UX improvements unrelated to the bug
- Performance optimization beyond what is needed to fix the bug
- Desktop app (not affected)

## Data Flow Analysis

The complete stream data pipeline has these stages:

```
ESP32 device
  |  (Bluetooth SPP, binary frames)
  v
react-native-bluetooth-classic onDataReceived(btEntry)
  |  (btEntry.data = Base64-encoded string)
  v
decodeMessage(message: string)
  |  1. Sanitize Base64 (strip whitespace/null)
  |  2. toByteArray() -> Uint8Array
  |  3. Route on first byte:
  |     - 0xAA -> BinaryFrameAccumulator.feed() -> packets -> streamBufferRef
  |     - 0x7B -> JSON parse -> switch on .cd
  |     - else -> BinaryFrameAccumulator.feed() (continuation fragment)
  v
streamBufferRef (React.useRef<StreamDataPacket[]>)
  |  (unbounded intermediate buffer, filled by decodeMessage)
  v
flushStreamBuffer() [every 500ms via setInterval when isStreaming=true]
  |  1. Copy packets from streamBufferRef, clear streamBufferRef
  |  2. Push copies to allStreamPacketsRef (unbounded CSV buffer)
  |  3. setStreamData(prev => [...prev, ...packets].slice(-500))
  v
allStreamPacketsRef ─────────────────> getAllStreamPackets() -> CaptureScreen CSV
  |                                     (called on Stop Recording)
  v
streamData (React state, capped at 500)
  |
  v
useStreamData(streamData, sampleRate)
  |  1. Flatten packets into samples
  |  2. Sliding 4s window
  |  3. Downsample to 40 Hz
  |  4. Update output at 1 Hz cadence
  v
SEMGChart (rendered on CaptureScreen)
```

## Hypotheses (Ranked by Likelihood)

### H1: `isStreaming` never becomes `true` during real device recording (HIGH)

**Evidence**: The batch flush interval (line 124-147 of BluetoothContext.tsx) only starts when `isStreaming` is `true`. The `startStream()` function (line 538) sends the BT command but sets `isStreaming` to `false` initially. The flag only becomes `true` when a JSON ACK message with `cd === BluetoothProtocolFunction.StartStream` and `mt === BluetoothProtocolMethod.ACK` is received (line 433-437).

**Problem**: With firmware v3.1+ using binary streaming protocol, the device may send the StartStream ACK as a binary packet rather than a JSON message, or the ACK may never arrive because the device starts streaming immediately. If the ACK is never parsed as JSON, `isStreaming` stays `false`, meaning:
- The 500ms flush interval never starts (no data flows to `streamData` or `allStreamPacketsRef`)
- `streamBufferRef` keeps accumulating packets but they are never flushed
- On stop, `flushStreamBuffer()` is called once (line 139) but by then the effect cleanup may have already run
- Chart stays empty, CSV stays empty

**Verification**: Add `console.log` to the `isStreaming` effect to confirm whether it transitions to `true`.

### H2: Race condition between `stopStream` and `getAllStreamPackets` (MEDIUM)

**Evidence**: In `handleStopRecording` (CaptureScreen.tsx line 186), `stopStream()` is awaited first, then `getAllStreamPackets()` is called. The `stopStream()` function sends the BT StopStream command. When the device ACKs with JSON `{cd: StopStream, mt: ACK}`, `isStreaming` is set to `false` (line 443-445). This triggers the effect cleanup (line 133-138) which clears `batchIntervalRef` and calls `flushStreamBuffer()`. But this flush happens asynchronously in a React effect, not synchronously before `getAllStreamPackets()` is called.

**Problem**: `getAllStreamPackets()` does call `flushStreamBuffer()` (line 682), but if `isStreaming` was never `true` (see H1), there may be packets in `streamBufferRef` that never made it to `allStreamPacketsRef`. The `flushStreamBuffer` at line 682 would pick them up — but only if they are still in `streamBufferRef`.

### H3: Binary packet decoder returns empty arrays (LOW)

**Evidence**: The `BinaryFrameAccumulator` has validation checks. If the magic byte, code, or sample count don't match, packets are skipped. If `toByteArray()` produces unexpected output (e.g., byte order issues), all packets could be silently dropped.

**Verification**: Check `binaryAccumulatorRef.current.getStats()` to see received vs dropped counts.

### H4: `decodeMessage` called with empty/corrupt data (LOW)

**Evidence**: The sanitization step strips whitespace and null bytes. If the Base64 string is somehow empty after sanitization, the function returns early (line 371). The `toByteArray` might throw on malformed Base64, caught by the try/catch which only logs a `console.warn`.

### H5: CSV file is correct but SyncService upload corrupts it (LOW)

**Evidence**: SyncService reads the file as Base64 (`FileSystem.readAsStringAsync` with `EncodingType.Base64`) and uploads it. If the file is genuinely empty (0 bytes), the Base64 would be an empty string, and the upload would succeed but the backend would receive empty content.

**Conclusion**: This is a downstream effect of H1/H2, not an independent root cause.

## Constraints

| Type | Constraint | Impact |
|------|-----------|--------|
| Technical | Cannot modify ESP32 firmware — investigation is mobile-side only | Limits fix options to app code only |
| Technical | Must support both binary (v3.1+) and legacy JSON streaming | Fix must not break either protocol path |
| Technical | React Native threading model — BT callbacks run on JS thread | Must consider async/effect timing carefully |
| Data | No server-side logs of received CSV content available for analysis | Must reproduce locally with device or simulate binary BT traffic |

## Stakeholders

| Stakeholder | Role | Concerns |
|------------|------|----------|
| Researcher / End User | Uses CaptureScreen for sEMG recording | Expects real-time chart feedback and valid CSV data |
| Backend team | Receives uploaded recordings | Expects non-empty CSV files in blob storage |
| Device team | Produces sEMG stream data | Needs to know if protocol changes caused regression |

## Business Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | Researchers lose confidence in data quality if recordings are empty | High | High | Prioritize investigation immediately |
| 2 | Corrupted recordings may have been synced and stored in backend | Medium | Medium | After fix, audit synced recordings for empty content |
| 3 | Fix introduces regression in simulation mode | Low | Medium | Test simulation path explicitly after fix |

## Technical Risk Assessment

> To be completed by Tech Lead (`/tl plan`).

| # | Risk | Likelihood | Impact | Mitigation | Effort |
|---|------|-----------|--------|-----------|--------|
| 1 | H1 root cause: `isStreaming` gating prevents data flow | High | High | Add fallback flush or decouple batch interval from `isStreaming` | S |
| 2 | H2 race condition: flush timing on stop | Medium | Medium | Ensure synchronous flush before reading `allStreamPacketsRef` | S |
| 3 | Multiple interacting bugs (H1 + H2 combined) | Medium | High | Fix both independently and test combined scenario | M |
| 4 | Binary decoder silently dropping all packets | Low | High | Add debug counters / logging to BinaryFrameAccumulator | S |

## Specialist Notes

> To be completed by Dev Specialist (`/dev plan`) and QA Specialist (`/qa plan`).

### Developer Specialist

- The `isStreaming` flag is only set by JSON ACK parsing (BluetoothContext.tsx:433-437). Binary-only devices that skip JSON ACKs will never trigger the batch flush interval. This is the most likely root cause.
- `getAllStreamPackets()` calls `flushStreamBuffer()` before returning, which is good — but if `isStreaming` was never `true`, the batch interval never ran, meaning only the final flush at stop-time would move data from `streamBufferRef` to `allStreamPacketsRef`.
- The `createCSVContent` function in CaptureScreen.tsx is correct — it iterates all packets and writes timestamp+value rows. Empty CSV means empty input array.

### QA Specialist

- Reproduction requires a real ESP32 device with firmware v3.1+ (binary protocol) or a BT traffic simulator
- Key test: connect to device, start recording, verify `isStreaming` state, verify `streamBufferRef` population, verify chart updates, stop recording, verify CSV content
- Simulation mode is likely unaffected (it writes directly to `simulationData` state and CaptureScreen reads it directly, bypassing the BT pipeline entirely)
- Add diagnostic logging: `BinaryFrameAccumulator.getStats()` on stop, `allStreamPacketsRef.current.length` before CSV write, `streamBufferRef.current.length` at flush time

## Investigation Steps

1. **Confirm H1**: Add logging to verify whether `isStreaming` transitions to `true` during a real device recording
2. **Confirm data arrives**: Log `streamBufferRef.current.length` inside `decodeMessage` after pushing to buffer
3. **Confirm flush runs**: Log inside `flushStreamBuffer` to verify it executes and transfers data
4. **Confirm CSV content**: Log `dataToSave.length` and first few entries before `createCSVContent` call
5. **Fix**: Based on findings, implement the minimal code change (likely: decouple batch flush from `isStreaming`, or trigger `isStreaming = true` when first binary packet arrives)
