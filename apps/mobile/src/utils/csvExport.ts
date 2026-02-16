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

/**
 * Recording data point structure for CSV export
 */
export interface RecordingDataPoint {
    timestamp: number;
    value: number;
}

/**
 * Session metadata for CSV header
 */
export interface SessionMetadata {
    sessionId: string;
    volunteerId: string;
    volunteerName?: string;
    bodyStructure: string;
    laterality: string | null;
    startedAt: string;
    durationSeconds: number;
    sampleRate: number;
    dataType: string;
}

/**
 * Recording for CSV export
 */
export interface RecordingForExport {
    id: string;
    filename: string;
    recordedAt: string;
    dataType: string;
    sampleRate: number;
    sampleCount: number;
}

/**
 * Exports session data to CSV with metadata header and recording data.
 *
 * CSV Format:
 * - Metadata section: Key-value pairs for session information
 * - Blank line separator
 * - Data section: Timestamp,Value columns for each recording
 *
 * @param metadata - Session metadata for header
 * @param recordings - Array of recordings to export
 * @param dataPoints - Array of data points (timestamp, value pairs)
 * @returns File URI of exported CSV
 */
export async function exportSessionData(
    metadata: SessionMetadata,
    recordings: RecordingForExport[],
    dataPoints: RecordingDataPoint[][]
): Promise<string> {
    if (recordings.length === 0) {
        throw new Error('No recordings to export');
    }

    if (recordings.length !== dataPoints.length) {
        throw new Error('Recordings and dataPoints arrays must have the same length');
    }

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `session_${metadata.sessionId.substring(0, 8)}_${timestamp}.csv`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;

    const lines: string[] = [];

    // Metadata header section
    lines.push('# Session Metadata');
    lines.push(`Session ID,${metadata.sessionId}`);
    lines.push(`Volunteer ID,${metadata.volunteerId}`);
    if (metadata.volunteerName) {
        lines.push(`Volunteer Name,${metadata.volunteerName}`);
    }
    lines.push(`Body Structure,${metadata.bodyStructure}`);
    lines.push(`Laterality,${metadata.laterality ?? 'N/A'}`);
    lines.push(`Started At,${metadata.startedAt}`);
    lines.push(`Duration (seconds),${metadata.durationSeconds}`);
    lines.push(`Sample Rate (Hz),${metadata.sampleRate}`);
    lines.push(`Data Type,${metadata.dataType}`);
    lines.push(`Recording Count,${recordings.length}`);
    lines.push(''); // Blank line separator

    // Data section for each recording
    recordings.forEach((recording, index) => {
        const points = dataPoints[index];

        lines.push(`# Recording ${index + 1}`);
        lines.push(`Filename,${recording.filename}`);
        lines.push(`Recorded At,${recording.recordedAt}`);
        lines.push(`Data Type,${recording.dataType}`);
        lines.push(`Sample Rate (Hz),${recording.sampleRate}`);
        lines.push(`Sample Count,${recording.sampleCount}`);
        lines.push(''); // Blank line

        // Data header
        lines.push('Timestamp,Value');

        // Data rows
        points.forEach((point) => {
            lines.push(`${point.timestamp},${point.value}`);
        });

        lines.push(''); // Blank line between recordings
    });

    const csvContent = lines.join('\n');

    await FileSystem.writeAsStringAsync(filepath, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
    });

    return filepath;
}

/**
 * Share CSV file using native share sheet.
 *
 * @param fileUri - URI of the CSV file to share
 * @returns Promise that resolves when sharing is complete
 */
export async function shareCSV(fileUri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Session Data'
    });
}
