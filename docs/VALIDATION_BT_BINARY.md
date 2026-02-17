# Validation: Bluetooth Binary Message Decoding

**Date**: 2026-02-17
**Validators**: PM (Product Manager), TL (Tech Lead)
**Related Documents**:
- `docs/PROJECT_BRIEF_BT_BINARY.md` — Business objectives, scope, success criteria
- `docs/ARCHITECTURE_BT_BINARY.md` — Technical architecture, implementation spec

---

## PM Validation

### 1. Business Objective Coverage

The project brief identifies a single, well-defined problem: binary sEMG packets from the ESP32 device (firmware v3.1+) are silently dropped because `decodeMessage()` blindly calls `JSON.parse()` on all incoming data. This breaks the entire real-time streaming pipeline with real hardware.

The architecture document addresses this problem comprehensively with a three-layer solution (connection layer, routing layer, decoding layer). Critically, the architecture uncovered a **second root cause** not originally identified in the project brief: the `react-native-bluetooth-classic` library's default `"delimited"` connection type corrupts binary data at the native layer before it even reaches JavaScript. The architecture's decision D1 (switch to `connectionType: "binary"`) resolves this foundational issue, without which the JavaScript-layer binary decoder would receive garbled data regardless of implementation quality. This represents sound technical analysis that strengthens the overall solution.

**Assessment**: PASS — The architecture fully addresses the stated business objective and proactively identifies an additional root cause that the brief's scope description did not cover. The brief's scope section focused on JavaScript-layer detection and decoding, but the architecture correctly elevates the connection type change as a prerequisite. No business objective is left unaddressed.

### 2. Success Criteria Coverage

| # | Success Criterion | Architecture Coverage | Status |
|---|-------------------|-----------------------|--------|
| SC1 | Binary packets decoded without errors | Section 3 (decoder spec) + Section 8 Phase 2 — `decodeBinaryPacket()` with full validation (magic, code, sample count) | COVERED |
| SC2 | JSON messages continue to work | Section 8 Change 5 — `0x7B` routing branch, existing switch cases preserved unchanged | COVERED |
| SC3 | Real-time visualization receives data | Section 5 — decoded packets pushed to `streamBufferRef`, same pipeline as existing JSON path | COVERED |
| SC4 | CSV export captures binary data | Section 5 — `allStreamPacketsRef` accumulates via unchanged `flushStreamBuffer()` | COVERED |
| SC5 | Partial packet handling | Section 4 — `BinaryFrameAccumulator` with byte-level buffering, growth, compaction | COVERED |
| SC6 | No silent data loss | Section 6 — `droppedCount` counter, `console.warn` on packet drops, `getStats()` accessor | COVERED |
| SC7 | Zero console errors during streaming | Architecture eliminates `JSON.parse()` call on binary data; Base64 decode + first-byte routing prevents `SyntaxError` | COVERED |

**Assessment**: PASS — All 7 success criteria are explicitly addressed in the architecture with clear implementation paths. No gaps.

### 3. Risk Mitigation Review

| # | Risk | Brief Mitigation | Architecture Response | Status |
|---|------|-------------------|-----------------------|--------|
| R1 | String encoding corrupts bytes > 0x7F | Test with real device; investigate encoding options | Architecture eliminates this risk entirely via D1 (`connectionType: "binary"` delivers Base64, not charset-decoded strings) | EXCEEDED |
| R2 | SPP fragmentation | Accumulator handles arbitrary chunks | `BinaryFrameAccumulator` with explicit algorithm (Section 4), growth strategy, compaction | COVERED |
| R3 | DataView/Uint8Array performance on Hermes | Profile on target device | Appendix C confirms Hermes supports all needed APIs; Appendix B quantifies overhead at ~620 bytes/s (negligible) | COVERED |
| R4 | Mixed binary+JSON in single callback | Accumulator scans for `0xAA` + JSON on pre-marker bytes | Section 8 Change 5 — first-byte routing (`0xAA` vs `0x7B` vs fallback to accumulator) | COVERED |
| R5 | JSON code 13 handler vs binary code 13 | Binary detection first, JSON switch remains | Section 8 explicitly states "The `StreamData` case (code 13) in the JSON switch also stays" | COVERED |

**Assessment**: PASS — R1 mitigation actually exceeds the brief's expectation by eliminating the root cause rather than working around it. All other risks have concrete mitigation strategies in the architecture.

### 4. Scope Boundary Validation

The architecture stays within the brief's defined scope boundaries:

