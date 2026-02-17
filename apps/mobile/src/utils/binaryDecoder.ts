/**
 * Binary sEMG Packet Decoder
 *
 * Decodes 108-byte binary packets from the ESP32 device (firmware v3.1+).
 * Packet structure mirrors StreamingProtocol.h on the device:
 *   [0]    uint8   magic byte     0xAA
 *   [1]    uint8   message code   0x0D
 *   [2-5]  uint32  timestamp      LE, millis() since boot
 *   [6-7]  uint16  sample_count   LE, always 50
 *   [8-107] int16[50] samples     LE, range -4096..+4096 mV
 */

import {
    StreamDataPacket,
    BINARY_PACKET_MAGIC,
    BINARY_PACKET_CODE,
    BINARY_PACKET_SAMPLES_PER_PACKET,
    BINARY_PACKET_TOTAL_SIZE,
} from '@iris/domain';

interface DecodedBinaryPacket {
    packet: StreamDataPacket;
    bytesConsumed: number;
}

/**
 * Attempts to decode a single binary sEMG packet starting at `offset`
 * within the provided buffer.
 *
 * Returns null if:
 * - Not enough bytes available (< BINARY_PACKET_TOTAL_SIZE)
 * - Magic byte mismatch at offset
 * - Message code mismatch
 * - Sample count validation fails
 */
function decodeBinaryPacket(buffer: Uint8Array, offset: number): DecodedBinaryPacket | null {
    if (buffer.length - offset < BINARY_PACKET_TOTAL_SIZE) {
        return null;
    }

    if (buffer[offset] !== BINARY_PACKET_MAGIC) {
        return null;
    }

    if (buffer[offset + 1] !== BINARY_PACKET_CODE) {
        return null;
    }

    // DataView constructor handles non-zero byteOffset on sliced Uint8Array views
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset, BINARY_PACKET_TOTAL_SIZE);

    const timestamp = view.getUint32(2, true);
    const sampleCount = view.getUint16(6, true);

    if (sampleCount !== BINARY_PACKET_SAMPLES_PER_PACKET) {
        console.warn(`[BinaryDecoder] Invalid sample count: ${sampleCount}, expected ${BINARY_PACKET_SAMPLES_PER_PACKET}`);
        return null;
    }

    const values: number[] = [];
    for (let i = 0; i < BINARY_PACKET_SAMPLES_PER_PACKET; i++) {
        values.push(view.getInt16(8 + i * 2, true));
    }

    return {
        packet: { timestamp, values },
        bytesConsumed: BINARY_PACKET_TOTAL_SIZE,
    };
}

/**
 * Stateful accumulator that buffers incoming bytes across multiple
 * `onDataReceived` callbacks and extracts complete 108-byte sEMG packets.
 *
 * SPP does not guarantee message boundaries — this class handles:
 * - Partial packets split across callbacks
 * - Multiple concatenated packets in a single callback
 * - Byte-stream corruption with resync via magic byte scanning
 */
export class BinaryFrameAccumulator {
    private buffer: Uint8Array;
    private writePos: number;
    private receivedCount: number;
    private droppedCount: number;

    constructor(initialCapacity = 512) {
        this.buffer = new Uint8Array(initialCapacity);
        this.writePos = 0;
        this.receivedCount = 0;
        this.droppedCount = 0;
    }

    /**
     * Feed incoming bytes into the accumulator.
     * Extracts and returns all complete StreamDataPacket objects.
     * Remaining partial data is retained for the next feed() call.
     */
    feed(data: Uint8Array): StreamDataPacket[] {
        this.append(data);

        const packets: StreamDataPacket[] = [];
        let scanPos = 0;

        while (this.writePos - scanPos >= BINARY_PACKET_TOTAL_SIZE) {
            if (this.buffer[scanPos] !== BINARY_PACKET_MAGIC) {
                // Not at a packet boundary — scan forward for the next 0xAA
                const nextMagic = this.findNextMagic(scanPos + 1);
                if (nextMagic === -1) {
                    // No magic byte in range — discard everything except the last byte
                    // (last byte might be an incomplete 0xAA arrival)
                    scanPos = this.writePos - 1;
                    this.droppedCount++;
                    break;
                }
                scanPos = nextMagic;
                this.droppedCount++;
                continue;
            }

            if (this.buffer[scanPos + 1] !== BINARY_PACKET_CODE) {
                // Magic byte found but message code mismatch — skip this byte
                scanPos++;
                this.droppedCount++;
                continue;
            }

            const result = decodeBinaryPacket(this.buffer, scanPos);
            if (result !== null) {
                packets.push(result.packet);
                scanPos += result.bytesConsumed;
                this.receivedCount++;
            } else {
                // Validation failed (e.g. wrong sample count) — skip past this 0xAA
                scanPos++;
                this.droppedCount++;
            }
        }

        // Compact: shift remaining bytes to front of buffer
        this.compact(scanPos);

        return packets;
    }

    /** Reset internal buffer — call on stream stop or disconnect. */
    reset(): void {
        this.writePos = 0;
        this.receivedCount = 0;
        this.droppedCount = 0;
    }

    /** Returns debug counters. received = decoded packets, dropped = resync events. */
    getStats(): { received: number; dropped: number } {
        return { received: this.receivedCount, dropped: this.droppedCount };
    }

    private append(data: Uint8Array): void {
        const required = this.writePos + data.length;
        if (required > this.buffer.length) {
            // Double capacity until it fits
            let newCapacity = this.buffer.length;
            while (newCapacity < required) {
                newCapacity *= 2;
            }
            const grown = new Uint8Array(newCapacity);
            grown.set(this.buffer.subarray(0, this.writePos));
            this.buffer = grown;
        }
        this.buffer.set(data, this.writePos);
        this.writePos += data.length;
    }

    private compact(scanPos: number): void {
        if (scanPos === 0) return;
        const remaining = this.writePos - scanPos;
        if (remaining > 0) {
            this.buffer.copyWithin(0, scanPos, this.writePos);
        }
        this.writePos = remaining;
    }

    private findNextMagic(startPos: number): number {
        for (let i = startPos; i < this.writePos; i++) {
            if (this.buffer[i] === BINARY_PACKET_MAGIC) {
                return i;
            }
        }
        return -1;
    }
}
