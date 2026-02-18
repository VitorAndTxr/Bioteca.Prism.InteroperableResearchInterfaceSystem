# Code Review: Incremental CSV + Downsample Implementation

**Date**: 2026-02-17
**Reviewer**: TL (Tech Lead)
**Specification**: IRIS/docs/ARCHITECTURE_CSV_HZ_FIX.md
**Status**: COMPLETED

---

## 1. Review Scope

Files reviewed:
- `IRIS/docs/ARCHITECTURE_CSV_HZ_FIX.md` — approved specification
- `IRIS/apps/mobile/src/context/BluetoothContext.tsx` — full file
- `IRIS/apps/mobile/src/screens/CaptureScreen.tsx` — full file
- `IRIS/apps/mobile/src/screens/CaptureScreen.test.ts` — full file

---

## 2. Checklist Evaluation

### REQ-1: `serializePacketToCSV()` — 50 samples with 1000/215 ms spacing

**Status: PASS**

Implementation at `BluetoothContext.tsx:32–40`:

```typescript
function serializePacketToCSV(packet: StreamDataPacket, sampleRate: number): string {
    const intervalMs = 1000 / sampleRate;
    let csv = '';
    for (let i = 0; i < packet.values.length; i++) {
        const ts = packet.timestamp + i * intervalMs;
        csv += `${ts.toFixed(2)},${packet.values[i]}\n`;
    }
    return csv;
}
```

Iterates over all `packet.values.length` entries (50 for binary packets). Timestamp spacing is `1000 / DEVICE_SAMPLE_RATE_HZ` = 4.65 ms. Called at line 144 with `DEVICE_SAMPLE_RATE_HZ` as argument. Correct.

---

### REQ-2: `downsamplePacket()` — every 5th value, 10 samples from 50

**Status: PASS**

Implementation at `BluetoothContext.tsx:42–48`:

```typescript
function downsamplePacket(packet: StreamDataPacket): StreamDataPacket {
    const downsampled: number[] = [];
    for (let i = 0; i < packet.values.length; i += DOWNSAMPLE_FACTOR) {
        downsampled.push(packet.values[i]);
    }
    return { timestamp: packet.timestamp, values: downsampled };
}
```

`DOWNSAMPLE_FACTOR = 5` (line 30). For 50 input values, yields indices 0, 5, 10, …, 45 → 10 output values. Correct.

---

### REQ-3: `isFlushingRef` re-entrancy guard

**Status: PASS** (bonus — exceeds spec REQ-1 from TL validation)

`isFlushingRef` is declared at line 104 and correctly applied in `flushStreamBuffer()` (lines 134–185):

```typescript
if (isFlushingRef.current) return;
isFlushingRef.current = true;
try {
    // ...flush logic...
} finally {
    isFlushingRef.current = false;
}
```

`finally` block ensures the guard is always released even on exception. This correctly prevents a 500 ms interval tick from starting a new flush while the previous async I/O is still in flight.

---

### REQ-4: `startRecording()` — creates file with header, sets refs

**Status: PASS**

Implementation at `BluetoothContext.tsx:757–781`:

- Stale recording guard (lines 759–762): calls `stopRecording()` if a recording is already active.
- File path construction uses `FileSystem.documentDirectory` + `recording_<ISO-timestamp>.csv`.
- Writes `'timestamp,value\n'` header via `writeAsStringAsync`.
- Sets `recordingFilePathRef`, `sampleCountRef = 0`, `csvPendingRef = ''`, `isRecordingRef = true`, `setIsRecording(true)` in the correct order (refs before state).
- Returns the file path as `Promise<string>`.

All correct per spec §4.1.

---

### REQ-5: `stopRecording()` — final flush, clears refs, returns result

**Status: PASS**

Implementation at `BluetoothContext.tsx:783–815`:

- Sets `isRecordingRef.current = false` and `setIsRecording(false)` immediately — stops any concurrent flush from appending.
- Captures `filePath` and `sampleCount` before clearing refs.
- Performs final flush of `csvPendingRef` via read + concat + write with error logging.
- Clears `recordingFilePathRef = null` and `sampleCountRef = 0`.
- Returns `{ filePath, sampleCount }`.

One subtle note: `isRecordingRef.current = false` is set before the final flush. This is safe — the final flush reads `csvPendingRef.current` directly rather than checking the recording flag. Correct.

