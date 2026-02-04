/**
 * Recording Repository
 *
 * Manages persistence of sEMG data recordings associated with clinical sessions.
 */

import { Recording, NewRecordingData } from '@iris/domain';
import { databaseManager } from '../database';
import { generateUUID } from '../../utils/uuid';

/**
 * Database row type (snake_case from SQLite)
 */
interface RecordingRow {
    id: string;
    session_id: string;
    filename: string;
    duration_seconds: number;
    sample_count: number;
    data_type: string;
    sample_rate: number;
    sync_status: string;
    file_path: string | null;
    recorded_at: string;
}

export class RecordingRepository {
    /**
     * Get recording by ID.
     */
    async getById(id: string): Promise<Recording | null> {
        const db = databaseManager.getDatabase();
        const row = await db.getFirstAsync<RecordingRow>(
            'SELECT * FROM recordings WHERE id = ?',
            id
        );

        return row ? this.mapRowToRecording(row) : null;
    }

    /**
     * Get all recordings.
     */
    async getAll(): Promise<Recording[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<RecordingRow>('SELECT * FROM recordings ORDER BY recorded_at DESC');
        return rows.map(row => this.mapRowToRecording(row));
    }

    /**
     * Get recordings by session.
     */
    async getBySession(sessionId: string): Promise<Recording[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<RecordingRow>(
            'SELECT * FROM recordings WHERE session_id = ? ORDER BY recorded_at ASC',
            sessionId
        );
        return rows.map(row => this.mapRowToRecording(row));
    }

    /**
     * Get pending recordings (not synced).
     */
    async getPending(): Promise<Recording[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<RecordingRow>(
            "SELECT * FROM recordings WHERE sync_status = 'pending' ORDER BY recorded_at ASC"
        );
        return rows.map(row => this.mapRowToRecording(row));
    }

    /**
     * Create a new recording.
     */
    async create(data: NewRecordingData): Promise<Recording> {
        const db = databaseManager.getDatabase();

        const id = generateUUID();
        const recordedAt = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO recordings
             (id, session_id, filename, duration_seconds, sample_count, data_type, sample_rate, sync_status, file_path, recorded_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
            id,
            data.sessionId,
            data.filename,
            data.durationSeconds,
            data.sampleCount,
            data.dataType,
            data.sampleRate,
            data.filePath ?? null,
            recordedAt
        );

        const recording = await this.getById(id);
        if (!recording) {
            throw new Error('Failed to retrieve created recording');
        }

        return recording;
    }

    /**
     * Update recording.
     */
    async update(id: string, data: Partial<Recording>): Promise<void> {
        const db = databaseManager.getDatabase();

        const fields: string[] = [];
        const values: (string | number | null)[] = [];

        if (data.filename !== undefined) {
            fields.push('filename = ?');
            values.push(data.filename);
        }
        if (data.durationSeconds !== undefined) {
            fields.push('duration_seconds = ?');
            values.push(data.durationSeconds);
        }
        if (data.sampleCount !== undefined) {
            fields.push('sample_count = ?');
            values.push(data.sampleCount);
        }
        if (data.dataType !== undefined) {
            fields.push('data_type = ?');
            values.push(data.dataType);
        }
        if (data.sampleRate !== undefined) {
            fields.push('sample_rate = ?');
            values.push(data.sampleRate);
        }
        if (data.syncStatus !== undefined) {
            fields.push('sync_status = ?');
            values.push(data.syncStatus);
        }
        if (data.filePath !== undefined) {
            fields.push('file_path = ?');
            values.push(data.filePath ?? null);
        }

        if (fields.length === 0) {
            return;
        }

        values.push(id);

        await db.runAsync(
            `UPDATE recordings SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    }

    /**
     * Delete recording.
     */
    async delete(id: string): Promise<void> {
        const db = databaseManager.getDatabase();
        await db.runAsync('DELETE FROM recordings WHERE id = ?', id);
    }

    /**
     * Mark recording as synced.
     */
    async markAsSynced(id: string): Promise<void> {
        await this.update(id, { syncStatus: 'synced' });
    }

    /**
     * Mark recording as failed.
     */
    async markAsFailed(id: string): Promise<void> {
        await this.update(id, { syncStatus: 'failed' });
    }

    /**
     * Map database row to Recording model.
     */
    private mapRowToRecording(row: RecordingRow): Recording {
        return {
            id: row.id,
            sessionId: row.session_id,
            filename: row.filename,
            durationSeconds: row.duration_seconds,
            sampleCount: row.sample_count,
            dataType: row.data_type as 'raw' | 'filtered' | 'rms',
            sampleRate: row.sample_rate,
            syncStatus: row.sync_status as 'synced' | 'pending' | 'failed',
            filePath: row.file_path ?? undefined,
            recordedAt: row.recorded_at
        };
    }
}
