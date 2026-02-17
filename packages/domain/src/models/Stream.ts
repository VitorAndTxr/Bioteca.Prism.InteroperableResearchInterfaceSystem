/**
 * Streaming Data Models
 *
 * Defines types for real-time sEMG data streaming and processing.
 */

/** Fixed ADC sample rate of the ESP32 sEMG device (860 Hz raw / 4x downsample). */
export const DEVICE_SAMPLE_RATE_HZ = 215;

/** Target display rate for chart rendering (points per second). */
export const CHART_DISPLAY_RATE_HZ = 40;

/** Duration in seconds of the chart sliding window. */
export const CHART_WINDOW_SECONDS = 4;

/** Simulation mode sample rate (Hz). */
export const SIMULATION_SAMPLE_RATE_HZ = 50;

// --- Binary Streaming Protocol Constants ---
// Mirror ESP32 StreamingProtocol.h definitions

/** Binary packet start marker byte. */
export const BINARY_PACKET_MAGIC = 0xAA;

/** Binary packet message code (StreamData = 13 = 0x0D). */
export const BINARY_PACKET_CODE = 0x0D;

/** Binary packet header size in bytes (magic + code + timestamp + sample_count). */
export const BINARY_PACKET_HEADER_SIZE = 8;

/** Number of int16_t samples per binary packet. */
export const BINARY_PACKET_SAMPLES_PER_PACKET = 50;

/** Total binary packet size in bytes (header + 50 * 2 bytes per sample). */
export const BINARY_PACKET_TOTAL_SIZE = 108;

export type StreamType = 'raw' | 'filtered' | 'rms';

/**
 * Stream Configuration
 * Note: `rate` is informational for real devices (always DEVICE_SAMPLE_RATE_HZ)
 * and only variable in simulation mode.
 */
export interface StreamConfiguration {
    rate: number; // Sampling rate in Hz
    type: StreamType; // Data type
}

/**
 * Stream Data Packet (from device)
 */
export interface StreamDataPacket {
    timestamp: number; // Milliseconds since device boot
    values: number[]; // Array of sEMG samples (5-10 per packet)
}

/**
 * Processed Stream Data (for visualization)
 */
export interface ProcessedStreamData {
    chartData: ChartDataPoint[];
    totalSamples: number;
    minValue: number;
    maxValue: number;
    avgValue: number;
    duration: number; // Duration in seconds
}

/**
 * Chart Data Point
 */
export interface ChartDataPoint {
    x: number; // Time in seconds (relative)
    y: number; // Signal amplitude
}

/**
 * Stream Statistics
 */
export interface StreamStatistics {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    sampleCount: number;
    duration: number; // seconds
}

/**
 * Stream Buffer Configuration
 */
export interface StreamBufferConfig {
    maxBufferSeconds: number; // Maximum buffer duration
    maxSamples: number; // Maximum number of samples
    autoDiscard: boolean; // Automatically discard old data
}
