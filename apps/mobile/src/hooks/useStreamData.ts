import { useState, useRef, useEffect, useCallback } from 'react';
import {
    StreamDataPacket,
    ChartDataPoint,
    ProcessedStreamData,
    StreamType,
    DEVICE_SAMPLE_RATE_HZ,
    CHART_DISPLAY_RATE_HZ,
    CHART_WINDOW_SECONDS
} from '@iris/domain';

const EMPTY_RESULT: ProcessedStreamData = {
    chartData: [],
    totalSamples: 0,
    minValue: 0,
    maxValue: 0,
    avgValue: 0,
    duration: 0
};

const UPDATE_INTERVAL_MS = 1000; // 1 Hz refresh

/**
 * Custom hook for processing sEMG stream data for chart visualization.
 *
 * - 4-second sliding window (~860 samples at 215 Hz)
 * - Downsample to CHART_DISPLAY_RATE_HZ (40 Hz) output (160 points)
 * - 1 Hz update cadence via setInterval
 *
 * @param streamData - Array of StreamDataPackets from BluetoothContext
 * @param sampleRate - Current sampling rate in Hz (defaults to DEVICE_SAMPLE_RATE_HZ)
 * @returns Processed data ready for chart rendering
 */
export function useStreamData(
    streamData: StreamDataPacket[],
    sampleRate: number = DEVICE_SAMPLE_RATE_HZ
): ProcessedStreamData {
    const [output, setOutput] = useState<ProcessedStreamData>(EMPTY_RESULT);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Keep a ref to the latest streamData to avoid stale closures in the interval
    const latestDataRef = useRef<StreamDataPacket[]>(streamData);
    latestDataRef.current = streamData;

    const processData = useCallback(() => {
        const data = latestDataRef.current;
        if (data.length === 0) {
            setOutput(EMPTY_RESULT);
            return;
        }

        // Step 1: Flatten all packets into individual samples
        const flatSamples: { timestamp: number; value: number }[] = [];
        const intervalMs = 1000 / sampleRate;

        for (const packet of data) {
            for (let i = 0; i < packet.values.length; i++) {
                flatSamples.push({
                    timestamp: packet.timestamp + i * intervalMs,
                    value: packet.values[i]
                });
            }
        }

        // Step 2: Keep only last 4 seconds worth of samples
        const maxSamples = sampleRate * CHART_WINDOW_SECONDS;
        const windowed = flatSamples.slice(-maxSamples);

        if (windowed.length === 0) {
            setOutput(EMPTY_RESULT);
            return;
        }

        // Step 3: Downsample to CHART_DISPLAY_RATE_HZ (40 Hz)
        const downsampleStep = Math.max(1, Math.round(sampleRate / CHART_DISPLAY_RATE_HZ));
        const baseTimestamp = windowed[0].timestamp;
        const chartData: ChartDataPoint[] = [];

        for (let i = 0; i < windowed.length; i += downsampleStep) {
            chartData.push({
                x: (windowed[i].timestamp - baseTimestamp) / 1000,
                y: windowed[i].value
            });
        }

        // Step 4: Statistics over the windowed samples
        const values = windowed.map(s => s.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const avgValue = values.reduce((s, v) => s + v, 0) / values.length;
        const duration = windowed.length / sampleRate;

        setOutput({
            chartData,
            totalSamples: flatSamples.length,
            minValue,
            maxValue,
            avgValue,
            duration
        });
    }, [sampleRate]);

    // 1 Hz update interval — process immediately on mount, then every second
    useEffect(() => {
        processData();
        intervalRef.current = setInterval(processData, UPDATE_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [processData]);

    return output;
}

/**
 * Helper function to get Y-axis range.
 * Fixed range: [-500, 500] for all data types (zero-centered).
 *
 * @param dataType - 'raw', 'filtered', or 'rms' (kept for API compatibility)
 * @param minValue - Minimum value in current data (kept for API compatibility)
 * @param maxValue - Maximum value in current data (kept for API compatibility)
 * @returns [min, max] for Y-axis - always [-500, 500]
 */
export function getYAxisRange(
    dataType: StreamType,
    minValue: number,
    maxValue: number
): [number, number] {
    // Fixed Y-axis range: -500 to +500 (zero-centered)
    return [-500, 500];
}
