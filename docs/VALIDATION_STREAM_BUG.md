# Validation: Stream Data Bug Fix (Empty CSV + Static Chart)

**Date**: 2026-02-17
**Validator**: PM (Product Manager)
**Related Documents**:
- `docs/PROJECT_BRIEF_BUG_STREAM_CSV.md` -- Business objectives, scope, hypotheses
- `docs/ARCHITECTURE_STREAM_BUG_FIX.md` -- Root cause analysis and fix design

---

## PM Validation

### 1. Root Cause Explanation of Both Symptoms

The architecture confirms H1 as the primary root cause: the `isStreaming` flag in `BluetoothContext.tsx` is gated exclusively on receiving a JSON ACK with `cd === StartStream` and `mt === ACK`. With firmware v3.1+ using binary streaming protocol, the device begins sending binary `0xAA` packets immediately without emitting a JSON ACK. Because `isStreaming` never transitions to `true`, the 500ms batch flush interval never starts. Data accumulates in `streamBufferRef` but is never moved to `allStreamPacketsRef` (CSV source) or `streamData` state (chart source).

This single root cause fully explains both reported symptoms:

| Symptom | Causal Chain |
|---------|-------------|
| **Empty CSV** | `isStreaming` stays `false` --> flush interval never starts --> `allStreamPacketsRef` stays empty --> `getAllStreamPackets()` returns empty array --> `createCSVContent()` produces header-only CSV |
| **Static chart** | `isStreaming` stays `false` --> flush interval never starts --> `streamData` state never updates --> `useStreamData` receives empty input --> `SEMGChart` renders flat line |

The architecture also confirms H2 (race condition on stop) as a secondary, compounding bug. The guard `selectedDevice && isStreaming` at `CaptureScreen.tsx:190` evaluates to `false` because `isStreaming` was never `true`, so `stopStream()` is never even called. This means the device continues streaming indefinitely after the user presses stop, wasting battery and Bluetooth bandwidth. This is a legitimate secondary defect that the fix plan correctly addresses.

H3 (binary decoder drops packets) and H4 (decodeMessage drops data) are rejected with evidence. The `BinaryFrameAccumulator` and `decodeMessage()` implementations are verified correct -- data enters `streamBufferRef` successfully but is never flushed downstream. This is consistent with the H1 root cause.

**Assessment**: PASS -- The root cause analysis is thorough, evidence-based, and fully explains both reported symptoms through a single causal mechanism. The secondary bug (H2) is a real defect that compounds the primary issue. No alternative explanations remain unaddressed.

### 2. Fix Minimality and Risk Assessment

The fix plan proposes exactly 3 changes:

**Fix 1 (MUST): Set `isStreaming = true` on first binary packet** -- This is the minimum viable fix for the primary root cause. The arrival of a binary sEMG packet is unambiguous proof that the device has started streaming, making this an implicit ACK. The implementation adds a `useRef<boolean>` to avoid stale closure issues (the BT listener callback captures `decodeMessage` at connect-time, so React state would be stale). The ref-based approach is technically sound and adds only a single boolean check per `decodeMessage` call with no performance impact.

Risk assessment: Low. The fix is idempotent -- if the device also sends a JSON ACK (older firmware), the JSON handler sets `isStreaming = true` at line 436 first, and the binary branch's `!isStreamingRef.current` check becomes a no-op. Both paths converge on the same state. The change also requires syncing `isStreamingRef` at all 3 existing `setIsStreaming` call sites (lines 430, 436, 443), which is a well-scoped, auditable change.

**Fix 2 (MUST): Remove `isStreaming` guard from `stopStream` call** -- Defensive fix that ensures `stopStream()` always sends the BT command when a device is connected, regardless of `isStreaming` state. Sending StopStream to a non-streaming device is harmless (device ignores or NACKs). This prevents the device from streaming indefinitely if the app's state tracking is out of sync.

Risk assessment: Low. The only behavioral change is that `stopStream()` may be called when `isStreaming` is `false`, which the device firmware handles gracefully.

**Fix 3 (SHOULD): 200ms delay before CSV export** -- Captures trailing BT packets that arrive between `stopStream()` and `getAllStreamPackets()`. At 215 Hz with 50 samples/packet, this recovers ~4 additional packets (~200 samples). The delay is imperceptible to users.

