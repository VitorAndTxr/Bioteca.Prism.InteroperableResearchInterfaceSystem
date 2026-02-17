# Stream Data Bug Investigation - Testability Assessment

**Date**: 2026-02-17
**Scope**: CSV export empty/missing data + static chart during recording
**Key Files Analyzed**:
- `CaptureScreen.tsx` (createCSVContent, getAllStreamPackets call)
- `BluetoothContext.tsx` (dual buffers: streamData UI, allStreamPacketsRef unbounded)
- `useStreamData.ts` (1 Hz downsampled chart processing)
- `SyncService.ts` (recording metadata + file upload)
- `binaryDecoder.ts` (BinaryFrameAccumulator stateful decoder)
- `SyncService.test.ts` (existing test infrastructure)

---

## 1. CSV Content Function - Unit Testability

### Function: `createCSVContent(packets: StreamDataPacket[], sampleRate: number)`

**Location**: `CaptureScreen.tsx:355-367`

**Current Status**: ✅ **Highly testable in isolation**

#### Test Scenarios (Can be written immediately)

```typescript
describe('createCSVContent', () => {
  it('should return header + newline for single packet', () => {
    const packets = [{ timestamp: 0, values: [100, 200] }];
    const csv = createCSVContent(packets, 215);

    const lines = csv.split('\n');
    expect(lines[0]).toBe('timestamp,value');
    expect(lines).toHaveLength(4); // header + 2 samples + trailing newline
  });

  it('should preserve timestamp accuracy across packet boundaries', () => {
    const packets = [
      { timestamp: 0, values: [100] },
      { timestamp: 1000, values: [200] }
    ];
    const csv = createCSVContent(packets, 1000); // 1ms per sample

    const lines = csv.split('\n').filter(l => l.length > 0);
    expect(lines[1]).toContain('0.00'); // first sample at t=0
    expect(lines[2]).toContain('1000.00'); // second sample at t=1000ms
  });

  it('should handle empty packet array', () => {
    const csv = createCSVContent([], 215);
    expect(csv).toBe('timestamp,value\n');
  });

  it('should format values with consistent decimal places', () => {
    const packets = [{ timestamp: 5.5, values: [123.456, 789.012] }];
    const csv = createCSVContent(packets, 50);

    const lines = csv.split('\n');
    const row1 = lines[1];
    const parts = row1.split(',');
    expect(parseFloat(parts[0])).toBeCloseTo(5.5, 2);
    expect(parseFloat(parts[1])).toBe(123.456);
  });

  it('should calculate correct sample interval for various sample rates', () => {
    const packets = [{ timestamp: 0, values: [1, 2, 3] }];

    // 50 Hz = 20ms per sample
    let csv = createCSVContent(packets, 50);
    let lines = csv.split('\n').filter(l => l.length > 0);
    expect(lines[2]).toMatch(/40.00,2/); // t=0 + 20ms + 20ms

    // 215 Hz ~= 4.65ms per sample
    csv = createCSVContent(packets, 215);
    lines = csv.split('\n').filter(l => l.length > 0);
    expect(lines[2]).toMatch(/9.30,2/);
  });

  it('should handle large packet arrays (1000+ packets)', () => {
    const packets = Array.from({ length: 1000 }, (_, i) => ({
      timestamp: i * 1000,
      values: [100 + i]
    }));

    const csv = createCSVContent(packets, 215);
    const lines = csv.split('\n').filter(l => l.length > 0);
    expect(lines.length).toBe(1001); // header + 1000 data rows
    expect(lines[1]).toContain('0.00');
    expect(lines[1000]).toContain('999000.00');
  });
});
```

#### Why Testable
1. Pure function — no side effects or dependencies
2. Deterministic — same input always yields same output
3. Observable output — string is directly comparable
4. Works with mock data — `StreamDataPacket[]` is a simple interface

#### Diagnostic Value
Testing this function **independently** will confirm whether:
- Timestamp calculations are accurate
- Values are being written at all
- Sample rate conversion is correct
- Large arrays are handled without truncation

---

## 2. Binary Packet Decoder - Unit Testability

### Function: `BinaryFrameAccumulator.feed(data: Uint8Array): StreamDataPacket[]`

**Location**: `binaryDecoder.ts:98-143`

