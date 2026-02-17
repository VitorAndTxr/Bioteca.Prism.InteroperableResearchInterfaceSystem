# Code Review — Bluetooth Binary Message Decoding

> **Reviewer**: Tech Lead
> **Date**: 2026-02-17
> **Scope**: BT binary fix — binary packet detection and parsing on shared SPP channel
> **Architecture Reference**: `docs/ARCHITECTURE_BT_BINARY.md`
> **Convention Reference**: `IRIS/CLAUDE.md`

---

## 1. Summary

The implementation fixes the root-cause issue (connection type mismatch + blind `JSON.parse()`) that was silently dropping every binary sEMG packet from firmware v3.1+. The changeset comprises **3 files**: 1 modified domain file, 1 new utility file, and 1 modified context file — exactly as specified in the architecture document.

The implementation is clean and well-structured. The `BinaryFrameAccumulator` correctly handles SPP boundary fragmentation, the `decodeMessage()` routing logic faithfully follows the architecture design, and the integration points (accumulator reset on `startStream()` and `disconnect()`) are correctly placed. TypeScript strict compliance is maintained in the new and modified code.

Zero blocking issues. Zero must-fix issues. Four non-blocking suggestions.

---

## 2. File-by-File Review

### 2.1 `packages/domain/src/models/Stream.ts` (MODIFIED)

| Checklist Item | Status | Notes |
|----------------|--------|-------|
| `BINARY_PACKET_MAGIC = 0xAA` | PASS | Line 23 — matches ESP32 `StreamingProtocol.h` |
| `BINARY_PACKET_CODE = 0x0D` | PASS | Line 26 — decimal 13, matches firmware |
| `BINARY_PACKET_HEADER_SIZE = 8` | PASS | Line 29 — 1+1+4+2 = 8 bytes, correct |
| `BINARY_PACKET_SAMPLES_PER_PACKET = 50` | PASS | Line 32 — matches firmware |
| `BINARY_PACKET_TOTAL_SIZE = 108` | PASS | Line 35 — 8 + 50*2 = 108, correct |
| Placed after `SIMULATION_SAMPLE_RATE_HZ` | PASS | Line 19 block separator comment |
| Existing constants and types untouched | PASS | Lines 1-17 unchanged |
| JSDoc comments explain "why" (firmware mirror) | PASS | Each constant has comment referencing `StreamingProtocol.h` |
| No `any` types introduced | PASS | Constants only |
| Exported via existing barrel (`index.ts`) | PASS | Architecture confirmed no `index.ts` changes needed |

**Assessment**: Minimal, correct, compliant. The comment "Mirror ESP32 StreamingProtocol.h definitions" explicitly documents the cross-component dependency, which is important for future maintainers.

---

### 2.2 `apps/mobile/src/utils/binaryDecoder.ts` (NEW)

| Checklist Item | Status | Notes |
|----------------|--------|-------|
| Imports from `@iris/domain` only | PASS | Lines 13-19 — correct workspace package import |
| `BINARY_PACKET_HEADER_SIZE` not imported | NOTE | See suggestion S1 below |
| `DecodedBinaryPacket` interface — module-private | PASS | Not exported, not in `@iris/domain` |
| `decodeBinaryPacket()` — module-private function | PASS | Not exported, consumed only by accumulator |
| Length check before accessing bytes | PASS | Line 37 — guards `buffer.length - offset < BINARY_PACKET_TOTAL_SIZE` |
| Magic byte check | PASS | Line 41 |
| Message code check | PASS | Line 45 |
| `DataView` with `buffer.byteOffset + offset` | PASS | Line 50 — correctly handles non-zero `byteOffset` on sliced Uint8Array views |
| `getUint32(2, true)` for timestamp (LE) | PASS | Line 52 |
| `getUint16(6, true)` for sample count (LE) | PASS | Line 53 |
| Sample count validated against constant | PASS | Line 55 — warns on mismatch, returns null |
| `getInt16(8 + i * 2, true)` for samples (LE) | PASS | Lines 61-63 |
| Returns `{ packet, bytesConsumed: 108 }` | PASS | Lines 66-68 |
| `BinaryFrameAccumulator` exported | PASS | Line 80 — only export from this file |
| `buffer: Uint8Array` private field | PASS | Line 81 |
| `writePos: number` tracks filled bytes | PASS | Line 82 |
| `receivedCount`, `droppedCount` debug counters | PASS | Lines 83-84 |
| Constructor default capacity 512 | PASS | Line 86 — matches architecture spec |
| `feed()` appends then scans | PASS | Lines 99-143 — correct order |
| While loop condition `>= BINARY_PACKET_TOTAL_SIZE` | PASS | Line 104 — stops when not enough bytes remain |
| Not-at-magic scan forward: `findNextMagic(scanPos + 1)` | PASS | Line 107 — `+1` avoids infinite loop |
| No magic found: `scanPos = writePos - 1` (preserve last byte) | PASS | Lines 110-114 — matches architecture spec |
| Wrong message code: advance one byte | PASS | Lines 120-124 |
| Validation failure: advance one byte | PASS | Lines 133-136 |
| `compact()` called after scan loop | PASS | Line 140 |
| `compact()` uses `copyWithin` (zero allocation) | PASS | Line 177 — correct, avoids `slice()` allocation |
| `reset()` zeroes `writePos` and counters | PASS | Lines 146-150 |
| `getStats()` returns `{ received, dropped }` | PASS | Lines 153-155 |
| `append()` doubles capacity on overflow | PASS | Lines 160-167 — correct growth strategy |
| `append()` uses `grown.set()` to copy existing data | PASS | Line 166 |
| `findNextMagic()` scans up to `writePos` | PASS | Line 183 — does not scan into unwritten region |
| No `any` types | PASS | All types explicit |
| File header comment documents packet structure | PASS | Lines 1-11 — byte offsets, types, value ranges |

