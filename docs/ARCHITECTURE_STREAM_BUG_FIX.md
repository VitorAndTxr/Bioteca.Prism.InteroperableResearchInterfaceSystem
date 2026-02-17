# Architecture: Stream Data Bug Fix

> Tech Lead root cause analysis and fix design for the empty CSV / static chart bug.

## Executive Summary

**H1 is CONFIRMED as the primary root cause.** The `isStreaming` flag in `BluetoothContext.tsx` is only set to `true` when a JSON ACK with `cd === StartStream` and `mt === ACK` is received (line 433-437). With firmware v3.1+ using binary streaming protocol, the device begins sending binary `0xAA` packets immediately without a JSON ACK, so `isStreaming` never becomes `true`. This means the 500ms batch flush interval (line 124-147) never starts, so data accumulates in `streamBufferRef` but never moves to `allStreamPacketsRef` or `streamData`.

**H2 is CONFIRMED as a secondary, compounding bug** but is mostly mitigated by the existing `getAllStreamPackets()` design. However, a timing edge case remains.

**H3 and H4 are REJECTED** -- the `BinaryFrameAccumulator` and `decodeMessage` implementations are correct.

## Root Cause Analysis

### H1: `isStreaming` never becomes `true` -- CONFIRMED (PRIMARY)

#### Evidence Chain

1. **`startStream()`** (BluetoothContext.tsx:538-556) sends the JSON command `{cd: StartStream, mt: EXECUTE}` to the device, then resets all buffers. It does **NOT** set `isStreaming = true`.

2. **`isStreaming` is only set to `true`** at line 435-436, inside the JSON message handler for `BluetoothProtocolFunction.StartStream`:
   ```typescript
   case BluetoothProtocolFunction.StartStream:
       console.log("Stream Start Acknowledged");
       if (messageBody.mt === BluetoothProtocolMethod.ACK) {
           setIsStreaming(true);  // <-- line 436: the ONLY place isStreaming becomes true
       }
       break;
   ```

3. **Binary firmware behavior**: The ESP32 firmware v3.1+ receives the StartStream command and immediately begins sending binary sEMG packets (first byte `0xAA`). It may or may not send a JSON ACK first. If the device sends binary data before/instead of a JSON ACK, the `decodeMessage` function routes the bytes at line 379-386 into the binary accumulator, never reaching the JSON switch-case at line 433.

4. **The batch flush interval** (line 124-147) is gated on `isStreaming`:
   ```typescript
   React.useEffect(() => {
       if (isStreaming) {
           batchIntervalRef.current = setInterval(() => {
               requestAnimationFrame(() => {
                   flushStreamBuffer();
               });
           }, 500);
       } else {
           // ...clear interval and flush remaining...
       }
   }, [isStreaming, flushStreamBuffer]);
   ```
   Since `isStreaming` stays `false`, the `if (isStreaming)` branch never executes. The `else` branch runs once on mount and calls `flushStreamBuffer()`, but at that point `streamBufferRef` is empty.

5. **Consequence**: Binary packets arrive via `decodeMessage` -> `binaryAccumulatorRef.current.feed()` -> `streamBufferRef.current.push()` (lines 381-384), but are never flushed to `allStreamPacketsRef` or `streamData`. The chart sees an empty `streamData`, and the CSV sees an empty `allStreamPacketsRef`.

#### Why Simulation Mode Works

Simulation mode bypasses this entirely. `CaptureScreen.startSimulation()` (CaptureScreen.tsx:115-144) writes directly to `simulationData` state via `setSimulationData()`, and the chart reads `simulationProcessedData` which is derived from `simulationData`, not from `streamData`. The batch flush interval and `isStreaming` flag are irrelevant for simulation.

### H2: Race Condition on Stop -- CONFIRMED (SECONDARY, PARTIALLY MITIGATED)

#### Evidence Chain

1. **`handleStopRecording()`** (CaptureScreen.tsx:186-262):
   ```typescript
   if (selectedDevice && isStreaming) {
       await stopStream();
   }
   // ... then immediately:
   const dataToSave = selectedDevice ? getAllStreamPackets() : simulationData;
   ```

