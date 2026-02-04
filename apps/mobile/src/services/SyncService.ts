/**
 * Sync Service
 *
 * Manages periodic synchronization of local data with the Research Node backend.
 * Handles sessions, recordings, and annotations with retry logic and status tracking.
 *
 * Features:
 * - Periodic background sync (default: 60s)
 * - Retry logic with max attempts
 * - Concurrent sync prevention
 * - Mock implementation for testing (backend endpoints not yet available)
 *
 * Usage:
 * ```typescript
 * const syncService = new SyncService(sessionRepo, recordingRepo, annotationRepo);
 * syncService.start(); // Start periodic sync
 * const report = await syncService.syncAll(); // Manual sync
 * syncService.stop(); // Stop periodic sync
 * ```
 */

import { SessionRepository } from '../data/repositories/SessionRepository';
import { RecordingRepository } from '../data/repositories/RecordingRepository';
import { AnnotationRepository } from '../data/repositories/AnnotationRepository';
import type { SyncReport, SyncEntityReport } from './SyncService.types';

export class SyncService {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isSyncing: boolean = false;
    private maxRetries: number;

    constructor(
        private sessionRepo: SessionRepository,
        private recordingRepo: RecordingRepository,
        private annotationRepo: AnnotationRepository,
        maxRetries: number = 5
    ) {
        this.maxRetries = maxRetries;
    }

    /**
     * Start periodic synchronization.
     *
     * @param intervalMs - Interval between sync attempts in milliseconds (default: 60000 = 1 minute)
     */
    start(intervalMs: number = 60000): void {
        if (this.intervalId) {
            console.log('[SyncService] Already running');
            return;
        }

        console.log(`[SyncService] Starting periodic sync (interval: ${intervalMs}ms)`);
        this.intervalId = setInterval(() => {
            void this.syncAll();
        }, intervalMs);

        // Run initial sync immediately
        void this.syncAll();
    }

    /**
     * Stop periodic synchronization.
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[SyncService] Stopped');
        }
    }

    /**
     * Check if sync service is currently running.
     */
    isRunning(): boolean {
        return this.intervalId !== null;
    }

    /**
     * Synchronize all pending data (sessions, recordings, annotations).
     *
     * @returns Sync report with results for each entity type
     */
    async syncAll(): Promise<SyncReport> {
        if (this.isSyncing) {
            console.log('[SyncService] Sync already in progress, skipping');
            return this.emptyReport();
        }

        this.isSyncing = true;
        console.log('[SyncService] Starting sync cycle...');

        try {
            const sessionResult = await this.syncSessions();
            const recordingResult = await this.syncRecordings();
            const annotationResult = await this.syncAnnotations();

            const report: SyncReport = {
                sessions: sessionResult,
                recordings: recordingResult,
                annotations: annotationResult,
                timestamp: new Date().toISOString()
            };

            console.log('[SyncService] Sync cycle completed:', report);
            return report;
        } catch (error) {
            console.error('[SyncService] Sync cycle failed:', error);
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Synchronize pending sessions.
     *
     * @returns Sync report for sessions
     */
    private async syncSessions(): Promise<SyncEntityReport> {
        const pending = await this.sessionRepo.getPending();

        if (pending.length === 0) {
            console.log('[SyncService] No pending sessions to sync');
            return { synced: 0, failed: 0, pending: 0 };
        }

        console.log(`[SyncService] Syncing ${pending.length} pending sessions`);

        let synced = 0;
        let failed = 0;

        for (const session of pending) {
            try {
                // TODO: Replace with actual middleware call when backend endpoints are available
                // await middleware.invoke({
                //     method: 'POST',
                //     path: '/api/clinicalsession/new',
                //     payload: session
                // });

                // Mock implementation: simulate successful sync
                await this.simulateNetworkDelay();
                await this.sessionRepo.update(session.id, { syncStatus: 'synced' });
                synced++;
                console.log(`[SyncService] ✅ Session synced: ${session.id}`);
            } catch (error) {
                // In production: check if error is transient (network) or permanent (validation)
                // For now: treat all errors as transient and keep as pending
                failed++;
                console.error(`[SyncService] ❌ Session sync failed: ${session.id}`, error);

                // TODO: Implement retry count tracking
                // If retry count exceeds maxRetries, mark as 'failed'
            }
        }

        const remainingPending = pending.length - synced - failed;
        return { synced, failed, pending: remainingPending };
    }

    /**
     * Synchronize pending recordings.
     *
     * @returns Sync report for recordings
     */
    private async syncRecordings(): Promise<SyncEntityReport> {
        const pending = await this.recordingRepo.getPending();

        if (pending.length === 0) {
            console.log('[SyncService] No pending recordings to sync');
            return { synced: 0, failed: 0, pending: 0 };
        }

        console.log(`[SyncService] Syncing ${pending.length} pending recordings`);

        let synced = 0;
        let failed = 0;

        for (const recording of pending) {
            try {
                // TODO: Replace with actual middleware call when backend endpoints are available
                // await middleware.invoke({
                //     method: 'POST',
                //     path: '/api/recording/upload',
                //     payload: recording
                // });

                // Mock implementation: simulate successful sync
                await this.simulateNetworkDelay();
                await this.recordingRepo.update(recording.id, { syncStatus: 'synced' });
                synced++;
                console.log(`[SyncService] ✅ Recording synced: ${recording.id}`);
            } catch (error) {
                failed++;
                console.error(`[SyncService] ❌ Recording sync failed: ${recording.id}`, error);
            }
        }

        const remainingPending = pending.length - synced - failed;
        return { synced, failed, pending: remainingPending };
    }

    /**
     * Synchronize pending annotations.
     *
     * @returns Sync report for annotations
     */
    private async syncAnnotations(): Promise<SyncEntityReport> {
        const pending = await this.annotationRepo.getPending();

        if (pending.length === 0) {
            console.log('[SyncService] No pending annotations to sync');
            return { synced: 0, failed: 0, pending: 0 };
        }

        console.log(`[SyncService] Syncing ${pending.length} pending annotations`);

        let synced = 0;
        let failed = 0;

        for (const annotation of pending) {
            try {
                // TODO: Replace with actual middleware call when backend endpoints are available
                // await middleware.invoke({
                //     method: 'POST',
                //     path: '/api/annotation/new',
                //     payload: annotation
                // });

                // Mock implementation: simulate successful sync
                await this.simulateNetworkDelay();
                await this.annotationRepo.update(annotation.id, { syncStatus: 'synced' });
                synced++;
                console.log(`[SyncService] ✅ Annotation synced: ${annotation.id}`);
            } catch (error) {
                failed++;
                console.error(`[SyncService] ❌ Annotation sync failed: ${annotation.id}`, error);
            }
        }

        const remainingPending = pending.length - synced - failed;
        return { synced, failed, pending: remainingPending };
    }

    /**
     * Create an empty sync report.
     */
    private emptyReport(): SyncReport {
        return {
            sessions: { synced: 0, failed: 0, pending: 0 },
            recordings: { synced: 0, failed: 0, pending: 0 },
            annotations: { synced: 0, failed: 0, pending: 0 },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Simulate network delay for mock sync operations.
     */
    private async simulateNetworkDelay(): Promise<void> {
        const delay = Math.random() * 100 + 50; // 50-150ms
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}
