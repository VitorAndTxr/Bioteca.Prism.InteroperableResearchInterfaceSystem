/**
 * Streaming Data Models
 *
 * Defines types for real-time sEMG data streaming and processing.
 */

export type StreamType = 'raw' | 'filtered' | 'rms';

/**
 * Stream Configuration
 */
export interface StreamConfiguration {
    rate: number; // Sampling rate in Hz (10-200)
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
