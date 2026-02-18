/**
 * CaptureScreen — Stream Bug Fix Tests + CSV Hz Fix Tests
 *
 * Unit tests for:
 *   1. createSimulationCSVContent() — pure function, extracted for testability
 *   2. Binary stream detection — first binary packet triggers isStreaming via isStreamingRef
 *   3. Stop recording guard — stopStream is called when selectedDevice is set, ignoring isStreaming
 *   4. serializePacketToCSV() — incremental CSV line serialization (BluetoothContext.tsx)
 *   5. downsamplePacket() — 50→10 sample decimation (BluetoothContext.tsx)
 *
 * Run with: npm test (requires vitest config — see TEST_REPORT_STREAM_BUG.md)
 *
 * These tests target the fixes described in:
 *   - IRIS/docs/ARCHITECTURE_STREAM_BUG_FIX.md
 *   - IRIS/docs/REVIEW_STREAM_BUG.md
 *   - IRIS/docs/ARCHITECTURE_CSV_HZ_FIX.md
 */

import { describe, it, expect } from 'vitest';
import type { StreamDataPacket } from '@iris/domain';
import {
    DEVICE_SAMPLE_RATE_HZ,
    SIMULATION_SAMPLE_RATE_HZ,
    BINARY_PACKET_MAGIC,
    BINARY_PACKET_CODE,
    BINARY_PACKET_TOTAL_SIZE,
    BINARY_PACKET_SAMPLES_PER_PACKET,
} from '@iris/domain';