2. **`stopStream()`** (BluetoothContext.tsx:558-570) sends the BT StopStream command. When the device sends a JSON ACK `{cd: StopStream, mt: ACK}`, the handler at line 442-444 sets `setIsStreaming(false)`.

3. **Problem A (with H1)**: The condition `selectedDevice && isStreaming` at CaptureScreen.tsx:190 evaluates to `false` because `isStreaming` was never `true`. So `stopStream()` is never even called. The device keeps streaming, and `getAllStreamPackets()` is called immediately.

4. **Problem B (without H1, i.e., if `isStreaming` were fixed)**: `await stopStream()` only awaits the BT write, not the ACK. The ACK arrives asynchronously, triggering `setIsStreaming(false)` which triggers the `useEffect` cleanup (line 133-139) that calls `flushStreamBuffer()`. But this effect runs asynchronously in the React microtask queue. Meanwhile, `getAllStreamPackets()` at CaptureScreen.tsx:204 calls `flushStreamBuffer()` synchronously (line 682). This is actually the correct mitigation -- the synchronous flush in `getAllStreamPackets()` picks up whatever is in `streamBufferRef` before the effect has a chance to run.

5. **Edge case remaining**: Between the `await stopStream()` BT write and the `getAllStreamPackets()` call, the BT `onDataReceived` callback may still fire with trailing packets. These arrive after `getAllStreamPackets()` has already snapshot the data. This is a minor data loss (last ~50-500ms of stream) but not the root cause of empty CSVs.

### H3: Binary Decoder Drops All Packets -- REJECTED

The `BinaryFrameAccumulator` (binaryDecoder.ts) implementation is correct:
- Magic byte `0xAA` and code `0x0D` validation is sound (lines 41-47)
- DataView construction with `buffer.byteOffset + offset` correctly handles subarray views (line 50)
- Little-endian reads match ESP32 firmware spec (lines 52-53, 62)
- Resync logic via `findNextMagic` handles split packets correctly (lines 107-114)
- The `feed()` method properly compacts remaining bytes (line 140)

If the device is sending well-formed 108-byte packets, this decoder will produce valid `StreamDataPacket` objects. The `streamBufferRef.current.push()` calls at BluetoothContext.tsx:383 DO execute successfully -- the data simply never gets flushed.

### H4: `decodeMessage` Drops Data -- REJECTED

The `decodeMessage` function (BluetoothContext.tsx:366-481) correctly:
- Sanitizes Base64 input (line 370)
- Decodes via `toByteArray()` (line 374)
- Routes on first byte (lines 379-477)
- Handles continuation fragments (lines 473-477)

The try/catch at line 478 would catch any `toByteArray` errors, but Base64 from `connectionType: 'binary'` is reliable.

## Data Flow Diagram (Buggy State)

```
ESP32 device (firmware v3.1+)
  |  Binary sEMG packets (0xAA 0x0D ...)
  v
onDataReceived(btEntry)  [btEntry.data = Base64]
  |
  v
decodeMessage(message)
  |  bytes[0] === 0xAA -> binary path
  v
BinaryFrameAccumulator.feed(bytes) -> StreamDataPacket[]
  |
  v
streamBufferRef.current.push(packet)    <-- DATA ACCUMULATES HERE
  |
  v
flushStreamBuffer() [500ms interval]    <-- NEVER STARTS (isStreaming === false)
  |                                          ^
  |  (gated by useEffect checking           |
  |   isStreaming === true)                  |
  |                                          |
  X --------- BLOCKED ----------------------+
  |
  v (never reached)
allStreamPacketsRef  ->  CSV export (always empty)
streamData (state)   ->  useStreamData -> chart (always empty)
```

## Fix Architecture

### Fix 1: Set `isStreaming = true` when first binary packet arrives (PRIMARY FIX)

**Location**: `BluetoothContext.tsx`, inside `decodeMessage()`, at the binary routing branch (line 379-386).

**Rationale**: The arrival of a binary sEMG packet is unambiguous proof that the device has started streaming. We should treat this as an implicit ACK, setting `isStreaming = true` to start the batch flush interval.