---

### REQ-6: `flushStreamBuffer()` is async — builds CSV lines, downsamples, flushes to disk

**Status: PASS**

`flushStreamBuffer` is declared `async` (`BluetoothContext.tsx:130`). Execution path:

1. Early exit if buffer is empty (line 131).
2. Re-entrancy guard via `isFlushingRef` (lines 134–135).
3. Drains `streamBufferRef` atomically into local `packets` (lines 138–139).
4. If recording: serializes each packet to CSV, accumulates `sampleCountRef`, then reads existing file and writes merged content (lines 142–165).
5. Downsamples all packets via `packets.map(downsamplePacket)` (line 168).
6. Updates `setStreamData` and `setLastStreamTimestamp` (lines 170–182).
7. `isFlushingRef.current = false` in `finally` (line 184).

Matches spec §4.1 and the sequence diagram in §2 exactly.

---

### REQ-7: `allStreamPacketsRef` and `getAllStreamPackets()` fully removed

**Status: PASS**

Neither `allStreamPacketsRef` nor `getAllStreamPackets` appears anywhere in `BluetoothContext.tsx`. Confirmed via full file read (979 lines). No lingering push calls exist in `flushStreamBuffer`, `startStream`, or `clearStreamData`.

`clearStreamData()` at line 817–820 is clean:

```typescript
function clearStreamData(): void {
    setStreamData([]);
    setLastStreamTimestamp(0);
}
```

`startStream()` at lines 612–633 does not reference `allStreamPacketsRef`.

---

### REQ-8: `CaptureScreen` — `startRecording` on mount, `stopBtRecording` on stop

**Status: PASS**

Mount effect at `CaptureScreen.tsx:93–113`:

```typescript
useEffect(() => {
    const initializeStreaming = async () => {
        if (selectedDevice && !isStreaming) {
            await startRecording(sessionId);
            await startStream();
        } else if (!selectedDevice) {
            startSimulation();
        }
    };
    initializeStreaming();
    // cleanup...
}, []);
```

`startRecording(sessionId)` is called before `startStream()` — correct ordering ensures the file exists before any BT packets can arrive.

`stopBtRecording` is called in `handleStopRecording` at `CaptureScreen.tsx:214`:

```typescript
const result = await stopBtRecording();
filePath = result.filePath;
totalSamples = result.sampleCount;
```

The alias `stopRecording: stopBtRecording` is used correctly in the destructuring at line 48. Correct.

---

### REQ-9: Simulation path preserved (`createSimulationCSVContent`)

**Status: PASS**

`createSimulationCSVContent` is present at `CaptureScreen.tsx:360–372`. Logic is identical to the old `createCSVContent` — renamed per spec. The simulation branch in `handleStopRecording` (lines 218–226) uses it correctly:

```typescript
const csvContent = createSimulationCSVContent(simulationData, sampleRate);
```

`FileSystem` import is retained in CaptureScreen (line 28) since simulation mode still writes directly. Correct per spec note §4.2.

---

### REQ-10: No impact on StreamingScreen, `useStreamData`, SyncService

**Status: PASS**

- `BluetoothContextData` interface (lines 932–978) does not remove `exportStreamData`, `clearStreamData`, `streamData`, `lastStreamTimestamp`, or any `StreamingScreen`-consumed property.
- `exportStreamData()` (lines 822–831) is unchanged and still uses `streamData` state.
- `streamData` is still populated via `setStreamData` in `flushStreamBuffer`.
- `useStreamData` is called at `CaptureScreen.tsx:52` without changes.
- No modifications were made to `SyncService`.

---

## 3. Findings

### Blocking Issues

None.

---

### Suggestions (Non-Blocking)

**S1 — `stopRecording` does not wait for the concurrent `flushStreamBuffer` to complete**

`stopRecording()` sets `isRecordingRef.current = false` and then performs its own final flush. However, a concurrent `flushStreamBuffer()` tick (from the 500 ms `setInterval`) may be mid-flight when `stopRecording` is called. The sequence is:

1. `stopRecording()` sets `isRecordingRef = false` and reads `csvPendingRef`.
2. A concurrent flush (already past the `isFlushingRef` check) finishes its file write and resets `csvPendingRef = ''`.
3. `stopRecording()` then finds `csvPendingRef = ''` (already flushed) and skips its own write.

