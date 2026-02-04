/**
 * Sync Service Types
 *
 * Type definitions for data synchronization with Research Node backend.
 */

/**
 * Sync Report
 *
 * Summary of synchronization results for all entity types.
 */
export interface SyncReport {
    sessions: SyncEntityReport;
    recordings: SyncEntityReport;
    annotations: SyncEntityReport;
    timestamp: string;
}

/**
 * Sync Entity Report
 *
 * Synchronization results for a single entity type.
 */
export interface SyncEntityReport {
    synced: number;
    failed: number;
    pending: number;
}

/**
 * Sync Options
 *
 * Configuration for sync service behavior.
 */
export interface SyncOptions {
    intervalMs?: number;
    maxRetries?: number;
    enabled?: boolean;
}

/**
 * Sync Status Event
 *
 * Event emitted during sync operations.
 */
export interface SyncStatusEvent {
    type: 'started' | 'completed' | 'error';
    report?: SyncReport;
    error?: Error;
}