**Design**:
```typescript
// Line 379-386 in decodeMessage():
if (bytes[0] === BINARY_PACKET_MAGIC) {
    const packets = binaryAccumulatorRef.current.feed(bytes);
    for (const packet of packets) {
        streamBufferRef.current.push(packet);
    }
    // Implicit stream-start: first binary packet proves device is streaming
    if (!isStreaming) {
        setIsStreaming(true);
    }
    return;
}
```

**Impact**: Minimal -- adds a single boolean check per `decodeMessage` call. The `setIsStreaming(true)` call is a React state setter that batches and only triggers re-render once (when transitioning from `false` to `true`). Subsequent calls with `isStreaming` already `true` are no-ops at the setter level, but we gate with `!isStreaming` to avoid unnecessary setter calls.

**Risk**: Low. This does not affect the JSON ACK path (which also sets `isStreaming = true` at line 436). Both paths converge on the same state. If the device sends a JSON ACK before binary data, the JSON handler sets the flag first and the binary branch's `!isStreaming` check is a no-op.

**Closure concern**: `decodeMessage` is a plain function (not wrapped in `useCallback`), so it reads `isStreaming` from the component scope. However, `isStreaming` is React state, and `decodeMessage` is called from the `onDataReceived` BT callback which was registered in `connectBluetooth()` as a closure. This closure captures the `decodeMessage` function reference, but `decodeMessage` itself is re-created on each render. **Wait** -- looking more carefully at line 339:

```typescript
const onRecieveListener = connectedDevice.onDataReceived((btEntry) => {
    decodeMessage(btEntry.data);
});
```

This closure captures the `decodeMessage` function at connect-time. Since `decodeMessage` is declared as a plain `function` inside the component body, subsequent renders create new `decodeMessage` instances, but the BT listener still holds the original one. This means the `isStreaming` check inside `decodeMessage` will use the **stale** value from the initial render (which is `false`).

**This is actually beneficial for Fix 1**: Since `isStreaming` is always `false` in the stale closure, `setIsStreaming(true)` will be called on every `decodeMessage` invocation with binary data. React's `useState` setter is stable and always refers to the latest state, so calling `setIsStreaming(true)` repeatedly is safe -- React deduplicates `true -> true` transitions and only triggers re-render on the first `false -> true`.

However, for correctness and to avoid relying on stale closures, we should use a ref instead:

**Revised design (using ref)**:
```typescript
// Add a ref alongside the state:
const isStreamingRef = React.useRef(false);

// Keep it in sync (in the isStreaming effect or via a wrapper):
// When setIsStreaming(true) is called, also set isStreamingRef.current = true
// When setIsStreaming(false) is called, also set isStreamingRef.current = false

// In decodeMessage():
if (bytes[0] === BINARY_PACKET_MAGIC) {
    const packets = binaryAccumulatorRef.current.feed(bytes);
    for (const packet of packets) {
        streamBufferRef.current.push(packet);
    }
    if (!isStreamingRef.current) {
        isStreamingRef.current = true;
        setIsStreaming(true);
    }
    return;
}
```

This avoids repeated `setIsStreaming(true)` calls by checking the ref (which is always current, not subject to closure staleness).

### Fix 2: Guard `stopStream` call in CaptureScreen (SECONDARY FIX)

**Location**: `CaptureScreen.tsx`, `handleStopRecording()` (line 186-262).

**Problem**: The condition `selectedDevice && isStreaming` at line 190 skips `stopStream()` when `isStreaming` is `false`. With Fix 1 applied, this should work correctly. However, as a defensive measure, we should always send the stop command when a device is connected, regardless of `isStreaming` state:

**Design**:
```typescript
// Line 190 in handleStopRecording():
if (selectedDevice) {
    await stopStream();
}
```

