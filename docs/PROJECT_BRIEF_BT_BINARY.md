# Project Brief: Bluetooth Binary Message Decoding

**Date**: 2026-02-17
**Author**: PM (Product Manager)
**Status**: DRAFT

---

## 1. Business Objective

The IRIS mobile app communicates with the ESP32 sEMG/FES device over a Bluetooth SPP channel that carries two distinct data formats: JSON for command/control messages and binary for real-time sEMG streaming data. Since firmware v3.0, the device transmits sEMG stream packets exclusively in a 108-byte binary format (magic byte `0xAA`, message code `0x0D`, 50 int16_t samples per packet at 215 Hz). The mobile app's `BluetoothContext.tsx`, however, passes all incoming data through `JSON.parse()`, which crashes on non-JSON binary content with `SyntaxError: JSON Parse error`. This means every binary sEMG packet is silently dropped, and the real-time signal visualization pipeline never receives actual device data during streaming sessions.

This initiative adds binary protocol support alongside the existing JSON decoder so that the full sEMG streaming pipeline works end-to-end with real hardware, enabling researchers to capture and visualize live biosignal data from the ESP32 device.

---

## 2. Scope

### 2.1 In Scope

**Binary Detection in `decodeMessage()`** (`apps/mobile/src/context/BluetoothContext.tsx`):
- Before attempting `JSON.parse()`, inspect the first byte of the incoming data for the magic byte `0xAA`
- If the data starts with `0xAA`, route to a binary decoder path; otherwise proceed with the existing JSON path
- `react-native-bluetooth-classic` delivers data as strings; the implementation must convert the string representation to raw bytes (e.g., using a `TextEncoder`-like approach or iterating char codes) to inspect and parse binary content

**Binary Packet Decoder**:
- Parse the 108-byte binary packet structure defined in the ESP32 firmware (`StreamingProtocol.h`):
  - Header (8 bytes): magic `0xAA` (uint8), code `0x0D` (uint8), timestamp (uint32 LE), sample_count (uint16 LE)
  - Data (100 bytes): 50 x int16_t samples, little-endian
- Validate magic byte, message code, and sample count
- Convert parsed data into a `StreamDataPacket` (`{ timestamp: number, values: number[] }`) and push to `streamBufferRef.current`, matching the existing batch-and-flush pipeline

**Buffer Accumulation / Framing**:
- Bluetooth SPP does not guarantee packet boundaries — a single `onDataReceived` callback may deliver a partial packet, exactly one packet, or multiple packets concatenated
- Implement a byte accumulation buffer that collects incoming data, scans for the `0xAA` magic byte, waits until at least 108 bytes are available from that marker, and then extracts complete packets
- After extracting a packet, any remaining bytes stay in the buffer for the next callback invocation
- Any bytes before a valid `0xAA` start marker that do not form valid JSON should be discarded (framing recovery)

**Routing Decoded Data**:
- Decoded binary packets produce `StreamDataPacket` objects that are pushed into the same `streamBufferRef` used by the existing batch-flush mechanism (the `flushStreamBuffer()` callback every 500 ms)
- No changes needed to the visualization pipeline, CSV export, or `allStreamPacketsRef` — they already consume `StreamDataPacket[]`

**Error Handling and Recovery**:
- If a binary packet fails validation (wrong magic byte after framing, unexpected message code, sample count != 50), discard the packet and log a warning
- If `JSON.parse()` fails on data that is NOT binary (does not start with `0xAA`), log the error but do not crash the app — this matches existing behavior
- Add a binary packet counter (received / dropped) to aid debugging

**Domain Constants** (`packages/domain/src/models/Stream.ts`):
- Add binary protocol constants: `BINARY_PACKET_MAGIC`, `BINARY_PACKET_CODE`, `BINARY_PACKET_HEADER_SIZE`, `BINARY_PACKET_SAMPLES_PER_PACKET`, `BINARY_PACKET_TOTAL_SIZE`
- These mirror the ESP32 `StreamingProtocol.h` definitions and serve as the single source of truth on the TypeScript side

