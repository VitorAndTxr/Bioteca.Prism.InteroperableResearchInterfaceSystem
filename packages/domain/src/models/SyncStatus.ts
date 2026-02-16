/**
 * Sync Status Type
 *
 * Represents the synchronization state of local data with the Research Node backend.
 */

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

/**
 * Sync Queue Item
 *
 * Represents an entity waiting to be synced with the backend.
 * Used for tracking retry state in the optimistic push protocol.
 */
export interface SyncQueueItem {
    entityType: 'session' | 'recording' | 'annotation';
    entityId: string;
    retryCount: number;
    lastAttempt: string | null;
    errorReason: string | null;
}
