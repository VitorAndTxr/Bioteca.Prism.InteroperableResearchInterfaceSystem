# Code Review: Stream Data Bug Fix

**Date**: 2026-02-17
**Reviewer**: Tech Lead
**Related Documents**:
- `docs/ARCHITECTURE_STREAM_BUG_FIX.md` — Approved fix specification
- `docs/VALIDATION_STREAM_BUG.md` — PM + TL validation gate

---

## Files Reviewed

1. `IRIS/apps/mobile/src/context/BluetoothContext.tsx` — Fix 1
2. `IRIS/apps/mobile/src/screens/CaptureScreen.tsx` — Fix 2 + Fix 3

---

## Checklist Results

### Fix 1: `isStreamingRef` added as `useRef(false)`, synced at ALL `setIsStreaming` call sites, implicit start on first binary packet

**Status: PASS**

`isStreamingRef` is declared at line 63:
```typescript
const isStreamingRef = React.useRef(false);
```

The comment is accurate and descriptive: "Ref mirror of isStreaming — readable inside stale BT listener closures."

**Binary branch implicit start** (lines 389–392):
```typescript
if (!isStreamingRef.current) {
    isStreamingRef.current = true;
    setIsStreaming(true);
}
```
Correctly placed immediately after pushing to `streamBufferRef`, before the `return`. The ref-then-state pattern is correct: ref is written first so subsequent stale-closure calls see the updated value before the React state settles.

**All three `setIsStreaming` call sites have matching ref updates:**

| Site | Line | Verified |
|------|------|---------|
| EmergencyStop | 438–439 | `isStreamingRef.current = false` then `setIsStreaming(false)` — PASS |
| StartStream ACK | 445–446 | `isStreamingRef.current = true` then `setIsStreaming(true)` — PASS |
| StopStream ACK | 453–454 | `isStreamingRef.current = false` then `setIsStreaming(false)` — PASS |

No fourth call site exists — confirmed by search of the file.

**TL recommendation: `isStreamingRef.current = false` reset in `startStream()`**

**Status: PASS — recommendation was implemented.**

`startStream()` (lines 556–564):
```typescript
// Reset ref before sending — guards against rapid start/stop cycles
// where the previous streaming session's ref could prevent detection of
// the new session's first binary packet.
isStreamingRef.current = false;
setStreamData([]);
setLastStreamTimestamp(0);
streamBufferRef.current = [];
allStreamPacketsRef.current = [];
binaryAccumulatorRef.current.reset();
```
The ref reset is the first statement before the BT write. The comment correctly documents the reason (rapid start/stop cycle edge case). This directly implements the TL recommendation from `VALIDATION_STREAM_BUG.md` section 6.

---

### Fix 2: `isStreaming` removed from stop guard

**Status: PASS**

`handleStopRecording` (lines 191–192):
```typescript
if (selectedDevice) {
    await stopStream();
```
The old condition `selectedDevice && isStreaming` has been replaced with `selectedDevice` alone. The comment at line 189–190 explains the rationale:
```
// Stop streaming — send StopStream whenever a device is connected, regardless
// of the isStreaming flag (which may be false if no JSON ACK was received yet).
```

**Dependency array** (lines 255–265):
```typescript
}, [
    selectedDevice,
    stopStream,
    getAllStreamPackets,
    simulationData,
    sessionId,
    elapsedSeconds,
    streamConfig.type,
    addRecording,
    navigation,
]);
```
`isStreaming` has been removed from the deps array, which is correct — it is no longer read inside `handleStopRecording`. No stale closure concern since `selectedDevice` (which gates the call) is correctly listed.

---

### Fix 3: 200ms delay between `stopStream()` and `getAllStreamPackets()`

**Status: PASS**

Lines 193–195:
```typescript
// Allow trailing BT packets (~50-500ms of in-flight data) to arrive and be decoded
// before snapshotting the buffer.
await new Promise(resolve => setTimeout(resolve, 200));
```
The delay is correctly placed after `await stopStream()` and before `getAllStreamPackets()` at line 208. The comment accurately describes the purpose. The delay is inside the `if (selectedDevice)` block, so simulation mode is unaffected.

---