**Assessment**: The decoder is correct and follows the architecture specification closely. The accumulation algorithm, growth strategy, compaction, and resync logic are all faithfully implemented. `DataView` usage with `byteOffset` handling is a subtle correctness detail that is correctly addressed (a plain `new DataView(buffer.buffer)` would have failed for sliced arrays). The file header comment doubles as a packet format reference, which is valuable for future developers working across the firmware boundary.

---

### 2.3 `apps/mobile/src/context/BluetoothContext.tsx` (MODIFIED)

| Checklist Item | Status | Notes |
|----------------|--------|-------|
| `toByteArray` imported from `react-native-quick-base64` | PASS | Line 5 |
| `BinaryFrameAccumulator` imported from `@/utils/binaryDecoder` | PASS | Line 25 |
| `BINARY_PACKET_MAGIC` imported from `@iris/domain` | PASS | Line 23 |
| `binaryAccumulatorRef` declared with `useRef` | PASS | Line 78 |
| `connectionType: 'binary'` in `connectToDevice()` | PASS | Lines 326-329 — the critical change |
| `binaryAccumulatorRef.current.reset()` in `startStream()` | PASS | Line 544 — resets before new stream |
| `binaryAccumulatorRef.current.reset()` in `disconnect()` | PASS | Line 499 — resets on disconnect |
| `decodeMessage()` decodes Base64 with `toByteArray()` | PASS | Line 369 |
| Empty bytes guard (`bytes.length === 0`) | PASS | Line 371 |
| Binary routing: `bytes[0] === BINARY_PACKET_MAGIC` | PASS | Line 374 |
| Binary path: feeds accumulator, pushes packets to buffer | PASS | Lines 375-380 |
| JSON routing: `bytes[0] === 0x7B` | PASS | Line 383 |
| JSON path: `TextDecoder().decode(bytes)` then `JSON.parse()` | PASS | Lines 385-386 |
| Existing `switch(messageBody.cd)` cases unchanged | PASS | Lines 388-463 |
| Legacy JSON StreamData case preserved (firmware v2.x / sim) | PASS | Lines 442-450 |
| Fragment path: feeds accumulator | PASS | Lines 469-472 |
| Outer try/catch wraps all paths | PASS | Lines 473-475 |
| No `any` types introduced in new code | PASS | New code is type-safe |
| Pre-existing `any` in disconnect handler | NOTE | Line 344 — pre-existing, not introduced by this PR |

**Assessment**: The context integration is minimal and surgical. The three integration points (import, ref declaration, connection options) are exactly as specified. The `decodeMessage()` rewrite correctly handles all three cases from the architecture: binary packets, JSON messages, and continuation fragments. The outer try/catch provides the error boundary specified in the architecture's error handling table.

---

### 2.4 Architecture Compliance

| Checklist Item | Status | Notes |
|----------------|--------|-------|
| Total files: 1 modified domain, 1 new util, 1 modified context | PASS | Exactly as specified in section 8 |
| D1: `connectionType: "binary"` used | PASS | BluetoothContext.tsx:328 |
| D2: `react-native-quick-base64` `toByteArray()` used | PASS | BluetoothContext.tsx:369 |
| D3: JSON also arrives as Base64, decoded before routing | PASS | BluetoothContext.tsx:385 |
| D4: Accumulator on a ref (survives re-renders) | PASS | BluetoothContext.tsx:78 |
| D5: Batch-flush pipeline (`streamBufferRef`, `flushStreamBuffer`) unchanged | PASS | Verified — no changes to flush mechanism |
| Packet format: 108 bytes, LE endianness, all fields correct | PASS | binaryDecoder.ts:37-68 |
| Error categories handled as specified | PASS | All 6 categories from architecture table covered |
| Resync strategy: scan forward for `0xAA` | PASS | binaryDecoder.ts:107-117 |
| `StreamDataPacket` shape unchanged (same as JSON path) | PASS | Both paths produce `{ timestamp, values }` |
| `packages/domain/src/index.ts` NOT modified | PASS | Architecture confirmed auto-export via existing barrel |
| No visualization/CSV component changes | PASS | Confirmed — downstream pipeline untouched |

---

## 3. Blocking Issues

**None.**

---

## 4. Must-Fix Issues

**None.**

---

## 5. Non-Blocking Suggestions

### S1: Use `BINARY_PACKET_HEADER_SIZE` constant for sample loop offset (Low)

