import { useMemo } from 'react';
import { StreamDataPacket, ChartDataPoint, ProcessedStreamData, StreamType } from '@iris/domain';

/**
 * Custom hook for processing sEMG stream data for chart visualization
 *
 * Features:
 * - Flattens packet arrays into individual samples
 * - Supports continuous scrolling with auto-scroll
 * - Converts timestamps to relative seconds
 * - Calculates statistics (min, max, avg)
 * - Optimized with useMemo for performance
 *
 * @param streamData - Array of StreamDataPackets from BluetoothContext
 * @param sampleRate - Current sampling rate in Hz (from streamConfig)
 * @param maxBufferSeconds - Maximum buffer duration in seconds (default: 60s)
 * @returns Processed data ready for chart rendering
 */
export function useStreamData(
    streamData: StreamDataPacket[],
    sampleRate: number = 100,
    maxBufferSeconds: number = 60
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

        // Buffer window for continuous scrolling (default: 60 seconds)
        const maxSamples = sampleRate * maxBufferSeconds;

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
                : 1000 / sampleRate; // Use actual sample rate

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

        // Step 3: Get baseline timestamp (first sample in entire dataset)
        const baseTimestamp = flatSamples[0].timestamp;

        // Step 4: Convert to chart format (continuous relative time in seconds)
        const chartData: ChartDataPoint[] = windowed.map((sample, index) => {
            // Calculate absolute time from start for continuous scrolling
            const absoluteTime = (sample.timestamp - baseTimestamp) / 1000;
            return {
                x: absoluteTime,
                y: sample.value
            };
        });

        // Step 5: Calculate statistics
        const values = windowed.map(s => s.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        const duration = (windowed.length - 1) / sampleRate; // Actual duration based on sample count

        return {
            chartData,
            totalSamples: flatSamples.length,
            minValue,
            maxValue,
            avgValue,
            duration
        };

    }, [streamData, sampleRate, maxBufferSeconds]);

    return processed;
}

/**
 * Helper function to get Y-axis range
 * Fixed range: [0, 1000] for all data types
 *
 * @param dataType - 'raw', 'filtered', or 'rms' (kept for API compatibility)
 * @param minValue - Minimum value in current data (kept for API compatibility)
 * @param maxValue - Maximum value in current data (kept for API compatibility)
 * @returns [min, max] for Y-axis - always [0, 1000]
 */
export function getYAxisRange(
    dataType: StreamType,
    minValue: number,
    maxValue: number
): [number, number] {
    // Fixed Y-axis range: 0 to 1000
    return [0, 1000];
}