Risk assessment: Low. Adds 200ms to the save flow, which is within acceptable UX bounds. This is optional and correctly prioritized as SHOULD rather than MUST.

**Assessment**: PASS -- All three fixes are minimal, targeted, and low-risk. No unnecessary refactoring is introduced. The change footprint is small (2 files, ~15 lines of meaningful logic), which minimizes regression surface. The risk analysis is honest and complete, with concrete mitigation for each identified risk.

### 3. Scope Alignment with Investigation Objective

The project brief defines 4 business objectives:

| # | Objective | Fix Coverage | Status |
|---|-----------|-------------|--------|
| 1 | Identify root cause of empty CSV | H1 confirmed: `isStreaming` gating prevents data flow to `allStreamPacketsRef` | COVERED |
| 2 | Identify root cause of static chart | Same H1 root cause: `isStreaming` gating prevents data flow to `streamData` state | COVERED |
| 3 | Produce fix plan with minimal code changes | 3 fixes across 2 files, ~15 lines of core logic | COVERED |
| 4 | Verify fix does not regress simulation mode | Architecture Section "Regression Risks" explicitly confirms simulation mode is unaffected -- it bypasses `isStreaming`, `streamBufferRef`, and `allStreamPacketsRef` entirely | COVERED |

The scope stays within the brief's defined boundaries:

- **ESP32 firmware**: No changes proposed. Correct -- the brief states "investigation is mobile-side only."
- **Backend**: No changes to Upload controller or blob storage. Correct per scope.
- **Desktop app**: Not mentioned. Correct -- not affected.
- **New features/UX improvements**: None introduced. The fixes restore existing intended behavior.
- **Performance optimization**: None beyond the trailing-packet delay, which directly serves the bug fix.

The architecture introduces `isStreamingRef` (a React ref) that was not explicitly mentioned in the brief's hypotheses. This is a necessary implementation detail to work around React closure staleness in the BT callback, not scope expansion. The brief's investigation step 5 says "implement the minimal code change (likely: decouple batch flush from `isStreaming`, or trigger `isStreaming = true` when first binary packet arrives)" -- the fix implements the latter option exactly.

**Assessment**: PASS -- Perfect alignment with investigation objectives. No scope creep.

### 4. Business Requirements Gap Analysis

I reviewed the brief's constraints, stakeholder concerns, and risk register against the fix plan:

**Constraint C1 (Cannot modify ESP32 firmware)**: Respected. All changes are mobile-side.

**Constraint C2 (Must support both binary and legacy JSON streaming)**: Respected. The JSON ACK handler at line 436 still sets `isStreaming = true`. Fix 1's binary path is additive and idempotent -- it does not interfere with the JSON path.

**Constraint C3 (React Native threading model)**: Addressed. The architecture explicitly analyzes the closure staleness issue with BT callbacks and proposes the ref-based solution to avoid relying on stale React state. This is a technically sound approach for React Native's single-threaded JS execution model.

**Constraint C4 (No server-side logs available)**: Not relevant for the fix phase, only for reproduction during investigation.

**Stakeholder concern -- Researchers losing confidence**: The fix restores real-time chart feedback during recording and ensures CSV files contain valid data, directly addressing researcher trust in the system.

**Stakeholder concern -- Backend receiving empty CSVs**: After the fix, `allStreamPacketsRef` will be populated before `getAllStreamPackets()` is called, so CSVs written to disk (and subsequently uploaded by SyncService) will contain actual sEMG data.

**Stakeholder concern -- Device team protocol compatibility**: The fix does not change the Bluetooth protocol or how commands are sent/received. It only changes how the app's internal state responds to incoming binary data.

**Business risk R2 (Corrupted recordings already synced)**: The fix does not address historical data. The brief notes this as a separate concern ("After fix, audit synced recordings for empty content"). This is correctly out of scope for the bug fix itself but should be tracked as a follow-up task.

**Assessment**: PASS -- No business requirements are missed. The fix addresses all stakeholder concerns within the defined scope. The historical data audit (R2) is a valid follow-up item that does not block this fix.