### No Regressions: Simulation Mode

**Status: PASS**

Simulation mode (`startSimulation()`, lines 115–144) writes exclusively to `simulationData` state via `setSimulationData()`. It does not touch `isStreaming`, `streamBufferRef`, `allStreamPacketsRef`, or the batch interval. The chart reads `simulationProcessedData` which is derived from `simulationData`.

In `handleStopRecording`, the simulation branch (line 196–199) is:
```typescript
} else if (simulationIntervalRef.current) {
    clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = null;
}
```
This path is unchanged and correct. The `else if` correctly follows the `if (selectedDevice)` block.

---

### No Regressions: JSON ACK Path

**Status: PASS**

The JSON handler for `StartStream` (lines 442–448):
```typescript
case BluetoothProtocolFunction.StartStream:
    console.log("Stream Start Acknowledged");
    if (messageBody.mt === BluetoothProtocolMethod.ACK) {
        isStreamingRef.current = true;
        setIsStreaming(true);
    }
    break;
```
This path still exists and is unchanged in logic. If a legacy device sends a JSON ACK before binary data, this handler sets `isStreamingRef.current = true` first, making the binary branch's `!isStreamingRef.current` check a no-op on subsequent packets. Both paths are idempotent and converge on the same state.

---

### No Regressions: Other BluetoothContext Consumers

**Status: PASS**

The `BluetoothContextData` interface is unchanged. `isStreamingRef` is intentionally not exposed via the context — it is an internal implementation detail. All consumers of `isStreaming` (as a boolean state from context) are unaffected. The context value object at lines 760–808 does not include `isStreamingRef`.

---

### Code Quality

**Status: PASS**

- No unused imports detected. All existing imports remain valid.
- `BINARY_PACKET_MAGIC` is correctly imported from `@iris/domain` (line 23) and used at line 381.
- Comments are purposeful and explain _why_, not _what_ (lines 62–63, 387–389, 556–558).
- TypeScript strict mode compatibility: `isStreamingRef` is typed as `React.useRef(false)` (inferred `React.MutableRefObject<boolean>`), correct.
- `useCallback` dependency array for `handleStopRecording` is accurate after removing `isStreaming`.
- No magic numbers introduced. The 200ms delay constant could be extracted, but at a single usage site this is acceptable per project conventions.
- Project naming conventions followed: no new files created, existing structure preserved.

---

### No Side Effects: Only Specified Files Modified

**Status: PASS**

The two specified files were modified:
1. `IRIS/apps/mobile/src/context/BluetoothContext.tsx`
2. `IRIS/apps/mobile/src/screens/CaptureScreen.tsx`

No other files were changed. `@iris/domain` was not modified (all required constants `BINARY_PACKET_MAGIC`, `DEVICE_SAMPLE_RATE_HZ`, `SIMULATION_SAMPLE_RATE_HZ` were already present from Phase 14/15).

---

## Minor Observations (Non-Blocking)

**O1 — `isStreaming` dep removal from `handleStopRecording` correctly handled.** The validation doc noted this as "harmless" to leave in. The developer went further and removed it cleanly, which is the right call — unnecessary deps cause extra re-creations and can mask stale closure bugs.

**O2 — Comment quality on `startStream()` ref reset.** The comment accurately explains the rapid start/stop cycle rationale. This is better than the architecture doc suggested (which only said "add the reset for correctness").

**O3 — No redundant `setIsStreaming(false)` in `disconnect()`.** This pre-existing gap (noted in validation doc, section 5) is not introduced by this fix. It remains a known limitation: if a device disconnects mid-recording without sending a StopStream ACK, `isStreaming` state stays `true` until the next `startStream()` resets it. This is acceptable for now and is explicitly out of scope for this fix.

---

## Summary

All three required fixes are correctly implemented. The TL's recommendation to reset `isStreamingRef.current` in `startStream()` was applied and well-commented. All `setIsStreaming` call sites (3 of 3) are paired with `isStreamingRef.current` updates. The dependency array in `handleStopRecording` was correctly updated. Simulation mode, JSON ACK path, and all other context consumers are unaffected. Code quality is clean and follows project conventions.

No blocking issues found.

[GATE:PASS]
