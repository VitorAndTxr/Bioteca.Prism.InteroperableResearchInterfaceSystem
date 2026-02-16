/**
 * Migration v3: Relax laterality NOT NULL constraint
 *
 * SQLite does not support ALTER TABLE ... ALTER COLUMN, so the entire
 * clinical_data table must be rebuilt to change the CHECK constraint.
 *
 * Wrapped in a transaction per TL note N2 for crash safety.
 */

export const v3_relax_laterality_constraint = `
BEGIN TRANSACTION;

-- Step 1: Create temporary table with relaxed constraint
CREATE TABLE clinical_data_new (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES clinical_sessions(id) ON DELETE CASCADE,
    body_structure_snomed_code TEXT NOT NULL,
    body_structure_name TEXT NOT NULL,
    laterality TEXT CHECK(laterality IS NULL OR laterality IN ('left','right','bilateral')),
    topography_codes TEXT DEFAULT '[]',
    topography_names TEXT DEFAULT '[]'
);

-- Step 2: Copy all existing data (preserves non-null laterality values)
INSERT INTO clinical_data_new SELECT * FROM clinical_data;

-- Step 3: Drop original table
DROP TABLE clinical_data;

-- Step 4: Rename new table
ALTER TABLE clinical_data_new RENAME TO clinical_data;

-- Step 5: Recreate the index
CREATE INDEX IF NOT EXISTS idx_clinical_data_session ON clinical_data(session_id);

COMMIT;
`;