### 5. Verification Plan Assessment

The architecture includes a 6-step verification plan:

1. Connect to real ESP32 with firmware v3.1+
2. Start recording: verify `isStreaming` transitions to `true`
3. During recording: verify chart updates in real-time
4. Stop recording: verify CSV contains data
5. Simulation mode: verify chart and save still work
6. JSON firmware: verify both paths still work

This covers the core functional scenarios. Each step directly maps to a business objective or regression risk. The plan does not require complex test infrastructure -- it can be executed with a single device and the Expo development build.

**Assessment**: PASS -- Verification plan is complete and executable.

---

## PM Verdict

The architecture document demonstrates a rigorous, evidence-based root cause analysis that fully explains both reported symptoms (empty CSV and static chart) through a single primary mechanism: the `isStreaming` flag is never set to `true` during binary streaming sessions because it depends exclusively on a JSON ACK that firmware v3.1+ does not send. The secondary bug (stop guard also depends on `isStreaming`) compounds the issue by preventing the device from being told to stop streaming.

The proposed fixes are minimal (3 targeted changes in 2 files), low-risk (idempotent state transitions, harmless no-ops on edge cases), and well-scoped (no firmware changes, no scope creep, no unnecessary refactoring). The fix preserves backward compatibility with both binary and JSON streaming protocols, does not affect simulation mode, and includes a clear verification plan.

No business requirements are missed. The only outstanding item is a follow-up audit of historical empty recordings already synced to the backend, which is correctly identified as out of scope for this fix.

**[VERDICT:APPROVED]**

---

## TL Technical Validation

**Reviewer**: Tech Lead
**Date**: 2026-02-17
**Document Under Review**: `IRIS/docs/ARCHITECTURE_STREAM_BUG_FIX.md`

---

### 1. Root Cause Diagnosis Verification

**Verdict: CONFIRMED -- root cause analysis is correct.**

I traced the exact code path against the source files and verified every line reference in the architecture document.

**Evidence chain verified:**

1. `startStream()` (BluetoothContext.tsx:538-556) resets buffers but does NOT set `isStreaming = true` -- confirmed at lines 545-549. Buffer resets are correct (`streamBufferRef`, `allStreamPacketsRef`, `binaryAccumulatorRef.reset()`).

2. `isStreaming` is only set to `true` at line 436, inside the JSON handler for `BluetoothProtocolFunction.StartStream` with `mt === ACK`. There are exactly 3 `setIsStreaming` call sites in the file: line 430 (EmergencyStop, sets `false`), line 436 (StartStream ACK, sets `true`), line 443 (StopStream ACK, sets `false`). No other call site exists.

3. The `onDataReceived` callback at line 339 routes to `decodeMessage()`. Binary packets (first byte `0xAA`) are handled at lines 379-386, which feed the accumulator and push to `streamBufferRef` but never touch `isStreaming`. The JSON switch-case at line 433 is only reached when the first byte is `0x7B` (`{`). If firmware sends binary-only (no JSON ACK), the StartStream case is never reached.

4. The batch flush `useEffect` at lines 124-147 gates on `isStreaming`. Since `isStreaming` stays `false`, the 500ms `setInterval` never starts. The `else` branch at line 133 runs once on mount (before any data arrives), calling `flushStreamBuffer()` which finds an empty `streamBufferRef`.

5. `getAllStreamPackets()` at lines 680-683 calls `flushStreamBuffer()` synchronously and returns a copy of `allStreamPacketsRef.current`. **Nuance**: the CSV is not necessarily _fully_ empty. When `handleStopRecording()` executes, line 204 calls `getAllStreamPackets()` regardless of whether `stopStream()` was called. The synchronous `flushStreamBuffer()` inside it drains whatever is in `streamBufferRef` at that instant into `allStreamPacketsRef`. So the CSV may contain some data. However, the chart remains static throughout the recording because `streamData` state was never updated (the batch interval never ran). The root cause diagnosis in the architecture doc is accurate for the chart symptom and mostly accurate for the CSV symptom (the CSV will contain partial data, not necessarily zero data, depending on timing).

---

### 2. Fix 1 Validation: `isStreamingRef` + `setIsStreaming(true)` on First Binary Packet