In this scenario data is **not lost** — the concurrent flush wrote it. The `isFlushingRef` guard prevents a second flush from starting, but does not block `stopRecording` from reading `csvPendingRef` concurrently. In practice the 200 ms `setTimeout` in `CaptureScreen.handleStopRecording` (line 196) drains most in-flight I/O before `stopBtRecording()` is called, making this race window extremely narrow.

Mitigation if needed: `stopRecording` could spin-wait on `isFlushingRef.current === false` before reading `csvPendingRef`. Not blocking for current use cases.

**S2 — `sessionId` parameter is accepted but not used**

`startRecording(sessionId: string)` accepts `sessionId` but does not include it in the filename or file content. The spec intentionally omits this, but it would improve traceability if the sessionId were included in the filename (e.g., `recording_<sessionId>_<timestamp>.csv`). Non-blocking — current behavior is correct per spec.

**S3 — Test suite does not cover `serializePacketToCSV` or `downsamplePacket` directly**

`CaptureScreen.test.ts` covers `createSimulationCSVContent` (Suite 1), binary stream detection (Suite 2), and stop guard logic (Suite 3). The two new module-level helpers (`serializePacketToCSV`, `downsamplePacket`) in `BluetoothContext.tsx` are not exported and thus not directly tested. Indirect coverage comes from Suite 1 (same timestamp logic). A dedicated test suite in `BluetoothContext.test.ts` would strengthen coverage, but is not required for this cycle.

**S4 — `isStreaming` dependency absent from mount `useEffect`**

`CaptureScreen.tsx:93` uses an empty dependency array `[]` while referencing `selectedDevice`, `isStreaming`, `startRecording`, `sessionId`, and `startStream`. React strict-mode linting (exhaustive-deps) would flag this. In practice, the empty array is intentional (fire once on mount), and the captured values are stable on mount, so this is not a functional defect.

---

## 4. Architecture Compliance

| Design Decision | Spec | Implementation | Verdict |
|---|---|---|---|
| D1. Option C accumulator strategy | Read+concat+write per flush | `readAsStringAsync` + concat + `writeAsStringAsync` in `flushStreamBuffer` | MATCH |
| D2. CSV append in `flushStreamBuffer`, not `decodeMessage` | Async hook in 500ms batch | CSV block inside `flushStreamBuffer` only | MATCH |
| D3. Recording lifecycle (3 refs + 2 methods + 1 state) | `isRecordingRef`, `recordingFilePathRef`, `sampleCountRef`, `csvPendingRef`, `isRecording`, `startRecording`, `stopRecording` | All present. `isFlushingRef` added as a bonus guard | MATCH + |
| D4. Decimation every 5th sample | `DOWNSAMPLE_FACTOR = 5` | `DOWNSAMPLE_FACTOR = 5`, `downsamplePacket` correct | MATCH |
| D5. CaptureScreen calls `startRecording` on mount | `useEffect([], mount)` | Present; correct call order | MATCH |
| D6. `allStreamPacketsRef` removed | Fully removed | Absent from file | MATCH |
| D7. StreamingScreen unaffected | No API changes | `streamData`, `exportStreamData`, `clearStreamData` all retained | MATCH |

---

## 5. Code Quality Assessment

**Readability**: High. Module-level pure helpers (`serializePacketToCSV`, `downsamplePacket`) are clearly separated from the context provider. The `DOWNSAMPLE_FACTOR` constant with inline comment (`// 50 samples → 10 samples per packet`) makes the intent immediately clear.

**Naming**: All identifiers match the spec verbatim. `stopBtRecording` alias in CaptureScreen is a clean resolution of the name collision.

**Single Responsibility**: `flushStreamBuffer` now has three responsibilities (CSV accumulation, disk write, downsample + UI update), which is a slight SRP tension. However, keeping all three in one function is justified by the architecture (shared packet loop, atomic buffer drain) and does not warrant splitting for this cycle.

**Security**: No user-controlled data enters file paths. `FileSystem.documentDirectory` is sandboxed. No injection risks.

**Error Handling**: CSV flush errors are caught and logged at `warn` level; pending data is retained for the next tick. Final flush errors in `stopRecording` are logged at `error` level. This matches the spec's crash-safety guarantee.

**TypeScript**: Strict-mode compliant. No `any` types observed. `BluetoothContextData` interface is fully updated.

---

[GATE:PASS]