**Utility Module** (new file: `apps/mobile/src/utils/binaryDecoder.ts`):
- Extract the binary decoding logic into a focused utility rather than inlining it in `BluetoothContext.tsx`
- Exports: `decodeBinaryPacket(buffer: Uint8Array, offset: number): { packet: StreamDataPacket; bytesConsumed: number } | null`
- Exports: `BinaryFrameAccumulator` class managing the byte buffer across callbacks

### 2.2 Out of Scope

- Changes to the ESP32 firmware — the binary protocol is stable at v3.1+ and does not need modification
- Backend (`InteroperableResearchNode`) changes — sEMG data ingestion is handled separately via `SyncService`
- Desktop app changes — the desktop app does not connect to the device via Bluetooth
- Changes to the existing JSON command/control protocol — all JSON messages continue to work as-is
- Simulation mode changes — the simulated streaming path (which generates fake `StreamDataPacket` objects) remains unchanged
- Signal processing / filtering on the mobile side — the ESP32 already applies Butterworth filtering before transmission
- `StreamConfiguration.rate` and `StreamConfiguration.type` changes — firmware v3.1+ uses a fixed 215 Hz filtered configuration; these fields remain informational
- Performance optimization of the chart rendering pipeline (separate concern)
- Bluetooth reconnection improvements (separate initiative)

---

## 3. Success Criteria

1. **Binary packets are decoded without errors**: When the ESP32 sends binary sEMG packets (code 13, 108 bytes), the mobile app decodes them into `StreamDataPacket` objects with correct timestamp and 50 sample values.
2. **JSON messages continue to work**: All existing JSON command/control messages (codes 1-12, 14) parse and route correctly, with no regressions.
3. **Real-time visualization receives data**: The decoded `StreamDataPacket` objects appear in `streamData` state and render in the chart component during a live streaming session.
4. **CSV export captures binary data**: `allStreamPacketsRef` accumulates packets from the binary decoder, and `exportStreamData()` produces a valid CSV file with the captured sEMG values.
5. **Partial packet handling**: If SPP delivers fragments, the accumulator buffers them and correctly extracts complete packets once enough bytes arrive.
6. **No silent data loss**: Binary packets that fail validation are logged with a warning (not silently swallowed), and a dropped-packet counter is available for debugging.
7. **Zero console errors during normal streaming**: The `SyntaxError: JSON Parse error` currently logged on every binary packet is eliminated.

---

## 4. Constraints

1. **`react-native-bluetooth-classic` data format**: The library delivers `onDataReceived` callbacks with a `data: string` property. Binary data arrives encoded as a string (likely Latin-1/ISO-8859-1), meaning each character's char code maps to one byte. The decoder must handle this encoding correctly.
2. **Single SPP channel**: Both JSON and binary data arrive on the same Bluetooth SPP connection. The decoder must reliably distinguish between the two protocols in real-time.
3. **Performance budget**: At 215 Hz / 50 samples per packet, approximately 4.3 packets arrive per second. The decoder must process each packet well under 50 ms to avoid blocking the JavaScript thread or causing data loss.
4. **TypeScript strict mode**: All new code must satisfy `strict: true`. No `any` types.
5. **No native module changes**: The solution must work entirely in the JavaScript/TypeScript layer without modifying the `react-native-bluetooth-classic` native bridge.
6. **Existing batch-flush pipeline**: The decoded packets must integrate with the existing `streamBufferRef` / `flushStreamBuffer()` mechanism (500 ms interval). No changes to the batch interval or UI update strategy.

---