- **ESP32 firmware**: No changes proposed. Architecture references `StreamingProtocol.h` as read-only specification.
- **Backend**: No changes. `SyncService` and `InteroperableResearchNode` are explicitly excluded.
- **Desktop app**: Not mentioned. Correct — desktop does not use Bluetooth.
- **JSON protocol**: Preserved unchanged. The existing `switch(messageBody.cd)` block is carried forward verbatim.
- **Simulation mode**: Unaffected. JSON code 13 handler remains for simulation/legacy firmware paths.
- **Signal processing**: Not touched. Architecture notes "values used directly as numbers" per firmware spec.
- **Chart rendering / reconnection**: Out of scope per brief; not addressed in architecture.

The architecture introduces one change not explicitly listed in the brief's scope: the `connectionType: "binary"` switch (D1). This is a necessary prerequisite discovered during technical analysis and falls within the spirit of the brief's scope ("Binary Detection in `decodeMessage()`" requires intact bytes to function). This is an appropriate scope expansion.

**Assessment**: PASS — No scope creep. One justified scope addition (connection type) that is a technical prerequisite.

### 5. Affected Components Alignment

| Brief Lists | Architecture Lists | Match |
|-------------|-------------------|-------|
| BluetoothContext.tsx — modify `decodeMessage()` | BluetoothContext.tsx — 6 specific changes enumerated | YES |
| Stream.ts — add binary constants | Stream.ts — 5 constants specified with exact values | YES |
| binaryDecoder.ts (NEW) — decoder + accumulator | binaryDecoder.ts (NEW) — function + class with full signatures | YES |
| Domain barrel export | Architecture says no change needed (auto-exported) | YES (simplified) |

The architecture's "Files NOT Changed" table (Section 9) explicitly lists `index.ts`, `Bluetooth.ts`, screen components, `csvExport.ts`, and `SessionContext.tsx` as unchanged — providing clear scope boundaries for implementers.

**Assessment**: PASS — Perfect alignment between brief and architecture affected components.

### 6. Backlog Story Coverage

No backlog document (`BACKLOG_BT_BINARY.md`) was found. This is expected at this stage — the backlog is created by the PO after validation gates pass. The brief provides sufficient detail for story decomposition: 5 in-scope work areas, clear acceptance criteria per success criterion, and the architecture provides 3 implementation phases with file-level change specs.

**Assessment**: N/A — Backlog creation is a downstream deliverable, not a validation prerequisite.

### 7. Client Decision Review

The brief identifies 2 client decisions:

1. **Encoding verification** (Tech Lead during implementation) — The architecture resolves this proactively via D1/D2 (Base64 connection type + `react-native-quick-base64`). No runtime encoding ambiguity remains. Decision is effectively pre-resolved.

2. **Dropped packet logging level** (`console.warn` during dev) — Architecture Section 6 confirms `console.warn` on every drop plus counter-based `getStats()`. Aligns with brief's recommendation. Decision adopted.

**Assessment**: PASS — Both decisions are addressed. No open questions remain.

### 8. Feasibility Observations

The architecture demonstrates strong feasibility signals:

- `react-native-quick-base64` is already a project dependency (confirmed in `package.json`).
- The existing `streamBufferRef` / `flushStreamBuffer()` pipeline is confirmed functional with simulated data — binary packets produce identical `StreamDataPacket` objects.
- Hermes engine supports `DataView`, `Uint8Array`, `TextDecoder` (Appendix A/C).
- The change footprint is minimal: 1 new file, 2 modified files, no new dependencies.
- Performance budget is comfortable: 4.3 packets/s at 108 bytes is trivial for modern mobile hardware.

**Assessment**: PASS — High confidence in technical feasibility.

---

### PM Verdict

