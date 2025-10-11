import { useMemo } from 'react';
import { StreamDataPacket } from '@/context/BluetoothContext';

export interface ChartDataPoint {
    x: number; // Time in seconds (relative)
    y: number; // Signal amplitude
}

export interface ProcessedStreamData {
    chartData: ChartDataPoint[];
    totalSamples: number;
    minValue: number;
    maxValue: number;
    avgValue: number;
    duration: number; // Duration in seconds
}

/**
 * Custom hook for processing sEMG stream data for chart visualization
 *
 * Features:
 * - Flattens packet arrays into individual samples
 * - Applies sliding window (keeps last maxSamples)
 * - Converts timestamps to relative seconds
 * - Calculates statistics (min, max, avg)
 * - Optimized with useMemo for performance
 *
 * @param streamData - Array of StreamDataPackets from BluetoothContext
 * @param maxSamples - Maximum number of samples to display (default: 500)
 * @returns Processed data ready for chart rendering
 */
export function useStreamData(
    streamData: StreamDataPacket[],
    maxSamples: number = 500
): ProcessedStreamData {

    const processed = useMemo(() => {
        if (streamData.length === 0) {
            return {
                chartData: [],
                totalSamples: 0,
                minValue: 0,
                maxValue: 0,
                avgValue: 0,
                duration: 0
            };
        }

        // Step 1: Flatten packets into individual samples with timestamps
        const flatSamples: { timestamp: number; value: number }[] = [];

        streamData.forEach(packet => {
            // Packet contains: { timestamp: number, values: number[] }
            // We need to interpolate timestamps for each value in the array
            const samplesInPacket = packet.values.length;

            // Calculate time offset between samples in this packet
            // Assuming uniform sampling within packet
            const nextPacket = streamData[streamData.indexOf(packet) + 1];
            const timePerSample = nextPacket
                ? (nextPacket.timestamp - packet.timestamp) / samplesInPacket
                : 10; // Default to 10ms if no next packet

            packet.values.forEach((value, index) => {
                flatSamples.push({
                    timestamp: packet.timestamp + (index * timePerSample),
                    value: value
                });
            });
        });

        // Step 2: Apply sliding window (keep last maxSamples)
        const windowed = flatSamples.slice(-maxSamples);

        if (windowed.length === 0) {
            return {
                chartData: [],
                totalSamples: 0,
                minValue: 0,
                maxValue: 0,
                avgValue: 0,
                duration: 0
            };
        }

        // Step 3: Get baseline timestamp (first sample in window)
        const baseTimestamp = windowed[0].timestamp;

        // Step 4: Convert to chart format (relative time in seconds)
        const chartData: ChartDataPoint[] = windowed.map(sample => ({
            x: (sample.timestamp - baseTimestamp) / 1000, // Convert ms to seconds
            y: sample.value
        }));

        // Step 5: Calculate statistics
        const values = windowed.map(s => s.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        const duration = (windowed[windowed.length - 1].timestamp - baseTimestamp) / 1000;

        return {
            chartData,
            totalSamples: flatSamples.length,
            minValue,
            maxValue,
            avgValue,
            duration
        };

    }, [streamData, maxSamples]);

    return processed;
}

/**
 * Helper function to get Y-axis range based on data type
 *
 * @param dataType - 'raw', 'filtered', or 'rms'
 * @param minValue - Minimum value in current data
 * @param maxValue - Maximum value in current data
 * @returns [min, max] for Y-axis
 */
export function getYAxisRange(
    dataType: 'raw' | 'filtered' | 'rms',
    minValue: number,
    maxValue: number
): [number, number] {
    switch (dataType) {
        case 'raw':
            // 12-bit ADC range
            return [0, 4095];

        case 'filtered':
            // Dynamic range with padding
            const padding = (maxValue - minValue) * 0.1;
            return [minValue - padding, maxValue + padding];

        case 'rms':
            // RMS typically 0-200
            return [0, Math.max(200, maxValue * 1.2)];

        default:
            return [0, 100];
    }
}
