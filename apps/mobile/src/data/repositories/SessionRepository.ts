/**
 * Session Repository
 *
 * Manages persistence of clinical sessions and associated clinical data.
 */

import { ClinicalSession, ClinicalData, SessionConfig, Laterality } from '@iris/domain';
import { databaseManager } from '../database';
import { generateUUID } from '../../utils/uuid';

/**
 * Database row types (snake_case from SQLite)
 */
interface SessionRow {
    id: string;
    volunteer_id: string;
    volunteer_name: string | null;
    researcher_id: string;
    device_id: string | null;
    research_id: string | null;
    research_title: string | null;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number;
    sync_status: string;
    created_at: string;
}

interface ClinicalDataRow {
    id: string;
    session_id: string;
    body_structure_snomed_code: string;
    body_structure_name: string;
    laterality: string | null;
    topography_codes: string;
    topography_names: string;
}

export class SessionRepository {
    /**
     * Get session by ID.
     */
    async getById(id: string): Promise<ClinicalSession | null> {
        const db = databaseManager.getDatabase();
        const row = await db.getFirstAsync<SessionRow>(
            'SELECT * FROM clinical_sessions WHERE id = ?',
            id
        );

        return row ? this.mapRowToSession(row) : null;
    }

    /**
     * Get all sessions.
     */
    async getAll(): Promise<ClinicalSession[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<SessionRow>('SELECT * FROM clinical_sessions ORDER BY created_at DESC');
        return rows.map(row => this.mapRowToSession(row));
    }