**Current Status**: ✅ **Fully testable with known byte sequences**

#### Test Scenarios (Can be written immediately)

```typescript
describe('BinaryFrameAccumulator', () => {
  let accumulator: BinaryFrameAccumulator;

  beforeEach(() => {
    accumulator = new BinaryFrameAccumulator();
  });

  it('should decode a valid single 108-byte packet', () => {
    // Build a valid packet:
    // [0] = 0xAA (magic)
    // [1] = 0x0D (code)
    // [2-5] = uint32 timestamp (1000ms) = 0xE8030000 LE
    // [6-7] = uint16 sampleCount (50) = 0x3200 LE
    // [8-107] = 50x int16 samples (all 0 for simplicity)
    const packet = new Uint8Array(108);
    packet[0] = 0xAA;
    packet[1] = 0x0D;
    packet[2] = 0xE8; packet[3] = 0x03; packet[4] = 0x00; packet[5] = 0x00; // ts=1000
    packet[6] = 0x32; packet[7] = 0x00; // sample_count=50
    // samples 8-107 already zero

    const packets = accumulator.feed(packet);

    expect(packets).toHaveLength(1);
    expect(packets[0].timestamp).toBe(1000);
    expect(packets[0].values).toHaveLength(50);
    expect(packets[0].values.every(v => v === 0)).toBe(true);
  });

  it('should decode two packets from single feed() call', () => {
    const twoPackets = new Uint8Array(216); // 2 * 108 bytes

    // First packet
    twoPackets[0] = 0xAA; twoPackets[1] = 0x0D;
    twoPackets[2] = 0xE8; twoPackets[3] = 0x03; // ts=1000
    twoPackets[6] = 0x32; twoPackets[7] = 0x00; // count=50

    // Second packet
    twoPackets[108] = 0xAA; twoPackets[109] = 0x0D;
    twoPackets[110] = 0xD0; twoPackets[111] = 0x07; // ts=2000
    twoPackets[114] = 0x32; twoPackets[115] = 0x00; // count=50

    const packets = accumulator.feed(twoPackets);

    expect(packets).toHaveLength(2);
    expect(packets[0].timestamp).toBe(1000);
    expect(packets[1].timestamp).toBe(2000);
  });

  it('should buffer partial packet across multiple feed() calls', () => {
    const half1 = new Uint8Array(54); // First 54 bytes of packet
    half1[0] = 0xAA; half1[1] = 0x0D;
    half1[2] = 0xE8; half1[3] = 0x03;
    half1[6] = 0x32; half1[7] = 0x00;

    const packets1 = accumulator.feed(half1);
    expect(packets1).toHaveLength(0); // No complete packet yet

    const half2 = new Uint8Array(54); // Remaining 54 bytes
    const packets2 = accumulator.feed(half2);
    expect(packets2).toHaveLength(1); // Now complete
    expect(packets2[0].timestamp).toBe(1000);
  });

  it('should resync on corrupted magic byte', () => {
    // Start with garbage then valid packet
    const corrupted = new Uint8Array(216);

    // Garbage (no 0xAA at position 0)
    corrupted[0] = 0xFF; corrupted[1] = 0xFF;

    // Valid packet at position 108
    corrupted[108] = 0xAA; corrupted[109] = 0x0D;
    corrupted[110] = 0xE8; corrupted[111] = 0x03;
    corrupted[114] = 0x32; corrupted[115] = 0x00;
    // ... remaining zeros

    const packets = accumulator.feed(corrupted);

    expect(packets).toHaveLength(1); // Successfully found and decoded one valid packet
    expect(packets[0].timestamp).toBe(1000);
  });

  it('should skip invalid sample count', () => {
    const packet = new Uint8Array(108);
    packet[0] = 0xAA;
    packet[1] = 0x0D;
    packet[2] = 0xE8; packet[3] = 0x03;
    packet[6] = 0xFF; packet[7] = 0xFF; // Wrong sample count (65535 instead of 50)

    const packets = accumulator.feed(packet);
    expect(packets).toHaveLength(0); // Rejected due to validation
  });

  it('should read samples as little-endian int16', () => {
    const packet = new Uint8Array(108);
    packet[0] = 0xAA;
    packet[1] = 0x0D;
    packet[2] = 0xE8; packet[3] = 0x03;
    packet[6] = 0x32; packet[7] = 0x00;

    // Set samples: [100, -100, 1000, -1000]
    // 100 = 0x64 0x00 (LE)
    packet[8] = 0x64; packet[9] = 0x00;
    // -100 = 0x9C 0xFF (LE)
    packet[10] = 0x9C; packet[11] = 0xFF;
    // 1000 = 0xE8 0x03 (LE)
    packet[12] = 0xE8; packet[13] = 0x03;
    // -1000 = 0x18 0xFC (LE)
    packet[14] = 0x18; packet[15] = 0xFC;

    const packets = accumulator.feed(packet);
    expect(packets[0].values[0]).toBe(100);
    expect(packets[0].values[1]).toBe(-100);
    expect(packets[0].values[2]).toBe(1000);
    expect(packets[0].values[3]).toBe(-1000);
  });

  it('should return statistics via getStats()', () => {
    const packet = new Uint8Array(108);
    packet[0] = 0xAA;
    packet[1] = 0x0D;
    packet[6] = 0x32; packet[7] = 0x00;

    accumulator.feed(packet);
    const stats = accumulator.getStats();

    expect(stats.received).toBe(1);
    expect(stats.dropped).toBeGreaterThanOrEqual(0);
  });

  it('should reset state on reset() call', () => {
    const packet = new Uint8Array(108);
    packet[0] = 0xAA; packet[1] = 0x0D;
    packet[6] = 0x32; packet[7] = 0x00;

    accumulator.feed(packet);
    const statsBefore = accumulator.getStats();
    expect(statsBefore.received).toBe(1);

    accumulator.reset();
    const statsAfter = accumulator.getStats();
    expect(statsAfter.received).toBe(0);
  });
});
```