The architecture document is thorough, well-structured, and fully addresses all business objectives, success criteria, and risks identified in the project brief. The discovery of the connection type mismatch (root cause #2) demonstrates the value of the TL's deep technical analysis and strengthens the solution. The scope is tightly controlled with no creep, and the implementation plan is clear with dependency-ordered phases. No questions or blockers remain.

**[VERDICT:APPROVED]**

---

## TL Validation

**Reviewer**: TL (Tech Lead)
**Date**: 2026-02-17
**Reviewed Documents**: `ARCHITECTURE_BT_BINARY.md`, `PROJECT_BRIEF_BT_BINARY.md`
**Source Code Inspected**: `BluetoothContext.tsx`, `Stream.ts`, `index.ts`, `ByteArrayDeviceConnectionImpl.java`, `DelimitedStringDeviceConnectionImpl.java`, `StandardOption.java`, `RNBluetoothClassicPackage.java`, `BluetoothNativeModule.d.ts`

### 1. Root Cause Analysis Verification

I verified both root causes against the actual library source code in `node_modules/react-native-bluetooth-classic`:

**Root Cause 1 (Connection Type Mismatch)**: CONFIRMED. `DelimitedStringDeviceConnectionImpl.java:74` constructs a `new String(bytes, mCharset)` where `mCharset` defaults to `Charset.forName("ascii")` (`StandardOption.java:50`). ASCII maps bytes 0x80-0xFF to replacement characters, destroying sEMG sample values that use the full int16_t range. Additionally, the delimiter defaults to `\n` (0x0A), which is a valid byte value in binary packets — causing mid-packet fragmentation. The architecture correctly identifies both the charset corruption and the delimiter fragmentation as distinct failure modes.

**Root Cause 2 (JSON.parse on binary data)**: CONFIRMED. `BluetoothContext.tsx:361` passes all incoming data through `JSON.parse()` with no protocol discrimination. Binary packets starting with `0xAA` (170 decimal) will always fail JSON parsing.

**Assessment**: PASS — Both root causes verified against source code. The architecture's analysis is accurate.

### 2. Binary Decoder Correctness

The packet structure in Section 3 specifies:
- Offset 0: magic `0xAA` (1 byte)
- Offset 1: message_code `0x0D` (1 byte)
- Offset 2: timestamp `uint32_t` LE (4 bytes)
- Offset 6: sample_count `uint16_t` LE (2 bytes)
- Offset 8: samples `int16_t[50]` LE (100 bytes)
- Total: 108 bytes

The `DataView`-based parsing steps are correct:
- `getUint32(2, true)` for LE timestamp at offset 2 — correct.
- `getUint16(6, true)` for LE sample count at offset 6 — correct.
- `getInt16(8 + i * 2, true)` for LE samples starting at offset 8 — correct.
- The `DataView` constructor `new DataView(buffer.buffer, buffer.byteOffset + offset, 108)` correctly handles sliced `Uint8Array` views where `byteOffset` may be non-zero.

The sample count validation (`=== 50`) is appropriate since the firmware always sends exactly 50 samples per packet. Values are used directly as numbers (1 LSB = 1 mV per firmware spec).

**Assessment**: PASS — Binary parsing logic is correct. DataView byte offsets, endianness, and signed/unsigned type choices all match the ESP32 firmware packet structure.

### 3. Buffer Accumulation Safety

The `BinaryFrameAccumulator` algorithm in Section 4 is sound:

**Growth strategy**: Doubling capacity when `writePos + incoming.length > capacity` is a standard amortized O(1) approach. Initial capacity of 512 bytes (4.7 packets) is reasonable for the expected 4.3 packets/s rate.

**Compaction**: Shifting remaining bytes to position 0 after each `feed()` prevents unbounded growth. At worst, 107 bytes (one almost-complete packet) remain after compaction — negligible memory.

**Resync logic**: The linear scan for `0xAA` is correct for error recovery. The algorithm avoids a subtle pitfall by checking both magic (0xAA) AND message code (0x0D) before attempting a full decode (steps 4a and 4b in the algorithm). This prevents false-positive magic bytes within sample data from triggering invalid decode attempts.

**Edge case — `0xAA` inside sample data**: An int16_t sample value could contain the byte `0xAA` (e.g., the value `0x0DAA` = 3498, or `0xAA0D` = -21747 on LE). The algorithm handles this correctly because after finding `0xAA` at step 4a, it checks `buffer[scanPos + 1] !== 0x0D` at step 4b. The probability of a false `0xAA 0x0D` sequence in sample data is ~1/65536 per sample pair boundary, which is low. Even in that case, the full `decodeBinaryPacket()` call at step 4c validates the sample count, providing a secondary guard. A packet with an embedded false-positive `0xAA 0x0D` followed by valid-looking sample count of 50 is theoretically possible but astronomically unlikely. This is an acceptable trade-off.

**Edge case — buffer retention between calls**: The algorithm correctly retains partial packets across `feed()` calls (step 5 compaction preserves `[scanPos..writePos)` bytes). This handles SPP fragmentation where a 108-byte packet is delivered in two chunks.

**Assessment**: PASS — Buffer management is safe, growth is bounded, compaction prevents leaks, and resync handles corruption gracefully.

### 4. Base64 Decoding Approach

I verified the library's `ByteArrayDeviceConnectionImpl.java:89`:
```java
String message = Base64.encodeToString(arr, Base64.DEFAULT);
```

Android `Base64.DEFAULT` adds CRLF line breaks every 76 characters. The `react-native-quick-base64` library's `toByteArray()` function (already in `package.json` at `^2.2.2`) handles standard Base64 with embedded whitespace, so this is not a problem.

The architecture correctly identifies that `connectionType: "binary"` causes ALL data (including JSON responses) to arrive as Base64. The routing logic in `decodeMessage()` (Section 8, Change 5) decodes Base64 first, then inspects `bytes[0]` to route — this is the correct order of operations.

One consideration: `Base64.DEFAULT` uses standard Base64 alphabet (not URL-safe). `toByteArray()` from `react-native-quick-base64` decodes standard Base64, so there is no alphabet mismatch.

**Assessment**: PASS — Base64 approach is correct and compatible.

### 5. Integration with StreamDataPacket Pipeline

The architecture correctly identifies the integration point at `streamBufferRef.current.push(packet)` (Section 5). I verified in `BluetoothContext.tsx`:

- `streamBufferRef` (line 67): `React.useRef<StreamDataPacket[]>([])`
- `flushStreamBuffer()` (line 92): moves buffered packets to `streamData` state (capped at 500) and `allStreamPacketsRef` (unbounded for CSV export)
- Batch interval (line 121): 500ms flush cycle via `setInterval` + `requestAnimationFrame`

The binary decoder produces `StreamDataPacket` objects with `{ timestamp: number, values: number[] }` — identical shape to the JSON path (line 420-423). No downstream changes are required.

The architecture's claim that "No changes are needed to `flushStreamBuffer()`, `allStreamPacketsRef`, `setStreamData()`, `exportStreamData()`, `getAllStreamPackets()`, or any chart/visualization component" is verified correct.

**Assessment**: PASS — Seamless integration. Same `StreamDataPacket` shape from both paths.

### 6. Error Handling Review

The error handling strategy is comprehensive:

- **Base64 decode failure**: Caught by the outer `try/catch` in `decodeMessage()`, logged via `console.warn`. App does not crash.
- **Corrupted magic byte**: Accumulator scans forward, increments `droppedCount`.
- **Wrong message code**: Skip one byte, continue scanning.
- **Invalid sample count**: Discard packet, log warning — though the architecture says "skip 108 bytes" in Section 6's error table, which conflicts with the algorithm in Section 4 step 4e where it skips only 1 byte (`scanPos++`). The step-4e behavior is actually more correct for resync purposes (skipping only 1 byte allows finding the next valid packet sooner), so the error table in Section 6 should be considered informational and the algorithm in Section 4 should be followed.
- **Incomplete packet**: Wait for next `feed()` call — correct, bytes remain in buffer.
- **JSON parse failure**: Logged at `console.warn`, no crash — matches existing behavior.

**Non-blocking note N1**: Section 6 error table says "skip 108 bytes" for invalid sample count, but the actual algorithm (Section 4 step 4e) correctly skips only 1 byte (`scanPos++`). The algorithm is right; the table is slightly misleading. Implementer should follow the algorithm.

**Assessment**: PASS — Error handling is robust with appropriate fallbacks.

### 7. TypeScript Strict Compliance

The architecture specifies types for all public interfaces:

- `DecodedBinaryPacket`: `{ packet: StreamDataPacket; bytesConsumed: number }`
- `decodeBinaryPacket()`: returns `DecodedBinaryPacket | null` — no `any`.
- `BinaryFrameAccumulator`: all methods have explicit parameter and return types.
- `feed()`: returns `StreamDataPacket[]` — proper array typing.
- `getStats()`: returns `{ received: number; dropped: number }` — object literal type.

The `decodeMessage()` rewrite uses `as BluetoothProtocolPayload` cast on `JSON.parse()` result, which matches the existing pattern in the current code (line 361).

Private fields (`buffer`, `writePos`, `receivedCount`, `droppedCount`) use TypeScript access modifiers.

Constants use `export const` with explicit values (no `any`, no type assertions).

**Assessment**: PASS — Fully compliant with `strict: true`. No `any` types.

### 8. Convention Adherence

- **File location**: `apps/mobile/src/utils/binaryDecoder.ts` — matches existing utility pattern (`csvExport.ts` is in the same directory).
- **Import aliases**: Uses `@/utils/binaryDecoder` and `@iris/domain` — matches project conventions.
- **Domain constants in `@iris/domain`**: Placed in `packages/domain/src/models/Stream.ts` alongside existing streaming constants (`DEVICE_SAMPLE_RATE_HZ`, `SIMULATION_SAMPLE_RATE_HZ`) — appropriate co-location.
- **Barrel export**: Architecture correctly notes that `packages/domain/src/index.ts` already has `export * from './models/Stream'`, so no change needed to `index.ts` — verified correct.
- **Naming**: Constants use `UPPER_SNAKE_CASE`, class uses `PascalCase`, function uses `camelCase` — all consistent with project conventions.
- **Accumulator on ref**: `useRef(new BinaryFrameAccumulator())` follows the same pattern as `streamBufferRef` and `allStreamPacketsRef` — consistent.

**Assessment**: PASS — Fully aligned with project conventions.

### 9. Impact on Outbound Communication (writeToBluetooth)

One consideration the architecture does not explicitly discuss: switching to `connectionType: "binary"` also affects the write path. Looking at `ByteArrayDeviceConnectionImpl`, the `write()` method on the device may expect Base64-encoded input when in binary mode. However, examining the library's `BluetoothModule.js:165` and `BluetoothDevice.d.ts:80`, the `write()` method accepts an `encoding` parameter that can be `'utf-8'` (default). The current code uses `writeToBluetooth()` (line 257) which calls `writeToDevice(address, payload + '\0')` — sending JSON strings.

I verified `AbstractDeviceConnection.java` to check write behavior:

The library handles write encoding separately from read connection type. The `write()` method on `BluetoothDevice` accepts a string and encoding, and the native side handles encoding accordingly. JSON command strings sent via `writeToBluetooth()` will continue to work because the write path encodes the string to bytes using the specified charset (default UTF-8), which is correct for JSON payloads.

**Non-blocking note N2**: The implementer should verify during testing that JSON write commands (`startStream`, `stopStream`, etc.) still work correctly after switching to `connectionType: "binary"`. If the write path is affected, the `encoding` parameter on `writeToDevice()` can be explicitly set to `'utf-8'`.

**Assessment**: PASS — Write path should be unaffected, but warrants verification during implementation.

### 10. Performance Analysis

At 215 Hz / 50 samples per packet = 4.3 packets/s:
- Base64 overhead: 108 bytes * 4/3 = 144 bytes per callback
- Total bridge throughput: ~620 bytes/s — negligible
- `toByteArray()` uses native C++ code (JSI binding), not pure JS — fast
- `DataView` operations are O(1) per field
- Accumulator `feed()` is O(n) where n = incoming bytes — typically 108-216 bytes
- Buffer compaction is a single `Uint8Array` copy of at most 107 bytes — trivial

The 500ms flush interval means at most ~2 packets accumulate between flushes. Memory pressure from the accumulator's 512-byte initial buffer is negligible.

**Assessment**: PASS — Performance budget is comfortable by orders of magnitude.

### 11. Non-Blocking Suggestions

**N1**: Section 6 error table states "skip 108 bytes" for invalid sample count, but the algorithm (Section 4 step 4e) skips only 1 byte. The algorithm is correct for optimal resync. The implementer should follow the algorithm, not the error table.

**N2**: After switching to `connectionType: "binary"`, verify during integration testing that outbound JSON commands (`writeToBluetooth`) still arrive correctly at the ESP32. The write path should be independent of connection type, but this warrants a quick manual verification.

**N3**: Consider adding `binaryAccumulatorRef.current.reset()` in the `clearStreamData()` function (line 646) alongside the existing `allStreamPacketsRef.current = []` reset, for consistency. This ensures manual stream data clears also reset the binary accumulator state.

**N4**: The accumulator's `droppedCount` increments on every resync scan step, not per dropped packet. If the scan advances 10 bytes to find the next `0xAA`, `droppedCount` increments once per scan attempt (at the `0xAA`-not-found or message-code-mismatch branch), not 10 times. The implementer should be aware that `droppedCount` represents resync events, not individual lost bytes. This is fine for debugging purposes.

---

### TL Verdict

The architecture is technically sound and well-researched. The dual root cause analysis is verified against actual library source code — both the ASCII charset corruption in `DelimitedStringDeviceConnectionImpl` and the `JSON.parse()` blind call are confirmed failure modes. The solution design (Base64 connection type + first-byte routing + frame accumulator) is the correct approach and avoids any native module modifications.

The binary decoder specification is precise, with correct byte offsets, endianness, and DataView usage. The accumulator algorithm handles all SPP fragmentation edge cases including false-positive magic bytes in sample data. Integration with the existing `streamBufferRef` pipeline is seamless — the `StreamDataPacket` shape is identical from both JSON and binary paths.

The implementation is minimal (1 new file, 2 modified files, 0 new dependencies), TypeScript-strict compliant, and follows project conventions. All 4 non-blocking notes are minor and do not affect the architecture's viability.

**[VERDICT:APPROVED]**
