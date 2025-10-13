/**
 * CSV Export Utilities for sEMG Stream Data
 * Simplified version - exports only values separated by commas
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Stream data packet structure
 */
export interface StreamDataPacket {
    timestamp: number;
    values: number[];
}

/**
 * Exports stream data as simple CSV with one value per line (single column)
 * All values are flattened into a single column
 *
 * @param streamData - Array of stream data packets
 * @returns Promise that resolves when file is shared
 */
export async function exportStreamDataSimpleCSV(
    streamData: StreamDataPacket[]
): Promise<void> {
    if (streamData.length === 0) {
        throw new Error('No data to export');
    }

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `semg_${timestamp}.csv`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;

    // Flatten all values into a single array
    const allValues: number[] = [];
    streamData.forEach((packet) => {
        allValues.push(...packet.values);
    });

    // Create CSV with one value per line (single column)
    const csvContent = allValues.join('\n');

    // Write file
    await FileSystem.writeAsStringAsync(filepath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
    });

    // Share file
    await Sharing.shareAsync(filepath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export sEMG Data'
    });
}

/**
 * Exports stream data as single-line CSV with all values in sequence
 *
 * @param streamData - Array of stream data packets
 * @returns Promise that resolves when file is shared
 */
export async function exportStreamDataSingleLineCSV(
    streamData: StreamDataPacket[]
): Promise<void> {
    if (streamData.length === 0) {
        throw new Error('No data to export');
    }

    // Generate filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `semg_${timestamp}.csv`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;

    // Flatten all values into a single array
    const allValues: number[] = [];
    streamData.forEach((packet) => {
        allValues.push(...packet.values);
    });

    // Create single line CSV
    const csvContent = allValues.join(',');

    // Write file
    await FileSystem.writeAsStringAsync(filepath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
    });

    // Share file
    await Sharing.shareAsync(filepath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export sEMG Data'
    });
}

/**
 * Estimate CSV file size in bytes
 */
export function estimateCSVSize(streamData: StreamDataPacket[]): number {
    let totalSamples = 0;
    streamData.forEach(packet => {
        totalSamples += packet.values.length;
    });

    // Estimate: ~8 bytes per value (average) + commas + newlines
    return totalSamples * 10;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
