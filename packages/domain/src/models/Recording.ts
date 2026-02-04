/**
 * Recording Models
 *
 * Defines types for sEMG data recordings associated with clinical sessions.
 */

import { SyncStatus } from './SyncStatus';

/**
 * Data Type
 */
export type DataType = 'raw' | 'filtered' | 'rms';

/**
 * Recording
 *
 * Represents a sEMG data recording with metadata including duration,
 * sample count, data type, sample rate, and file path.
 */
export interface Recording {
    id: string;
    sessionId: string;
    filename: string;
    durationSeconds: number;
    sampleCount: number;
    dataType: DataType;
    sampleRate: number;
    syncStatus: SyncStatus;
    filePath?: string;
    recordedAt: string; // ISO 8601
}

/**
 * New Recording Data
 *
 * Data transfer object for creating a new recording.
 */
export interface NewRecordingData {
    sessionId: string;
    filename: string;
    durationSeconds: number;
    sampleCount: number;
    dataType: DataType;
    sampleRate: number;
    filePath?: string;
}