#### Why Testable
1. **Deterministic state machine** — feed() behavior is predictable
2. **Known packet format** — 108 bytes, fixed structure
3. **Observable state** — getStats() exposes internal counters
4. **Byte-level control** — Can construct exact test packets

#### Diagnostic Value
Testing the decoder **independently** will reveal:
- Whether binary packets are being decoded correctly from the device
- If byte-order (endianness) is handled properly
- If the resync logic catches corrupted packets
- If sample counts match expectations (always 50)
- If timestamp and sample values are within expected ranges

---

## 3. Stream Data Processing Pipeline - Integration Testability

### Data Flow: BluetoothContext → StreamData → Chart → CSV

**Current Status**: ⚠️ **Testable but requires careful mocking**

#### Test Scenario: Complete Pipeline

```typescript
describe('Stream Data Pipeline', () => {
  it('should flow: accumulator → context → useStreamData → chart', async () => {
    // 1. Create known binary packets
    const binaryPackets = [
      createMockBinaryPacket(0, [100, 110, 120, 130, 140, 150, 160, 170, 180, 190]),
      createMockBinaryPacket(1000, [200, 210, 220, 230, 240, 250, 260, 270, 280, 290]),
    ];

    // 2. Simulate BluetoothContext receiving data
    const accumulator = new BinaryFrameAccumulator();
    const packets = accumulator.feed(binaryPackets);

    // 3. Process through useStreamData hook
    const processed = processStreamData(packets, DEVICE_SAMPLE_RATE_HZ);

    // 4. Verify chart output
    expect(processed.chartData.length).toBeGreaterThan(0);
    expect(processed.totalSamples).toBe(20); // 2 packets × 10 samples

    // 5. Verify statistics
    expect(processed.avgValue).toBeCloseTo(195, 1); // (100...290)/20
    expect(processed.minValue).toBe(100);
    expect(processed.maxValue).toBe(290);
  });

  it('should produce non-empty CSV from pipeline packets', async () => {
    // Simulate full recording: 10 seconds at 215 Hz = ~2150 samples
    const mockPackets = generateMockPackets(10, 215);

    const csv = createCSVContent(mockPackets, 215);
    const lines = csv.split('\n').filter(l => l.length > 0);

    // Should have header + ~2150 data rows
    expect(lines.length).toBeGreaterThan(2100);
    expect(lines.length).toBeLessThan(2200);

    // First column should be timestamps
    const firstData = lines[1];
    expect(firstData).toMatch(/^\d+(\.\d+)?/);
  });
});

function createMockBinaryPacket(timestamp: number, samples: number[]): Uint8Array {
  // Build 108-byte packet with given timestamp and samples (padded to 50)
  const packet = new Uint8Array(108);
  packet[0] = 0xAA;
  packet[1] = 0x0D;
  // ... (timestamp encoding)
  packet[6] = 0x32; packet[7] = 0x00;
  // ... (sample encoding)
  return packet;
}

function processStreamData(
  packets: StreamDataPacket[],
  sampleRate: number
): ProcessedStreamData {
  // Simulate useStreamData processing
  const flatSamples = packets.flatMap(p => p.values);
  return {
    chartData: flatSamples.map((v, i) => ({ x: i / sampleRate, y: v })),
    totalSamples: flatSamples.length,
    minValue: Math.min(...flatSamples),
    maxValue: Math.max(...flatSamples),
    avgValue: flatSamples.reduce((a, b) => a + b, 0) / flatSamples.length,
    duration: flatSamples.length / sampleRate
  };
}

function generateMockPackets(durationSeconds: number, sampleRate: number): StreamDataPacket[] {
  const totalSamples = durationSeconds * sampleRate;
  const samplesPerPacket = 50;
  const packets: StreamDataPacket[] = [];

  for (let i = 0; i < totalSamples; i += samplesPerPacket) {
    const values: number[] = [];
    for (let j = 0; j < samplesPerPacket && (i + j) < totalSamples; j++) {
      values.push(Math.sin((i + j) / 100) * 300); // Sinusoidal mock data
    }
    packets.push({
      timestamp: (i / sampleRate) * 1000,
      values
    });
  }

  return packets;
}
```