**File**: `apps/mobile/src/utils/binaryDecoder.ts:61`

The sample parsing loop uses the literal `8` as the offset to the first sample:

```typescript
values.push(view.getInt16(8 + i * 2, true));
```

The constant `BINARY_PACKET_HEADER_SIZE = 8` is defined in `@iris/domain` specifically for this purpose but is not imported. Importing and using it makes the firmware structure self-documenting and reduces the risk of a silent bug if the header layout ever changes:

```typescript
import {
    StreamDataPacket,
    BINARY_PACKET_MAGIC,
    BINARY_PACKET_CODE,
    BINARY_PACKET_HEADER_SIZE,   // add this
    BINARY_PACKET_SAMPLES_PER_PACKET,
    BINARY_PACKET_TOTAL_SIZE,
} from '@iris/domain';

// ...
values.push(view.getInt16(BINARY_PACKET_HEADER_SIZE + i * 2, true));
```

### S2: `TextDecoder` allocation per JSON message (Low)

**File**: `apps/mobile/src/context/BluetoothContext.tsx:385`

```typescript
const text = new TextDecoder().decode(bytes);
```

A new `TextDecoder` instance is created for every JSON control message. JSON messages are infrequent (one per command/response), so there is no measurable performance impact. However, storing a single `TextDecoder` in a `useRef` or module-level constant would be idiomatic:

```typescript
// Module-level (outside component):
const textDecoder = new TextDecoder();

// In decodeMessage():
const text = textDecoder.decode(bytes);
```

`TextDecoder` instances are stateless for UTF-8 decoding, so reuse is safe.

### S3: `droppedCount` semantics vs. resync events (Informational)

**File**: `apps/mobile/src/utils/binaryDecoder.ts:111`

The `droppedCount` counter is incremented once per resync event (i.e., "I had to skip forward to find the next magic byte"), not once per dropped byte or per dropped packet. In the no-magic-found branch, many bytes may be discarded but `droppedCount` increments by 1. This is acceptable for a debug counter, but the `getStats()` return type and JSDoc comment could make this explicit:

```typescript
/** Returns debug counters.
 * received = successfully decoded packets.
 * dropped = resync events (not byte count — one event may skip multiple bytes).
 */
getStats(): { received: number; dropped: number }
```

### S4: Pre-existing `any` in disconnect handler (Informational)

**File**: `apps/mobile/src/context/BluetoothContext.tsx:344`

```typescript
const onDisconnectListener = RNBluetoothClassic.onDeviceDisconnected((deviceDisconectEvent: any) => {
```

This `any` predates this PR and is not introduced by the binary fix. The library's TypeScript types for the disconnect event callback may not expose a typed event interface. This is worth fixing in a separate cleanup task: check the `react-native-bluetooth-classic` type definitions and replace `any` with the correct event type if available.

---

## 6. Validation Suggestions Status

| Architecture Decision | Status | Implementation |
|-----------------------|--------|----------------|
| D1: `connectionType: "binary"` | IMPLEMENTED | `connectBluetooth()` line 328 |
| D2: `react-native-quick-base64` `toByteArray()` | IMPLEMENTED | `decodeMessage()` line 369 |
| D3: JSON also Base64-decoded before routing | IMPLEMENTED | `decodeMessage()` lines 383-465 |
| D4: Accumulator on a `useRef` | IMPLEMENTED | Line 78 |
| D5: Existing flush pipeline unchanged | IMPLEMENTED | Verified — no pipeline changes |

---

## 7. Metrics

| Metric | Value |
|--------|-------|
| Files created | 1 (`binaryDecoder.ts`) |
| Files modified | 2 (`Stream.ts`, `BluetoothContext.tsx`) |
| Files deleted | 0 |
| New lines of code | ~190 (binaryDecoder.ts) |
| Lines changed (BluetoothContext.tsx) | ~25 (imports + ref + options + decodeMessage rewrite) |
| Lines changed (Stream.ts) | ~17 (5 constants + comments) |
| Architecture compliance | 100% |
| Convention compliance | 100% |
| TypeScript strict compliance | Yes (new code) |
| Import alias compliance (`@/`) | Yes |
| `any` types introduced | 0 (pre-existing `any` at line 344 not introduced by this PR) |
| Root cause fixed | Yes (`connectionType: "binary"` + Base64 routing) |
| SPP fragmentation handled | Yes (`BinaryFrameAccumulator`) |
| Existing JSON pipeline regression | None |

---

## 8. Gate Verdict

### [GATE:PASS]

The implementation correctly and completely resolves both root causes identified in the architecture document: the connection type mismatch (switching to `"binary"`) and the blind `JSON.parse()` (replaced with Base64 decode + first-byte routing). The `BinaryFrameAccumulator` faithfully implements the specified algorithm, including the resync strategy, buffer growth, and compaction. All 3 integration points in `BluetoothContext.tsx` (accumulator ref, connection options, decodeMessage rewrite) are correctly placed.

Zero blocking issues. Zero must-fix issues. The four non-blocking suggestions are minor improvements to naming clarity, constant reuse, and a pre-existing type annotation issue. The implementation may ship as-is.
