/**
 * Database Migration v1: Initial Schema
 *
 * Creates the initial database schema for clinical data persistence:
 * - clinical_sessions: Research sessions with volunteers
 * - clinical_data: Clinical context (body structure, laterality, topography)
 * - recordings: sEMG data recordings
 * - annotations: Session annotations
 */

export const v1_initial = `
-- Clinical Sessions Table
-- Stores research sessions with volunteers, including timing, researcher assignment, and sync status
CREATE TABLE IF NOT EXISTS clinical_sessions (
    id TEXT PRIMARY KEY,
    volunteer_id TEXT NOT NULL,
    volunteer_name TEXT,
    researcher_id TEXT NOT NULL,
    device_id TEXT,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    duration_seconds INTEGER DEFAULT 0,
    sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('synced','pending','failed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Clinical Data Table
-- Stores clinical context for sessions: body structure (SNOMED CT), laterality, topography
CREATE TABLE IF NOT EXISTS clinical_data (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    body_structure_snomed_code TEXT NOT NULL,
    body_structure_name TEXT NOT NULL,
    laterality TEXT NOT NULL CHECK(laterality IN ('left','right','bilateral')),
    topography_codes TEXT DEFAULT '[]',
    topography_names TEXT DEFAULT '[]'
);

-- Recordings Table
-- Stores sEMG data recordings with metadata (duration, sample count, data type, sample rate)
CREATE TABLE IF NOT EXISTS recordings (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    sample_count INTEGER DEFAULT 0,
    data_type TEXT DEFAULT 'raw' CHECK(data_type IN ('raw','filtered','rms')),
    sample_rate INTEGER DEFAULT 215,
    sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('synced','pending','failed')),
    file_path TEXT,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Annotations Table
-- Stores text annotations for sessions (researcher observations, notes, context)
CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('synced','pending','failed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_sessions_researcher ON clinical_sessions(researcher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_sync ON clinical_sessions(sync_status);
CREATE INDEX IF NOT EXISTS idx_recordings_session ON recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_annotations_session ON annotations(session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_data_session ON clinical_data(session_id);
`;