**Verdict: APPROVED with one additional recommendation.**

**Closure analysis -- correct.** `decodeMessage` is declared as a plain `function` inside the component body (line 366). The BT listener callback at line 339 captures a reference to this function at connect-time. Subsequent renders produce new `decodeMessage` instances, but the listener retains the original closure. Reading `isStreaming` (React state) from this stale closure always yields `false` (the initial value). The `useRef` approach is the canonical React solution: refs are mutable containers whose identity is stable across renders, so `isStreamingRef.current` always reflects the latest value regardless of closure staleness.

**Thread safety -- verified.** React Native runs JavaScript on a single thread. `decodeMessage()` is invoked synchronously from the BT `onDataReceived` callback. There is no interleaving of concurrent `decodeMessage` calls. The `isStreamingRef.current = true` write is an immediate mutation, and the subsequent `setIsStreaming(true)` enqueues a state update for the next microtask/render cycle. Between the ref write and the state update, any additional `decodeMessage` calls see `isStreamingRef.current === true` and skip the setter. No race condition is possible.

**Performance -- negligible.** At 215 Hz with 50 samples per packet, `decodeMessage` fires ~4.3 times per second. The `!isStreamingRef.current` check is a single property access (O(1)). `setIsStreaming(true)` is called exactly once (on first binary packet). React deduplicates `true -> true` state updates, but the ref gate prevents even reaching the setter after the first call.

**Sync with existing `setIsStreaming` call sites -- mandatory.** The architecture doc correctly identifies all 3 sites that must pair with `isStreamingRef.current`:
- Line 430: EmergencyStop -> `isStreamingRef.current = false`
- Line 436: StartStream ACK -> `isStreamingRef.current = true`
- Line 443: StopStream ACK -> `isStreamingRef.current = false`

**Additional recommendation**: `startStream()` at line 538 resets all data buffers (lines 545-549) but does NOT reset `isStreamingRef`. In a rapid start/stop/start cycle, `isStreamingRef.current` would be `true` from the previous session before any new data arrives. While functionally harmless (the batch interval is restarted by the `isStreaming` state transition anyway), this is logically incorrect. **Add `isStreamingRef.current = false` to `startStream()`** alongside the buffer resets for correctness.

---

### 3. Fix 2 Validation: Remove `isStreaming` from Stop Guard

**Verdict: APPROVED.**

**Current code** (CaptureScreen.tsx:190):
```typescript
if (selectedDevice && isStreaming) {
    await stopStream();
}
```

**Proposed**:
```typescript
if (selectedDevice) {
    await stopStream();
}
```

**Device-side safety:** `stopStream()` (BluetoothContext.tsx:558-570) sends `{cd: StopStream, mt: EXECUTE}` via `writeToBluetooth()`. The ESP32 firmware ignores StopStream when not actively streaming -- it either sends a NACK or silently discards the command. No harmful side effect.

**Disconnect edge case:** If the device disconnects mid-recording, the `onDisconnectListener` (line 344-351) calls `disconnect()` which sets `selectedDevice` to `undefined` (line 505). The `if (selectedDevice)` check at CaptureScreen:190 guards this correctly -- `stopStream()` is not attempted on a disconnected device.

**`handleStopRecording` closure:** This callback is wrapped in `useCallback` with `isStreaming` in its dependency array (line 253). After Fix 2, `isStreaming` is no longer read inside the stop guard, but it remains in the dependency array. This is harmless (extra recreations when `isStreaming` changes are cheap). Removing it from the dep array would be a minor optimization but is not required.

**Simulation mode:** Unaffected. When `selectedDevice` is `undefined`, the `if (selectedDevice)` branch is skipped, and the `else if (simulationIntervalRef.current)` branch at line 192 handles simulation cleanup. This logic path is unchanged.

---

### 4. Fix 3 Validation: 200ms Trailing-Packet Delay

**Verdict: APPROVED as SHOULD (non-blocking).**

**Is 200ms sufficient?** After the StopStream command is sent and the ESP32 acknowledges it, any in-flight SPP packets in the native Bluetooth stack typically arrive within 50-100ms (BT Classic SPP latency). 200ms provides a 2-4x safety margin, which is appropriate.

