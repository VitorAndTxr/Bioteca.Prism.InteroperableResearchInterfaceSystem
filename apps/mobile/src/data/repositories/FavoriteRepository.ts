/**
 * Favorite Repository
 *
 * Manages persistence of session configuration favorites in local SQLite.
 * Favorites are local-only researcher preferences -- no sync, no backend.
 *
 * Schema v6 adds sensor_ids and sensor_names columns.
 */

import { SessionFavorite, CreateFavoritePayload, Laterality } from '@iris/domain';
import { databaseManager } from '../database';
import { generateUUID } from '../../utils/uuid';

interface FavoriteRow {
    id: string;
    name: string;
    body_structure_snomed_code: string;
    body_structure_name: string;
    topography_codes: string;
    topography_names: string;
    topography_categories: string;
    device_id: string | null;
    laterality: string | null;
    research_id: string | null;
    research_title: string | null;
    sensor_ids: string;
    sensor_names: string;
    created_at: string;
    updated_at: string;
}

export class FavoriteRepository {
    /**
     * Get all favorites ordered by most recently updated first.
     */
    async getAll(): Promise<SessionFavorite[]> {
        const db = databaseManager.getDatabase();
        const rows = await db.getAllAsync<FavoriteRow>(
            'SELECT * FROM session_favorites ORDER BY updated_at DESC'
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Get a single favorite by ID.
     */
    async getById(id: string): Promise<SessionFavorite | null> {
        const db = databaseManager.getDatabase();
        const row = await db.getFirstAsync<FavoriteRow>(
            'SELECT * FROM session_favorites WHERE id = ?',
            id
        );
        return row ? this.mapRow(row) : null;
    }

    /**
     * Create a new favorite.
     */
    async create(payload: CreateFavoritePayload): Promise<SessionFavorite> {
        const db = databaseManager.getDatabase();

        const id = generateUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO session_favorites
             (id, name, body_structure_snomed_code, body_structure_name,
              topography_codes, topography_names, topography_categories,
              device_id, laterality,
              research_id, research_title,
              sensor_ids, sensor_names,
              created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id,
            payload.name,
            payload.bodyStructureSnomedCode,
            payload.bodyStructureName,
            JSON.stringify(payload.topographyCodes),
            JSON.stringify(payload.topographyNames),
            JSON.stringify(payload.topographyCategories),
            payload.deviceId ?? null,
            payload.laterality ?? null,
            payload.researchId ?? null,
            payload.researchTitle ?? null,
            JSON.stringify(payload.sensorIds ?? []),
            JSON.stringify(payload.sensorNames ?? []),
            now,
            now
        );

        return {
            id,
            name: payload.name,
            bodyStructureSnomedCode: payload.bodyStructureSnomedCode,
            bodyStructureName: payload.bodyStructureName,
            topographyCodes: payload.topographyCodes,
            topographyNames: payload.topographyNames,
            topographyCategories: payload.topographyCategories,
            deviceId: payload.deviceId,
            laterality: payload.laterality,
            researchId: payload.researchId,
            researchTitle: payload.researchTitle,
            sensorIds: payload.sensorIds ?? [],
            sensorNames: payload.sensorNames ?? [],
            createdAt: now,
            updatedAt: now,
        };
    }

    /**
     * Partial update of a favorite. Always bumps updated_at.
     */
    async update(id: string, data: Partial<CreateFavoritePayload>): Promise<void> {
        const db = databaseManager.getDatabase();

        const fields: string[] = [];
        const values: (string | null)[] = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.bodyStructureSnomedCode !== undefined) {
            fields.push('body_structure_snomed_code = ?');
            values.push(data.bodyStructureSnomedCode);
        }
        if (data.bodyStructureName !== undefined) {
            fields.push('body_structure_name = ?');
            values.push(data.bodyStructureName);
        }
        if (data.topographyCodes !== undefined) {
            fields.push('topography_codes = ?');
            values.push(JSON.stringify(data.topographyCodes));
        }
        if (data.topographyNames !== undefined) {
            fields.push('topography_names = ?');
            values.push(JSON.stringify(data.topographyNames));
        }
        if (data.topographyCategories !== undefined) {
            fields.push('topography_categories = ?');
            values.push(JSON.stringify(data.topographyCategories));
        }
        if (data.deviceId !== undefined) {
            fields.push('device_id = ?');
            values.push(data.deviceId ?? null);
        }
        if (data.laterality !== undefined) {
            fields.push('laterality = ?');
            values.push(data.laterality ?? null);
        }
        if (data.researchId !== undefined) {
            fields.push('research_id = ?');
            values.push(data.researchId ?? null);
        }
        if (data.researchTitle !== undefined) {
            fields.push('research_title = ?');
            values.push(data.researchTitle ?? null);
        }
        if (data.sensorIds !== undefined) {
            fields.push('sensor_ids = ?');
            values.push(JSON.stringify(data.sensorIds));
        }
        if (data.sensorNames !== undefined) {
            fields.push('sensor_names = ?');
            values.push(JSON.stringify(data.sensorNames));
        }

        // Always bump updated_at
        fields.push('updated_at = ?');
        values.push(new Date().toISOString());

        values.push(id);

        await db.runAsync(
            `UPDATE session_favorites SET ${fields.join(', ')} WHERE id = ?`,
            ...values
        );
    }

    /**
     * Hard delete a favorite.
     */
    async delete(id: string): Promise<void> {
        const db = databaseManager.getDatabase();
        await db.runAsync('DELETE FROM session_favorites WHERE id = ?', id);
    }

    /**
     * Map a snake_case DB row to a camelCase domain model.
     */
    private mapRow(row: FavoriteRow): SessionFavorite {
        return {
            id: row.id,
            name: row.name,
            bodyStructureSnomedCode: row.body_structure_snomed_code,
            bodyStructureName: row.body_structure_name,
            topographyCodes: this.parseJsonArray(row.topography_codes),
            topographyNames: this.parseJsonArray(row.topography_names),
            topographyCategories: this.parseJsonArray(row.topography_categories),
            deviceId: row.device_id ?? undefined,
            laterality: (row.laterality as Laterality) ?? undefined,
            researchId: row.research_id ?? undefined,
            researchTitle: row.research_title ?? undefined,
            sensorIds: this.parseJsonArray(row.sensor_ids),
            sensorNames: this.parseJsonArray(row.sensor_names),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private parseJsonArray(json: string): string[] {
        try {
            const parsed = JSON.parse(json);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
}

export const favoriteRepository = new FavoriteRepository();
