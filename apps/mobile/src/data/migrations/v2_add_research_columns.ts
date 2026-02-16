/**
 * Migration v2: Add research_id and research_title columns to clinical_sessions.
 *
 * Supports linking a clinical session to a specific research project for sync.
 */

export const v2_add_research_columns = `
    ALTER TABLE clinical_sessions ADD COLUMN research_id TEXT;
    ALTER TABLE clinical_sessions ADD COLUMN research_title TEXT;
`;