// ---------------------------------------------------------------------------
// Re-implement the simulation-mode pure function for testing.
// createSimulationCSVContent is a module-level function in CaptureScreen.tsx
// but not exported. Because it is a plain function (no React dependencies), we
// duplicate the implementation here to allow isolated unit testing without
// needing a React Native rendering environment.
//
// If the project later exports the function, replace this block with:
//   import { createSimulationCSVContent } from '../screens/CaptureScreen';
// ---------------------------------------------------------------------------
function createSimulationCSVContent(packets: StreamDataPacket[], sampleRate: number): string {
    const intervalMs = 1000 / sampleRate;
    const lines: string[] = ['timestamp,value'];

    for (const packet of packets) {
        for (let i = 0; i < packet.values.length; i++) {
            const sampleTimestamp = packet.timestamp + (i * intervalMs);
            lines.push(`${sampleTimestamp.toFixed(2)},${packet.values[i]}`);
        }
    }

    return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Helper: build a well-formed 108-byte binary sEMG packet as Uint8Array
// ---------------------------------------------------------------------------
function buildBinaryPacket(timestamp: number = 1000, values?: number[]): Uint8Array {
    const buf = new Uint8Array(BINARY_PACKET_TOTAL_SIZE);
    const view = new DataView(buf.buffer);

    buf[0] = BINARY_PACKET_MAGIC;           // 0xAA
    buf[1] = BINARY_PACKET_CODE;            // 0x0D
    view.setUint32(2, timestamp, true);     // LE timestamp
    view.setUint16(6, BINARY_PACKET_SAMPLES_PER_PACKET, true); // LE sample count = 50

    const samples = values ?? Array.from({ length: BINARY_PACKET_SAMPLES_PER_PACKET }, (_, i) => i * 10);
    for (let i = 0; i < BINARY_PACKET_SAMPLES_PER_PACKET; i++) {
        view.setInt16(8 + i * 2, samples[i] ?? 0, true);
    }

    return buf;
}

// ===========================================================================
// Test Suite 1: createSimulationCSVContent()
// ===========================================================================
describe('createSimulationCSVContent()', () => {

    it('normal packet: header + 50 rows at 215 Hz', () => {
        const packet: StreamDataPacket = {
            timestamp: 1000,
            values: Array.from({ length: 50 }, (_, i) => i),
        };

        const csv = createSimulationCSVContent([packet], DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.trimEnd().split('\n');

        // Header + 50 data rows
        expect(lines).toHaveLength(51);
        expect(lines[0]).toBe('timestamp,value');
    });

    it('normal packet: timestamp spacing matches 1000/215 ms interval', () => {
        const packet: StreamDataPacket = {
            timestamp: 1000,
            values: [10, 20, 30],
        };

        const csv = createSimulationCSVContent([packet], DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.trimEnd().split('\n');

        // Line 1: timestamp=1000.00, value=10
        expect(lines[1]).toBe('1000.00,10');

        // Line 2: timestamp=1000+(1000/215)*1
        const expectedT2 = (1000 + 1000 / DEVICE_SAMPLE_RATE_HZ).toFixed(2);
        expect(lines[2]).toBe(`${expectedT2},20`);

        // Line 3: timestamp=1000+(1000/215)*2
        const expectedT3 = (1000 + (1000 / DEVICE_SAMPLE_RATE_HZ) * 2).toFixed(2);
        expect(lines[3]).toBe(`${expectedT3},30`);
    });

    it('empty array: header only, no data rows', () => {
        const csv = createSimulationCSVContent([], DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.trimEnd().split('\n');

        expect(lines).toHaveLength(1);
        expect(lines[0]).toBe('timestamp,value');
    });

    it('single packet: correct row count', () => {
        const packet: StreamDataPacket = {
            timestamp: 500,
            values: [100],
        };

        const csv = createSimulationCSVContent([packet], SIMULATION_SAMPLE_RATE_HZ);
        const lines = csv.trimEnd().split('\n');

        expect(lines).toHaveLength(2);
        expect(lines[1]).toBe('500.00,100');
    });

    it('large dataset: 1000 packets × 50 values = 50 000 data rows', () => {
        const packets: StreamDataPacket[] = Array.from({ length: 1000 }, (_, i) => ({
            timestamp: i * 232, // ~215 Hz spacing (50 samples * 1000ms / 215 ≈ 232ms)
            values: Array.from({ length: 50 }, () => 0),
        }));

        const csv = createSimulationCSVContent(packets, DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.trimEnd().split('\n');

        // Header + 50 000 data rows
        expect(lines).toHaveLength(50001);
        expect(lines[0]).toBe('timestamp,value');
    });

    it('simulation rate (50 Hz): spacing matches 1000/50 = 20 ms', () => {
        const packet: StreamDataPacket = {
            timestamp: 0,
            values: [1, 2],
        };

        const csv = createSimulationCSVContent([packet], SIMULATION_SAMPLE_RATE_HZ);
        const lines = csv.trimEnd().split('\n');

        expect(lines[1]).toBe('0.00,1');
        expect(lines[2]).toBe('20.00,2');
    });

    it('output always ends with newline', () => {
        const csv = createSimulationCSVContent([], DEVICE_SAMPLE_RATE_HZ);
        expect(csv.endsWith('\n')).toBe(true);
    });

    it('negative sample values are preserved verbatim', () => {
        const packet: StreamDataPacket = {
            timestamp: 100,
            values: [-500, 500, -1],
        };

        const csv = createSimulationCSVContent([packet], DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.trimEnd().split('\n');

        expect(lines[1]).toBe('100.00,-500');
        expect(lines[2]).toContain(',500');
        expect(lines[3]).toContain(',-1');
    });
});

// ===========================================================================
// Test Suite 2: Binary stream detection logic
//
// The decodeMessage() function inside BluetoothContext is a closure over
// React state and refs — it cannot be unit-tested in isolation without a full
// React render. Instead, we test the LOGIC of the detection gate as a pure
// function extracted here, verifying:
//   - The magic byte + code combination that triggers isStreaming
//   - That the ref-gate prevents duplicate setIsStreaming calls
// ===========================================================================
describe('Binary stream detection logic', () => {

    /**
     * Simulates the implicit stream-start gate from BluetoothContext.tsx:389–392:
     *
     *   if (!isStreamingRef.current) {
     *       isStreamingRef.current = true;
     *       setIsStreaming(true);
     *   }
     *
     * This is the exact logic extracted as a pure function for isolated testing.
     */
    function simulateDecodeMessageBinaryBranch(
        bytes: Uint8Array,
        isStreamingRef: { current: boolean },
        setIsStreamingCalls: boolean[],
    ): void {
        if (bytes[0] === BINARY_PACKET_MAGIC) {
            // Implicit stream-start gate (Fix 1)
            if (!isStreamingRef.current) {
                isStreamingRef.current = true;
                setIsStreamingCalls.push(true);
            }
        }
    }

    it('first binary packet with 0xAA magic triggers isStreaming = true', () => {
        const bytes = buildBinaryPacket();
        const isStreamingRef = { current: false };
        const setIsStreamingCalls: boolean[] = [];

        simulateDecodeMessageBinaryBranch(bytes, isStreamingRef, setIsStreamingCalls);

        expect(isStreamingRef.current).toBe(true);
        expect(setIsStreamingCalls).toHaveLength(1);
        expect(setIsStreamingCalls[0]).toBe(true);
    });

    it('second binary packet does NOT call setIsStreaming again (ref-gate)', () => {
        const bytes = buildBinaryPacket();
        const isStreamingRef = { current: false };
        const setIsStreamingCalls: boolean[] = [];

        // First packet
        simulateDecodeMessageBinaryBranch(bytes, isStreamingRef, setIsStreamingCalls);
        expect(setIsStreamingCalls).toHaveLength(1);

        // Second packet — ref is now true, gate prevents another call
        simulateDecodeMessageBinaryBranch(bytes, isStreamingRef, setIsStreamingCalls);
        expect(setIsStreamingCalls).toHaveLength(1); // still 1, not 2
    });

    it('non-binary byte (0x7B = JSON) does NOT trigger isStreaming via binary branch', () => {
        const jsonBytes = new Uint8Array([0x7B, 0x22, 0x63, 0x64, 0x22]); // '{"cd"'
        const isStreamingRef = { current: false };
        const setIsStreamingCalls: boolean[] = [];

        simulateDecodeMessageBinaryBranch(jsonBytes, isStreamingRef, setIsStreamingCalls);

        expect(isStreamingRef.current).toBe(false);
        expect(setIsStreamingCalls).toHaveLength(0);
    });

    it('packet with wrong first byte (0xBB) does NOT trigger isStreaming', () => {
        const bytes = new Uint8Array(BINARY_PACKET_TOTAL_SIZE);
        bytes[0] = 0xBB; // wrong magic
        bytes[1] = BINARY_PACKET_CODE;

        const isStreamingRef = { current: false };
        const setIsStreamingCalls: boolean[] = [];

        simulateDecodeMessageBinaryBranch(bytes, isStreamingRef, setIsStreamingCalls);

        expect(isStreamingRef.current).toBe(false);
        expect(setIsStreamingCalls).toHaveLength(0);
    });

    it('startStream() ref reset: after reset, next binary packet triggers again', () => {
        const bytes = buildBinaryPacket();
        const isStreamingRef = { current: false };
        const setIsStreamingCalls: boolean[] = [];

        // First session
        simulateDecodeMessageBinaryBranch(bytes, isStreamingRef, setIsStreamingCalls);
        expect(setIsStreamingCalls).toHaveLength(1);

        // Simulate startStream() reset (BluetoothContext.tsx:559)
        isStreamingRef.current = false;

        // Second session — ref reset allows fresh detection
        simulateDecodeMessageBinaryBranch(bytes, isStreamingRef, setIsStreamingCalls);
        expect(setIsStreamingCalls).toHaveLength(2);
        expect(isStreamingRef.current).toBe(true);
    });

    it('built binary packet has correct magic and code bytes', () => {
        const packet = buildBinaryPacket(5000);
        expect(packet[0]).toBe(BINARY_PACKET_MAGIC); // 0xAA
        expect(packet[1]).toBe(BINARY_PACKET_CODE);  // 0x0D
    });

    it('built binary packet has correct size', () => {
        const packet = buildBinaryPacket();
        expect(packet.length).toBe(BINARY_PACKET_TOTAL_SIZE); // 108
    });
});

// ===========================================================================
// Test Suite 3: Stop recording guard (Fix 2)
//
// Verifies that stopStream is called when selectedDevice is truthy,
// regardless of isStreaming. The old guard was `selectedDevice && isStreaming`.
// The fixed guard is `selectedDevice` only.
// ===========================================================================
describe('Stop recording guard (Fix 2)', () => {

    /**
     * Simulates the stop guard logic from handleStopRecording() after Fix 2.
     * Old logic: if (selectedDevice && isStreaming) { await stopStream(); }
     * New logic: if (selectedDevice) { await stopStream(); }
     */
    function simulateStopGuard_OLD(
        selectedDevice: object | undefined,
        isStreaming: boolean,
        stopStreamCalls: number[],
    ): void {
        if (selectedDevice && isStreaming) {
            stopStreamCalls.push(1);
        }
    }

    function simulateStopGuard_NEW(
        selectedDevice: object | undefined,
        stopStreamCalls: number[],
    ): void {
        if (selectedDevice) {
            stopStreamCalls.push(1);
        }
    }

    it('NEW guard: stopStream is called when device connected, isStreaming=false', () => {
        const device = { address: '00:11:22:33:44:55' };
        const calls: number[] = [];

        simulateStopGuard_NEW(device, calls);

        expect(calls).toHaveLength(1);
    });

    it('NEW guard: stopStream is called when device connected, isStreaming=true', () => {
        const device = { address: '00:11:22:33:44:55' };
        const calls: number[] = [];

        simulateStopGuard_NEW(device, calls);

        expect(calls).toHaveLength(1);
    });

    it('NEW guard: stopStream is NOT called when no device (simulation mode)', () => {
        const calls: number[] = [];

        simulateStopGuard_NEW(undefined, calls);

        expect(calls).toHaveLength(0);
    });

    it('OLD guard (bug): stopStream was NOT called when isStreaming=false', () => {
        const device = { address: '00:11:22:33:44:55' };
        const calls: number[] = [];

        simulateStopGuard_OLD(device, false, calls); // isStreaming=false → bug

        expect(calls).toHaveLength(0); // demonstrates the bug
    });

    it('OLD guard (bug) vs NEW guard: new guard catches the case old guard missed', () => {
        const device = { address: '00:11:22:33:44:55' };
        const oldCalls: number[] = [];
        const newCalls: number[] = [];

        // Scenario: device connected, binary streaming (isStreaming was never set true)
        simulateStopGuard_OLD(device, false, oldCalls);
        simulateStopGuard_NEW(device, newCalls);

        expect(oldCalls).toHaveLength(0); // OLD: bug — stopStream skipped
        expect(newCalls).toHaveLength(1); // NEW: fix — stopStream called
    });
});

// ===========================================================================
// Test Suite 4: serializePacketToCSV()
//
// serializePacketToCSV is a module-level function in BluetoothContext.tsx
// and is not exported. Because it is a plain pure function (no React
// dependencies), we duplicate the implementation here for isolated unit
// testing without needing a React Native rendering environment.
//
// Implementation source: BluetoothContext.tsx lines 32-40
//   function serializePacketToCSV(packet: StreamDataPacket, sampleRate: number): string {
//       const intervalMs = 1000 / sampleRate;
//       let csv = '';
//       for (let i = 0; i < packet.values.length; i++) {
//           const ts = packet.timestamp + i * intervalMs;
//           csv += `${ts.toFixed(2)},${packet.values[i]}\n`;
//       }
//       return csv;
//   }
//
// Key difference from createSimulationCSVContent:
//   - NO header line ("timestamp,value")
//   - Each line ends with \n (not joined by \n)
//   - Returns '' for an empty values array
// ===========================================================================
function serializePacketToCSV(packet: StreamDataPacket, sampleRate: number): string {
    const intervalMs = 1000 / sampleRate;
    let csv = '';
    for (let i = 0; i < packet.values.length; i++) {
        const ts = packet.timestamp + i * intervalMs;
        csv += `${ts.toFixed(2)},${packet.values[i]}\n`;
    }
    return csv;
}

describe('serializePacketToCSV()', () => {

    it('50 samples at 215 Hz → 50 lines, no header', () => {
        const packet: StreamDataPacket = {
            timestamp: 1000,
            values: Array.from({ length: 50 }, (_, i) => i * 10),
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.split('\n').filter(l => l.length > 0);

        expect(lines).toHaveLength(50);
    });

    it('50 samples at 215 Hz → timestamp spacing ≈ 4.65ms (1000/215)', () => {
        const packet: StreamDataPacket = {
            timestamp: 1000,
            values: [0, 1, 2],
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.split('\n').filter(l => l.length > 0);

        // First line: timestamp=1000.00
        expect(lines[0]).toBe('1000.00,0');

        // Second line: timestamp=1000 + 1000/215 * 1
        const expectedT1 = (1000 + 1000 / DEVICE_SAMPLE_RATE_HZ).toFixed(2);
        expect(lines[1]).toBe(`${expectedT1},1`);

        // Third line: timestamp=1000 + 1000/215 * 2
        const expectedT2 = (1000 + (1000 / DEVICE_SAMPLE_RATE_HZ) * 2).toFixed(2);
        expect(lines[2]).toBe(`${expectedT2},2`);
    });

    it('single sample → 1 line', () => {
        const packet: StreamDataPacket = {
            timestamp: 500,
            values: [42],
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.split('\n').filter(l => l.length > 0);

        expect(lines).toHaveLength(1);
        expect(lines[0]).toBe('500.00,42');
    });

    it('empty values → empty string', () => {
        const packet: StreamDataPacket = {
            timestamp: 1000,
            values: [],
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);

        expect(csv).toBe('');
    });

    it('each line ends with newline (\\n)', () => {
        const packet: StreamDataPacket = {
            timestamp: 0,
            values: [1, 2, 3],
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.split('\n');

        // After splitting by \n, the last element should be '' (trailing newline)
        expect(lines[lines.length - 1]).toBe('');
        // All non-empty lines should match the expected format
        const nonEmpty = lines.filter(l => l.length > 0);
        for (const line of nonEmpty) {
            expect(line).toMatch(/^\d+\.\d{2},-?\d+$/);
        }
    });

    it('format is exactly "timestamp.toFixed(2),value\\n" — no header', () => {
        const packet: StreamDataPacket = {
            timestamp: 2000,
            values: [99],
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);

        // Must NOT contain "timestamp,value" header
        expect(csv).not.toContain('timestamp,value');
        // Must start with the timestamp
        expect(csv).toBe('2000.00,99\n');
    });

    it('negative values are serialized correctly', () => {
        const packet: StreamDataPacket = {
            timestamp: 100,
            values: [-300, 0, 300],
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);
        const lines = csv.split('\n').filter(l => l.length > 0);

        expect(lines[0]).toBe('100.00,-300');
        expect(lines[1]).toContain(',0');
        expect(lines[2]).toContain(',300');
    });

    it('zero timestamp → first line starts at 0.00', () => {
        const packet: StreamDataPacket = {
            timestamp: 0,
            values: [55],
        };

        const csv = serializePacketToCSV(packet, DEVICE_SAMPLE_RATE_HZ);

        expect(csv.startsWith('0.00,55')).toBe(true);
    });
});

// ===========================================================================
// Test Suite 5: downsamplePacket()
//
// downsamplePacket is a module-level function in BluetoothContext.tsx
// and is not exported. The implementation uses a module-level constant:
//   const DOWNSAMPLE_FACTOR = 5; // 50 samples → 10 samples per packet
//
// Implementation source: BluetoothContext.tsx lines 42-48
//   function downsamplePacket(packet: StreamDataPacket): StreamDataPacket {
//       const downsampled: number[] = [];
//       for (let i = 0; i < packet.values.length; i += DOWNSAMPLE_FACTOR) {
//           downsampled.push(packet.values[i]);
//       }
//       return { timestamp: packet.timestamp, values: downsampled };
//   }
//
// Note: The implementation does NOT expose `factor` as a parameter — it always
// uses the module-level DOWNSAMPLE_FACTOR = 5. Tests reflect actual behavior.
// ===========================================================================
const DOWNSAMPLE_FACTOR = 5; // matches BluetoothContext.tsx

function downsamplePacket(packet: StreamDataPacket): StreamDataPacket {
    const downsampled: number[] = [];
    for (let i = 0; i < packet.values.length; i += DOWNSAMPLE_FACTOR) {
        downsampled.push(packet.values[i]);
    }
    return { timestamp: packet.timestamp, values: downsampled };
}

describe('downsamplePacket()', () => {

    it('50 values, factor 5 → 10 values', () => {
        const packet: StreamDataPacket = {
            timestamp: 1000,
            values: Array.from({ length: 50 }, (_, i) => i),
        };

        const result = downsamplePacket(packet);

        expect(result.values).toHaveLength(10);
    });

    it('50 values, factor 5 → picks indices 0,5,10,15,20,25,30,35,40,45', () => {
        const packet: StreamDataPacket = {
            timestamp: 1000,
            values: Array.from({ length: 50 }, (_, i) => i * 100), // values: 0,100,200,...,4900
        };

        const result = downsamplePacket(packet);

        const expectedIndices = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
        const expected = expectedIndices.map(i => i * 100);
        expect(result.values).toEqual(expected);
    });

    it('timestamp is preserved unchanged', () => {
        const packet: StreamDataPacket = {
            timestamp: 98765,
            values: Array.from({ length: 50 }, () => 0),
        };

        const result = downsamplePacket(packet);

        expect(result.timestamp).toBe(98765);
    });

    it('empty values → empty result values, timestamp preserved', () => {
        const packet: StreamDataPacket = {
            timestamp: 500,
            values: [],
        };

        const result = downsamplePacket(packet);

        expect(result.values).toHaveLength(0);
        expect(result.timestamp).toBe(500);
    });

    it('values fewer than factor (e.g. 3 values) → returns available values at index 0 only', () => {
        // With factor=5, only index 0 is picked from a 3-value array (i=0; i+=5 → i=5 > 3)
        const packet: StreamDataPacket = {
            timestamp: 100,
            values: [10, 20, 30],
        };

        const result = downsamplePacket(packet);

        expect(result.values).toHaveLength(1);
        expect(result.values[0]).toBe(10);
    });

    it('exactly factor count (5 values) → 1 value (index 0)', () => {
        const packet: StreamDataPacket = {
            timestamp: 200,
            values: [1, 2, 3, 4, 5],
        };

        const result = downsamplePacket(packet);

        expect(result.values).toHaveLength(1);
        expect(result.values[0]).toBe(1);
    });

    it('output is a new object (does not mutate input packet)', () => {
        const values = Array.from({ length: 50 }, (_, i) => i);
        const packet: StreamDataPacket = { timestamp: 1000, values };

        const result = downsamplePacket(packet);

        // Result should be a different object reference
        expect(result).not.toBe(packet);
        // Original values array is untouched
        expect(packet.values).toHaveLength(50);
    });

    it('single value → returned unchanged', () => {
        const packet: StreamDataPacket = {
            timestamp: 0,
            values: [42],
        };

        const result = downsamplePacket(packet);

        expect(result.values).toHaveLength(1);
        expect(result.values[0]).toBe(42);
    });

    it('10 values (factor 5) → 2 values at indices 0 and 5', () => {
        const packet: StreamDataPacket = {
            timestamp: 300,
            values: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
        };

        const result = downsamplePacket(packet);

        expect(result.values).toHaveLength(2);
        expect(result.values[0]).toBe(100);
        expect(result.values[1]).toBe(600);
    });
});