#### Why Integration-Testable
1. Each layer (decoder → context → hook → CSV) has clear inputs/outputs
2. Mock data can be controlled at each layer
3. Output observable at multiple checkpoints

---

## 4. Existing Test Infrastructure

**Location**: `IRIS/apps/mobile/src/services/SyncService.test.ts`

**Status**: ✅ **Vitest already configured**

### What Exists
- Mock strategy for `middleware.invoke()`, `expo-file-system`
- Mock factories for repositories
- Comprehensive error handling tests (permanent vs transient)
- Retry logic verification

### Can Be Extended With
- CSV generation tests (same approach)
- Binary decoder tests (same approach)
- Stream data accumulation tests

---

## 5. Test Coverage Matrix

| Component | Unit Testable | Integration Testable | Notes |
|-----------|---|---|---|
| `createCSVContent()` | ✅ Yes | ✅ Yes | Pure function, ideal unit test |
| `BinaryFrameAccumulator` | ✅ Yes | ✅ Yes | Stateful but deterministic |
| `useStreamData()` | ⚠️ Hook | ✅ Yes | Extract logic to helper |
| `BluetoothContext.getAllStreamPackets()` | ⚠️ Context | ✅ Yes | Mock via provider |
| `SyncService` | ✅ Yes | ✅ Yes | Already tested, extend with CSV scenarios |

---

## 6. Diagnostic Instrumentation Recommendations

### Add to `CaptureScreen.tsx`

```typescript
// On line 204 (before createCSVContent call)
console.log('[CaptureScreen] getAllStreamPackets() count:', dataToSave.length);
console.log('[CaptureScreen] Total samples in packets:',
  dataToSave.reduce((sum, p) => sum + p.values.length, 0));

if (dataToSave.length > 0) {
  console.log('[CaptureScreen] First packet:', {
    timestamp: dataToSave[0].timestamp,
    sampleCount: dataToSave[0].values.length,
    firstValue: dataToSave[0].values[0]
  });
  console.log('[CaptureScreen] Last packet:', {
    timestamp: dataToSave[dataToSave.length - 1].timestamp,
    sampleCount: dataToSave[dataToSave.length - 1].values.length,
    lastValue: dataToSave[dataToSave.length - 1].values[0]
  });
}

// On line 208 (after createCSVContent call)
const csvLines = csvContent.split('\n').filter(l => l.length > 0);
console.log('[CaptureScreen] CSV generated:', {
  lines: csvLines.length,
  headerOk: csvLines[0] === 'timestamp,value',
  firstRow: csvLines[1],
  lastRow: csvLines[csvLines.length - 1]
});
```

