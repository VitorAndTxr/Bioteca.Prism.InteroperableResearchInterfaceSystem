/**
 * Annotation Repository
 *
 * Manages persistence of text annotations associated with clinical sessions.
 */

import { Annotation, NewAnnotationData } from '@iris/domain';
import { databaseManager } from '../database';
import { generateUUID } from '../../utils/uuid';

/**
 * Database row type (snake_case from SQLite)
 */
interface AnnotationRow {
    id: string;
    session_id: string;
    text: string;
    sync_status: string;
    created_at: string;
}

export class AnnotationRepository {
    /**
     * Get annotation by ID.
     */
    async getById(id: string): Promise<Annotation | null> {
        const db = databaseManager.getDatabase();
        const row = await db.getFirstAsync<AnnotationRow>(
            'SELECT * FROM annotations WHERE id = ?',
            id
        );

        return row ? this.mapRowToAnnotation(row) : null;
    }

    /**
     * Get all annotations.
     */
    async getAll(): Promise<Annotation[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<AnnotationRow>('SELECT * FROM annotations ORDER BY created_at DESC');
        return rows.map(row => this.mapRowToAnnotation(row));
    }

    /**
     * Get annotations by session.
     */
    async getBySession(sessionId: string): Promise<Annotation[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<AnnotationRow>(
            'SELECT * FROM annotations WHERE session_id = ? ORDER BY created_at ASC',
            sessionId
        );
        return rows.map(row => this.mapRowToAnnotation(row));
    }

    /**
     * Get pending annotations (not synced).
     */
    async getPending(): Promise<Annotation[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<AnnotationRow>(
            "SELECT * FROM annotations WHERE sync_status = 'pending' ORDER BY created_at ASC"
        );
        return rows.map(row => this.mapRowToAnnotation(row));
    }

    /**
     * Create a new annotation.
     */
    async create(data: NewAnnotationData): Promise<Annotation> {
        const db = databaseManager.getDatabase();

        const id = generateUUID();
        const createdAt = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO annotations
             (id, session_id, text, sync_status, created_at)
             VALUES (?, ?, ?, 'pending', ?)`,
            id,
            data.sessionId,
            data.text,
            createdAt
        );

        const annotation = await this.getById(id);
        if (!annotation) {
            throw new Error('Failed to retrieve created annotation');
        }

        return annotation;
    }

    /**
     * Update annotation.
     */
    async update(id: string, data: Partial<Annotation>): Promise<void> {
        const db = databaseManager.getDatabase();

        const fields: string[] = [];
        const values: (string | null)[] = [];

        if (data.text !== undefined) {
            fields.push('text = ?');
            values.push(data.text);
        }
        if (data.syncStatus !== undefined) {
            fields.push('sync_status = ?');
            values.push(data.syncStatus);
        }

        if (fields.length === 0) {
            return;
        }

        values.push(id);

        await db.runAsync(
            `UPDATE annotations SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    }

    /**
     * Delete annotation.
     */
    async delete(id: string): Promise<void> {
        const db = databaseManager.getDatabase();
        await db.runAsync('DELETE FROM annotations WHERE id = ?', id);
    }

    /**
     * Mark annotation as synced.
     */
    async markAsSynced(id: string): Promise<void> {
        await this.update(id, { syncStatus: 'synced' });
    }

    /**
     * Mark annotation as failed.
     */
    async markAsFailed(id: string): Promise<void> {
        await this.update(id, { syncStatus: 'failed' });
    }

    /**
     * Map database row to Annotation model.
     */
    private mapRowToAnnotation(row: AnnotationRow): Annotation {
        return {
            id: row.id,
            sessionId: row.session_id,
            text: row.text,
            syncStatus: row.sync_status as 'synced' | 'pending' | 'failed',
            createdAt: row.created_at
        };
    }
}