## 5. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | `react-native-bluetooth-classic` may deliver binary data with string encoding that corrupts byte values above 0x7F | Medium | High | Test with real device; if char codes are garbled, investigate the library's `readFrom` encoding options or use base64 read mode |
| R2 | SPP fragmentation produces very small chunks that increase buffer management complexity | Medium | Medium | Accumulator design handles arbitrary chunk sizes; test with real device to observe actual fragmentation patterns |
| R3 | JavaScript `DataView` / `Uint8Array` performance on React Native's Hermes engine may differ from V8 | Low | Medium | Profile on target device; 4.3 packets/s at 108 bytes is very light workload |
| R4 | Mixed binary+JSON data in a single callback invocation (e.g., JSON ACK followed immediately by binary packet) | Medium | Medium | Accumulator scans for `0xAA` start markers and handles JSON data by attempting `JSON.parse()` on pre-marker bytes |
| R5 | Existing code references the `StreamData` case (code 13) in the JSON switch for JSON-format streaming (v2.x) — enabling binary decoding may break mock/simulation paths that still send JSON code 13 | Low | Low | The JSON switch case 13 handler remains; binary detection happens first and only activates if the raw data starts with `0xAA` |

---

## 6. Affected Components

| Component | File | Change |
|-----------|------|--------|
| BluetoothContext | `apps/mobile/src/context/BluetoothContext.tsx` | Modify `decodeMessage()` to detect binary vs JSON, call binary decoder, integrate with `streamBufferRef` |
| Stream domain types | `packages/domain/src/models/Stream.ts` | Add binary protocol constants (magic byte, header size, packet size, samples per packet) |
| Binary decoder (NEW) | `apps/mobile/src/utils/binaryDecoder.ts` | New utility: `decodeBinaryPacket()`, `BinaryFrameAccumulator` class |
| Domain barrel export | `packages/domain/src/index.ts` | Export new binary constants (if not already re-exported from Stream.ts) |

---

## 7. Client Decisions Required

1. **Encoding verification**: The exact string encoding used by `react-native-bluetooth-classic` for binary data must be confirmed with real device testing. If the library truncates or modifies bytes > 0x7F, an alternative read mode (base64) may be needed. **Decision owner**: Tech Lead, during implementation.
2. **Dropped packet logging level**: Should dropped/invalid binary packets log a visible console warning or be silently counted? **Recommendation**: Log at `console.warn` level during development; the logging can be reduced to a counter-only approach in a future performance pass.

---

## 8. Implementation Notes

The ESP32 firmware (`StreamingProtocol.h`) defines the binary packet structure as follows:

```
Offset  Size    Field           Description
0       1       magic           0xAA (packet start marker)
1       1       message_code    0x0D (decimal 13, StreamData)
2       4       timestamp       uint32_t LE, millis() since stream start
6       2       sample_count    uint16_t LE, always 50
8       100     samples[50]     int16_t LE, sEMG values (-4096 to +4096)
---
Total: 108 bytes
```

Value conversion: `millivolts = sample_int16` (1 LSB = 1 mV). The values can be used directly as numbers in `StreamDataPacket.values[]`.

The packet rate is ~4.3 packets/second (215 Hz / 50 samples), with ~232 ms between packets. At 9600 baud, this consumes approximately 48% of available bandwidth.

---

## 9. Dependencies

- **ESP32 firmware v3.1+**: The binary streaming protocol must be running on the device. Firmware versions prior to v3.0 sent JSON-format stream data (code 13) which the current code already handles.
- **`react-native-bluetooth-classic`**: No version change required; the existing library version supports `onDataReceived` callbacks.
- **`@iris/domain` package**: New constants added here must be built before the mobile app can reference them.

---

## 10. Relationship to Prior Work

This initiative directly unblocks the sEMG real-time streaming feature that was built in the **Mobile Endpoint Integration** phase (Phase 9). That phase implemented the `SyncService` mock-to-real swap for sessions, recordings, and annotations, but streaming data from the real device was never received because the binary decoder was missing. The visualization pipeline (`streamData`, `flushStreamBuffer`, `allStreamPacketsRef`, chart rendering) is already in place and functional with simulated data — this brief addresses the last-mile gap between the ESP32 hardware and the existing pipeline.
