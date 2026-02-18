/**
 * Migration v5: Add blob_url column to recordings table
 *
 * Separates remote blob storage URLs from local filesystem paths.
 * After sync, file_path is cleared to NULL and blob_url holds the remote URL.
 *
 * The retroactive UPDATE repairs recordings that were synced under the old
 * behavior where SyncService overwrote file_path with the blob URL.
 */

export const v5_add_blob_url = `
ALTER TABLE recordings ADD COLUMN blob_url TEXT DEFAULT NULL;

UPDATE recordings
   SET blob_url = file_path, file_path = NULL
 WHERE file_path LIKE 'http://%' OR file_path LIKE 'https://%';
`;