**Can a synchronous flush replace the delay?** No. The synchronous `flushStreamBuffer()` inside `getAllStreamPackets()` drains `streamBufferRef` into `allStreamPacketsRef`. But packets that are still in transit in the native Bluetooth layer have not yet been delivered to `onDataReceived` and therefore are not in `streamBufferRef`. No synchronous operation can capture data that hasn't arrived yet. The delay is fundamentally about giving the BT stack time to deliver its final callbacks.

**Could an event-driven approach replace the delay?** One could wait for the StopStream ACK from the device as a "done" signal. But this reintroduces the JSON ACK dependency that Fix 1 decouples from, and it would block indefinitely if the device doesn't send the ACK (e.g., after a disconnect). The timeout-based approach is simpler and more robust.

**UX impact:** The saving modal appears immediately at line 198 (`setSavingModalVisible(true)`), showing a "Saving..." state. The 200ms elapses while the user sees this modal. Imperceptible.

---

### 5. Side Effect Analysis

| Scenario | Impact |
|----------|--------|
| **Simulation mode** | No impact. Simulation writes to `simulationData` state directly (CaptureScreen:115-144), bypassing `isStreaming`, `streamBufferRef`, and the batch interval entirely. |
| **JSON protocol (firmware v2.x)** | No impact. JSON ACK at line 436 sets `isStreaming` first. When binary data later arrives, `isStreamingRef.current` is already `true`, so Fix 1's ref gate is a no-op. Both paths are idempotent. |
| **Legacy JSON streaming (StreamData code)** | No regression. The `StreamData` case at line 447-455 pushes to `streamBufferRef` but does not set `isStreaming`. This is a pre-existing limitation for pure JSON streaming, but firmware v2.x sends the JSON StartStream ACK, so `isStreaming` is set via the JSON handler. |
| **EmergencyStop** | Covered. Line 430 sets `setIsStreaming(false)`. Architecture doc requires adding `isStreamingRef.current = false` here. |
| **Device disconnect mid-recording** | `disconnect()` at line 487-509 resets the accumulator (line 504) and sets `selectedDevice = undefined` (line 505) but does NOT reset `isStreaming`. This is a pre-existing gap (not introduced by this fix). The batch interval continues running but receives no new data. On next `startStream()`, buffers are cleared. No regression. |
| **`exportStreamData()` function** | Line 692-701 exports `streamData` state (the capped 500-packet UI buffer), NOT `allStreamPacketsRef`. This function is not called from `handleStopRecording` (which uses `getAllStreamPackets()` instead). No impact from the fix. |

---

### 6. Missing Edge Cases

**Edge case found: `isStreamingRef` not reset in `startStream()`**

`startStream()` (line 538) resets `streamData`, `streamBufferRef`, `allStreamPacketsRef`, and the binary accumulator (lines 545-549). It does NOT reset `isStreamingRef`. In a rapid start/stop/start cycle:

1. First session: `isStreamingRef.current` becomes `true` on first binary packet.
2. Stop: `isStreamingRef.current` becomes `false` via StopStream ACK handler (line 443).
3. Second start: `startStream()` resets buffers. If the StopStream ACK from step 2 hasn't arrived yet (async), `isStreamingRef.current` may still be `true`.

The practical impact is minimal (the batch interval is controlled by `isStreaming` state, which is correctly managed by the `useEffect`), but for logical correctness, `startStream()` should explicitly set `isStreamingRef.current = false`.

**No other missing edge cases identified.** The architecture doc is thorough.

---

### TL Verdict

The architecture document demonstrates rigorous root cause analysis with correct line-level code references verified against the actual source files. The fix design is minimal, technically sound, and correctly addresses both the primary symptom (static chart) and secondary symptom (missing CSV data / device not stopped).

Fix 1 (ref-based implicit stream-start) correctly solves the stale closure problem inherent in the BT callback architecture. Fix 2 (defensive stop guard) is a necessary complement. Fix 3 (trailing-packet delay) is a reasonable optional improvement.

One recommendation: add `isStreamingRef.current = false` to `startStream()` for logical correctness in rapid start/stop cycles.

**[VERDICT:APPROVED]**
