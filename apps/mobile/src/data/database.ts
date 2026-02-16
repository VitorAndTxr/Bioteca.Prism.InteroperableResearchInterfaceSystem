/**
 * Database Manager
 *
 * Singleton manager for SQLite database initialization and migration management.
 * Uses expo-sqlite async API (Expo SDK 52).
 */

import * as SQLite from 'expo-sqlite';
import { v1_initial } from './migrations/v1_initial';
import { v2_add_research_columns } from './migrations/v2_add_research_columns';
import { v3_relax_laterality_constraint } from './migrations/v3_relax_laterality_constraint';

interface Migration {
    version: number;
    name: string;
    sql: string;
}

const MIGRATIONS: Migration[] = [
    { version: 1, name: 'v1_initial', sql: v1_initial },
    { version: 2, name: 'v2_add_research_columns', sql: v2_add_research_columns },
    { version: 3, name: 'v3_relax_laterality_constraint', sql: v3_relax_laterality_constraint },
];

class DatabaseManager {
    private db: SQLite.SQLiteDatabase | null = null;
    private initialized = false;

    /**
     * Initialize the database and run pending migrations.
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            this.db = await SQLite.openDatabaseAsync('iris_clinical.db');
            await this.runMigrations();
            this.initialized = true;
            console.log('[DatabaseManager] Database initialized successfully');
        } catch (error) {
            console.error('[DatabaseManager] Failed to initialize database:', error);
            throw error;
        }
    }

    /**
     * Get the database instance.
     * Throws if database is not initialized.
     */
    getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }

    /**
     * Run pending database migrations.
     */
    private async runMigrations(): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        // Create migrations table if it doesn't exist
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS migrations (
                version INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        `);

        // Get applied migrations
        const appliedMigrations = await this.db.getAllAsync<{ version: number }>(
            'SELECT version FROM migrations ORDER BY version'
        );

        const appliedVersions = new Set(appliedMigrations.map(m => m.version));

        // Apply pending migrations
        for (const migration of MIGRATIONS) {
            if (!appliedVersions.has(migration.version)) {
                console.log(`[DatabaseManager] Applying migration: ${migration.name}`);

                try {
                    // Execute migration SQL
                    await this.db.execAsync(migration.sql);

                    // Record migration
                    await this.db.runAsync(
                        'INSERT INTO migrations (version, name) VALUES (?, ?)',
                        migration.version,
                        migration.name
                    );

                    console.log(`[DatabaseManager] Migration ${migration.name} applied successfully`);
                } catch (error) {
                    console.error(`[DatabaseManager] Failed to apply migration ${migration.name}:`, error);
                    throw error;
                }
            }
        }
    }

    /**
     * Close the database connection.
     */
    async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
            this.initialized = false;
            console.log('[DatabaseManager] Database closed');
        }
    }

    /**
     * Reset the database (for testing/development).
     * WARNING: This will delete all data.
     */
    async reset(): Promise<void> {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        // Drop all tables
        await this.db.execAsync(`
            DROP TABLE IF EXISTS annotations;
            DROP TABLE IF EXISTS recordings;
            DROP TABLE IF EXISTS clinical_data;
            DROP TABLE IF EXISTS clinical_sessions;
            DROP TABLE IF EXISTS migrations;
        `);

        console.log('[DatabaseManager] Database reset complete');

        // Re-run migrations
        await this.runMigrations();
    }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
