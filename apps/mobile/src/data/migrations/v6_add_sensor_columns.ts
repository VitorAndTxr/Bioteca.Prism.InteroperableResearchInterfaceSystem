/**
 * Migration v6: Add sensor columns to session_favorites table
 *
 * Adds sensor_ids and sensor_names JSON columns to store sensor selections
 * as part of saved session configuration favorites.
 *
 * Existing rows default to empty arrays, preserving all prior data.
 */

export const v6_add_sensor_columns = `
ALTER TABLE session_favorites ADD COLUMN sensor_ids TEXT DEFAULT '[]';
ALTER TABLE session_favorites ADD COLUMN sensor_names TEXT DEFAULT '[]';
`;
