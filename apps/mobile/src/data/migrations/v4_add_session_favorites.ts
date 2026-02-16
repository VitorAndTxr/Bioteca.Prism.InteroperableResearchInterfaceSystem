/**
 * Migration v4: Add session_favorites table
 *
 * Creates a local-only table for storing named session configuration presets.
 * Favorites are independent of clinical data tables (no foreign keys).
 */

export const v4_add_session_favorites = `
CREATE TABLE IF NOT EXISTS session_favorites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    body_structure_snomed_code TEXT NOT NULL,
    body_structure_name TEXT NOT NULL,
    topography_codes TEXT DEFAULT '[]',
    topography_names TEXT DEFAULT '[]',
    topography_categories TEXT DEFAULT '[]',
    device_id TEXT,
    laterality TEXT,
    research_id TEXT,
    research_title TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_session_favorites_name ON session_favorites(name);
`;