    /**
     * Get sessions by researcher with pagination.
     */
    async getByResearcher(researcherId: string, page: number = 0, pageSize: number = 20): Promise<ClinicalSession[]> {
        const db = databaseManager.getDatabase();
        const offset = page * pageSize;

        const rows = await db.getAllAsync<SessionRow>(
            `SELECT * FROM clinical_sessions
             WHERE researcher_id = ?
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            researcherId,
            pageSize,
            offset
        );

        return rows.map(row => this.mapRowToSession(row));
    }

    /**
     * Search sessions by volunteer name or date.
     */
    async search(query: string): Promise<ClinicalSession[]> {
        const db = databaseManager.getDatabase();
        const searchPattern = `%${query}%`;

        const rows = await db.getAllAsync<SessionRow>(
            `SELECT * FROM clinical_sessions
             WHERE volunteer_name LIKE ? OR started_at LIKE ?
             ORDER BY created_at DESC`,
            searchPattern,
            searchPattern
        );

        return rows.map(row => this.mapRowToSession(row));
    }

    /**
     * Get pending sessions (not synced).
     */
    async getPending(): Promise<ClinicalSession[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<SessionRow>(
            "SELECT * FROM clinical_sessions WHERE sync_status = 'pending' ORDER BY created_at ASC"
        );
        return rows.map(row => this.mapRowToSession(row));
    }

    /**
     * Get active session (not ended).
     */
    async getActiveSession(): Promise<ClinicalSession | null> {
        const db = databaseManager.getDatabase();
        const row = await db.getFirstAsync<SessionRow>(
            'SELECT * FROM clinical_sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1'
        );

        return row ? this.mapRowToSession(row) : null;
    }

    /**
     * Create a new session with clinical data.
     */
    async create(config: SessionConfig): Promise<ClinicalSession> {
        const db = databaseManager.getDatabase();

        const sessionId = generateUUID();
        const clinicalDataId = generateUUID();
        const now = new Date().toISOString();

        // Start transaction
        await db.execAsync('BEGIN TRANSACTION');

        try {
            // Insert session
            await db.runAsync(
                `INSERT INTO clinical_sessions
                 (id, volunteer_id, volunteer_name, researcher_id, device_id, research_id, research_title, started_at, duration_seconds, sync_status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?)`,
                sessionId,
                config.volunteerId,
                config.volunteerName,
                config.researcherId,
                config.deviceId ?? null,
                config.researchId ?? null,
                config.researchTitle ?? null,
                now,
                now
            );

            // Insert clinical data
            await db.runAsync(
                `INSERT INTO clinical_data
                 (id, session_id, body_structure_snomed_code, body_structure_name, laterality, topography_codes, topography_names)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                clinicalDataId,
                sessionId,
                config.clinicalData.bodyStructureSnomedCode,
                config.clinicalData.bodyStructureName,
                config.clinicalData.laterality,
                JSON.stringify(config.clinicalData.topographyCodes),
                JSON.stringify(config.clinicalData.topographyNames)
            );

            // Commit transaction
            await db.execAsync('COMMIT');

            // Return created session
            const session = await this.getById(sessionId);
            if (!session) {
                throw new Error('Failed to retrieve created session');
            }

            return session;
        } catch (error) {
            // Rollback on error
            await db.execAsync('ROLLBACK');
            console.error('[SessionRepository] Failed to create session:', error);
            throw error;
        }
    }

    /**
     * Update session.
     */
    async update(id: string, data: Partial<ClinicalSession>): Promise<void> {
        const db = databaseManager.getDatabase();

        const fields: string[] = [];
        const values: (string | number | null)[] = [];

        if (data.volunteerName !== undefined) {
            fields.push('volunteer_name = ?');
            values.push(data.volunteerName ?? null);
        }
        if (data.deviceId !== undefined) {
            fields.push('device_id = ?');
            values.push(data.deviceId ?? null);
        }
        if (data.endedAt !== undefined) {
            fields.push('ended_at = ?');
            values.push(data.endedAt ?? null);
        }
        if (data.durationSeconds !== undefined) {
            fields.push('duration_seconds = ?');
            values.push(data.durationSeconds);
        }
        if (data.syncStatus !== undefined) {
            fields.push('sync_status = ?');
            values.push(data.syncStatus);
        }
        if (data.researchId !== undefined) {
            fields.push('research_id = ?');
            values.push(data.researchId ?? null);
        }
        if (data.researchTitle !== undefined) {
            fields.push('research_title = ?');
            values.push(data.researchTitle ?? null);
        }

        if (fields.length === 0) {
            return;
        }

        values.push(id);

        await db.runAsync(
            `UPDATE clinical_sessions SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    }

    /**
     * Delete session (cascades to clinical_data, recordings, annotations).
     */
    async delete(id: string): Promise<void> {
        const db = databaseManager.getDatabase();
        await db.runAsync('DELETE FROM clinical_sessions WHERE id = ?', id);
    }

    /**
     * Get clinical data for a session.
     */
    async getClinicalData(sessionId: string): Promise<ClinicalData | null> {
        const db = databaseManager.getDatabase();
        const row = await db.getFirstAsync<ClinicalDataRow>(
            'SELECT * FROM clinical_data WHERE session_id = ?',
            sessionId
        );

        return row ? this.mapRowToClinicalData(row) : null;
    }

    /**
     * End a session (set ended_at and calculate duration).
     */
    async endSession(id: string): Promise<void> {
        const session = await this.getById(id);
        if (!session) {
            throw new Error(`Session not found: ${id}`);
        }

        const endedAt = new Date().toISOString();
        const startedAt = new Date(session.startedAt);
        const durationSeconds = Math.floor((new Date(endedAt).getTime() - startedAt.getTime()) / 1000);

        await this.update(id, { endedAt, durationSeconds });
    }

    /**
     * Map database row to ClinicalSession model.
     */
    private mapRowToSession(row: SessionRow): ClinicalSession {
        return {
            id: row.id,
            volunteerId: row.volunteer_id,
            volunteerName: row.volunteer_name ?? undefined,
            researcherId: row.researcher_id,
            deviceId: row.device_id ?? undefined,
            researchId: row.research_id ?? undefined,
            researchTitle: row.research_title ?? undefined,
            startedAt: row.started_at,
            endedAt: row.ended_at ?? undefined,
            durationSeconds: row.duration_seconds,
            syncStatus: row.sync_status as 'synced' | 'pending' | 'failed',
            createdAt: row.created_at
        };
    }

    /**
     * Map database row to ClinicalData model.
     */
    private mapRowToClinicalData(row: ClinicalDataRow): ClinicalData {
        return {
            id: row.id,
            sessionId: row.session_id,
            bodyStructureSnomedCode: row.body_structure_snomed_code,
            bodyStructureName: row.body_structure_name,
            laterality: row.laterality as Laterality | null,
            topographyCodes: JSON.parse(row.topography_codes) as string[],
            topographyNames: JSON.parse(row.topography_names) as string[]
        };
    }
}