**Rationale**: Sending StopStream to a device that is not streaming is harmless (the device ignores it or sends a NACK). But failing to send StopStream to a device that IS streaming (because the app thinks it isn't) leaves the device streaming indefinitely, wasting battery and Bluetooth bandwidth.

### Fix 3: Add trailing-packet safety window (OPTIONAL, LOW PRIORITY)

**Location**: `CaptureScreen.tsx`, `handleStopRecording()`.

**Problem**: After `await stopStream()`, trailing BT packets may still arrive in the next 50-500ms. `getAllStreamPackets()` calls `flushStreamBuffer()` synchronously, which picks up anything in `streamBufferRef` at that instant, but misses later arrivals.

**Design**: Add a small delay (100-200ms) between `stopStream()` and `getAllStreamPackets()` to allow trailing packets to arrive:
```typescript
if (selectedDevice) {
    await stopStream();
    // Allow trailing BT packets to arrive and be decoded
    await new Promise(resolve => setTimeout(resolve, 200));
}
const dataToSave = selectedDevice ? getAllStreamPackets() : simulationData;
```

**Impact**: Adds 200ms to the save flow. At 215 Hz with 50 samples per packet, this captures ~4 additional packets (~200 samples). This is a minor improvement and can be deferred.

## Fix Summary

| # | Fix | File | Lines | Priority | Risk | Effort |
|---|-----|------|-------|----------|------|--------|
| 1 | Set `isStreaming = true` on first binary packet via ref | BluetoothContext.tsx | 61, 379-386 | **MUST** | Low | S |
| 2 | Remove `isStreaming` guard from `stopStream` call | CaptureScreen.tsx | 190 | **MUST** | Low | S |
| 3 | Add trailing-packet delay before `getAllStreamPackets` | CaptureScreen.tsx | 204 | SHOULD | Low | S |

### Sync the ref with all existing `setIsStreaming` call sites

The `isStreamingRef` must stay in sync with the `isStreaming` state. There are exactly 3 call sites that mutate `isStreaming`:

1. **Line 430**: `setIsStreaming(false)` -- EmergencyStop handler
2. **Line 436**: `setIsStreaming(true)` -- StartStream JSON ACK handler
3. **Line 443**: `setIsStreaming(false)` -- StopStream JSON ACK handler

Each must be paired with `isStreamingRef.current = <value>`.

Additionally, `startStream()` at line 545 resets buffers but does not set `isStreaming`. This is correct -- `isStreaming` should only become `true` when data actually arrives.

## Files Changed

1. **`IRIS/apps/mobile/src/context/BluetoothContext.tsx`**
   - Add `isStreamingRef` (useRef<boolean>) alongside `isStreaming` state
   - Update `decodeMessage()` binary branch to set `isStreamingRef.current = true` + `setIsStreaming(true)` on first binary packet
   - Update all 3 existing `setIsStreaming()` calls to also update `isStreamingRef.current`

2. **`IRIS/apps/mobile/src/screens/CaptureScreen.tsx`**
   - Remove `isStreaming` from the `stopStream` guard condition (line 190)
   - Optionally add trailing-packet delay before `getAllStreamPackets()`

## Regression Risks

| Risk | Mitigation |
|------|-----------|
| Simulation mode broken | Simulation does not touch `isStreaming`, `streamBufferRef`, or `allStreamPacketsRef`. No impact. |
| JSON ACK still works | The JSON handler at line 436 still sets `isStreaming = true`. If the device sends a JSON ACK before binary data, Fix 1's ref check is a no-op. Both paths are idempotent. |
| Multiple `setIsStreaming(true)` calls | React deduplicates state updates with the same value. The ref gate (`!isStreamingRef.current`) prevents even calling the setter after the first time. |
| `stopStream()` sent when not streaming | Device firmware ignores StopStream when not streaming (no harmful side-effect). |
| Trailing-packet delay slows UX | 200ms is imperceptible to users. Can be removed if unnecessary. |

## Verification Plan

1. **Connect to real ESP32 device with firmware v3.1+**
2. **Start recording**: Verify `isStreaming` transitions to `true` after first binary packet arrives
3. **During recording**: Verify chart updates in real-time (not static)
4. **Stop recording**: Verify CSV file contains data (non-empty, correct sample count)
5. **Simulation mode**: Verify chart and save still work without a device connected
6. **JSON firmware**: If testing with older firmware that sends JSON ACKs, verify both paths still work