### Add to `BluetoothContext.tsx`

```typescript
// Around line 104 (in flushStreamBuffer)
console.log('[BluetoothContext] Flushing buffer:', {
  uiPackets: streamBufferRef.current.length,
  accumulatedPackets: allStreamPacketsRef.current.length,
  totalSamples: allStreamPacketsRef.current.reduce((s, p) => s + p.values.length, 0)
});

// Around line 381 (in decodeMessage, after binaryAccumulatorRef.feed)
const decodedPackets = binaryAccumulatorRef.current.feed(bytes);
if (decodedPackets.length > 0) {
  console.log('[BluetoothContext] Binary packets decoded:', {
    count: decodedPackets.length,
    accumulatorStats: binaryAccumulatorRef.current.getStats()
  });
}
```

### Add to `useStreamData.ts`

```typescript
// In processData callback, after calculating statistics
console.log('[useStreamData] Processed data:', {
  totalSamples: flatSamples.length,
  chartPoints: chartData.length,
  timeWindow: `${windowed.length / sampleRate}s`,
  min: minValue,
  max: maxValue,
  avg: avgValue.toFixed(1)
});
```

---

## 7. Recommended Test Writing Order

### Phase 1: Foundation (1-2 hours)
1. ✅ Write `createCSVContent()` unit tests (5-7 tests)
2. ✅ Write `BinaryFrameAccumulator` unit tests (8-10 tests)
3. ✅ Verify both pass with known expected values

### Phase 2: Integration (2-3 hours)
4. Write pipeline integration test (binary → CSV)
5. Test with known 10-second recording mock
6. Verify chart data matches CSV data

### Phase 3: Reproduction (1-2 hours)
7. Add diagnostic console.log statements above
8. Run real device recording → observe console output
9. Compare CSV file bytes to console-logged packet counts

---

## 8. Known Limitations & Assumptions

### No Existing Tests For
- CSV file writing to disk (`expo-file-system`)
- Chart rendering via `SEMGChart` component
- Real Bluetooth packet arrival timing

### Testable Independently
- CSV generation logic
- Binary packet decoding
- Stream data statistics calculation
- SyncService retry logic

### Requires Mocking
- React hooks (`useBluetoothContext`)
- Native modules (`expo-file-system`, `react-native-bluetooth-classic`)
- Bluetooth physical layer

---

## 9. Symptom-to-Test Mapping

| Symptom | Root Cause Hypothesis | Test to Confirm | Expected Finding |
|---------|---|---|---|
| CSV file empty | `getAllStreamPackets()` returns zero packets | `test("should return buffered packets on stop")` | If empty, packets aren't being accumulated |
| CSV has header only | `dataToSave` has length 0 | Add `console.log(dataToSave.length)` before CSV write | If 0, check `allStreamPacketsRef` in context |
| Chart static | `streamData` state never updates | `test("useStreamData should update on new packets")` | If chart data empty, packets aren't flowing to UI |
| Chart has data but CSV empty | Timing issue between UI update and save | Check if `getAllStreamPackets()` flushes buffer | May need explicit flush before save |
| Sample count mismatch | Packet loss in binary decoder | `test("should decode all binary packets from raw bytes")` | Count decoded packets vs expectations |

---

## 10. Summary & Next Steps

### Testability Assessment: ✅ **HIGH**

The stream data pipeline is **well-suited for unit and integration testing**:
- Pure functions (`createCSVContent`) → unit tests
- Stateful decoder → deterministic tests with known byte sequences
- Pipeline → integration tests with controlled mocks

### Immediate Actions
1. **Extract test-helper** — Move `createCSVContent` to separate utility file for easier testing
2. **Write CSV tests** — 5-7 tests covering the format and calculations
3. **Write decoder tests** — 8-10 tests with real byte sequences from ESP32 spec
4. **Add diagnostics** — Console.log statements to trace packet flow during dev
5. **Run diagnostics** — Use console output to pinpoint where packets are lost

### Why This Matters
Testing at the **component boundary** (CSV generation, binary decoding) will quickly isolate:
- **Data loss before save** → CSV tests + diagnostics
- **Data lost in decoder** → Decoder tests + byte inspection
- **UI not updating** → Hook tests + context mocks

Once tests pass, you can trust the individual layers and focus on integration between them.

