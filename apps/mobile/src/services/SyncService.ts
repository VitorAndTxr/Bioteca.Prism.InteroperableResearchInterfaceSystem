/**
 * Sync Service
 *
 * Manages periodic synchronization of local data with the Research Node backend.
 * Handles sessions, recordings, and annotations with retry logic and status tracking.
 *
 * Features:
 * - Periodic background sync (default: 60s)
 * - Exponential backoff retry with jitter
 * - Concurrent sync prevention via isSyncing mutex
 * - Dependency ordering: sessions -> recordings -> annotations
 * - Two-step recording sync: metadata POST + file upload
 *
 * Implements US-MI-005 through US-MI-009, US-MI-019.
 */

import * as FileSystem from 'expo-file-system';
import { SessionRepository } from '../data/repositories/SessionRepository';
import { RecordingRepository } from '../data/repositories/RecordingRepository';
import { AnnotationRepository } from '../data/repositories/AnnotationRepository';
import { middleware } from './middleware';
import {
    mapToCreateSessionPayload,
    mapToCreateRecordingPayload,
    mapToCreateAnnotationPayload,
    buildUploadPayload,
} from './SyncService.mappers';
import type { SyncReport, SyncEntityReport } from './SyncService.types';

// In-memory retry tracking (V1 — no SQLite migration for retry_count)
const retryTracker = new Map<string, number>();

function getRetryCount(entityId: string): number {
    return retryTracker.get(entityId) ?? 0;
}

function incrementRetry(entityId: string): number {
    const count = getRetryCount(entityId) + 1;
    retryTracker.set(entityId, count);
    return count;
}

function resetRetry(entityId: string): void {
    retryTracker.delete(entityId);
}

/**
 * Determine whether an error is transient (worth retrying).
 * 4xx errors (except 408/429) are permanent. Everything else is transient.
 */
function isTransientError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 408 || status === 429) return true;
        if (status >= 400 && status < 500) return false;
    }
    return true;
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'status' in error) {
        const e = error as { status?: number; message?: string };
        return `${e.status ?? 'unknown'}: ${e.message ?? 'Unknown error'}`;
    }
    return String(error);
}

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
     * Synchronize all pending data with dependency ordering:
     * sessions first, then recordings, then annotations.
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

            console.log('[SyncService] Sync cycle completed:', JSON.stringify(report));
            return report;
        } catch (error) {
            console.error('[SyncService] Sync cycle failed:', error);
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Synchronize pending sessions via POST /api/ClinicalSession/New.
     * The backend performs upsert on client-generated UUID (idempotent).
     */
    private async syncSessions(): Promise<SyncEntityReport> {
        const pending = await this.sessionRepo.getPending();

        if (pending.length === 0) {
            return { synced: 0, failed: 0, pending: 0 };
        }

        console.log(`[SyncService] Syncing ${pending.length} pending sessions`);

        let synced = 0;
        let failed = 0;
        const errorDetails: Array<{ entityId: string; error: string }> = [];

        for (const session of pending) {
            try {
                const clinicalData = await this.sessionRepo.getClinicalData(session.id);
                if (!clinicalData) {
                    console.warn(`[SyncService] No clinical data for session ${session.id}, skipping`);
                    continue;
                }

                const payload = mapToCreateSessionPayload(session, clinicalData);

                await this.retryWithBackoff(
                    () => middleware.invoke<Record<string, unknown>, unknown>({
                        method: 'POST',
                        path: '/api/ClinicalSession/New',
                        payload: { ...payload },
                    }),
                    session.id,
                    'session'
                );

                await this.sessionRepo.update(session.id, { syncStatus: 'synced' });
                resetRetry(session.id);
                synced++;
                console.log(`[SyncService] Session synced: ${session.id}`);
            } catch (error) {
                failed++;
                const errorMsg = extractErrorMessage(error);
                errorDetails.push({ entityId: session.id, error: errorMsg });
                await this.sessionRepo.update(session.id, { syncStatus: 'failed' });
                console.error(`[SyncService] Session sync failed: ${session.id}`, errorMsg);
            }
        }

        const remainingPending = pending.length - synced - failed;
        return { synced, failed, pending: remainingPending, errorDetails: errorDetails.length > 0 ? errorDetails : undefined };
    }

    /**
     * Synchronize pending recordings via two-step process:
     * 1. POST /api/ClinicalSession/{sid}/recordings/New (metadata)
     * 2. POST /api/Upload/recording (base64 file upload)
     *
     * Only processes recordings whose parent session is already synced.
     */
    private async syncRecordings(): Promise<SyncEntityReport> {
        const pending = await this.recordingRepo.getPendingWithSyncedParent();

        if (pending.length === 0) {
            return { synced: 0, failed: 0, pending: 0 };
        }

        console.log(`[SyncService] Syncing ${pending.length} pending recordings`);

        let synced = 0;
        let failed = 0;
        const errorDetails: Array<{ entityId: string; error: string }> = [];

        for (const recording of pending) {
            try {
                await this.retryWithBackoff(
                    async () => {
                        // Step 1: Create recording metadata
                        const recPayload = mapToCreateRecordingPayload(recording);
                        await middleware.invoke<Record<string, unknown>, unknown>({
                            method: 'POST',
                            path: `/api/ClinicalSession/${recording.sessionId}/recordings/New`,
                            payload: { ...recPayload },
                        });

                        // Step 2: Upload file if a local file path exists
                        if (recording.filePath) {
                            const fileInfo = await FileSystem.getInfoAsync(recording.filePath);
                            if (fileInfo.exists && 'size' in fileInfo) {
                                const base64Content = await FileSystem.readAsStringAsync(
                                    recording.filePath,
                                    { encoding: FileSystem.EncodingType.Base64 }
                                );
                                const uploadPayload = buildUploadPayload(
                                    recording,
                                    recording.sessionId,
                                    base64Content,
                                    fileInfo.size
                                );
                                const uploadResponse = await middleware.invoke<Record<string, unknown>, { fileUrl?: string }>({
                                    method: 'POST',
                                    path: '/api/Upload/recording',
                                    payload: { ...uploadPayload },
                                });

                                // Update local recording with returned fileUrl
                                if (uploadResponse.fileUrl) {
                                    await this.recordingRepo.update(recording.id, { filePath: uploadResponse.fileUrl });
                                }
                            }
                        }
                    },
                    recording.id,
                    'recording'
                );

                await this.recordingRepo.update(recording.id, { syncStatus: 'synced' });
                resetRetry(recording.id);
                synced++;
                console.log(`[SyncService] Recording synced: ${recording.id}`);
            } catch (error) {
                failed++;
                const errorMsg = extractErrorMessage(error);
                errorDetails.push({ entityId: recording.id, error: errorMsg });
                await this.recordingRepo.update(recording.id, { syncStatus: 'failed' });
                console.error(`[SyncService] Recording sync failed: ${recording.id}`, errorMsg);
            }
        }

        const remainingPending = pending.length - synced - failed;
        return { synced, failed, pending: remainingPending, errorDetails: errorDetails.length > 0 ? errorDetails : undefined };
    }

    /**
     * Synchronize pending annotations via POST /api/ClinicalSession/{sid}/annotations/New.
     * Only processes annotations whose parent session is already synced (client-side filter).
     */
    private async syncAnnotations(): Promise<SyncEntityReport> {
        const allPending = await this.annotationRepo.getPending();

        if (allPending.length === 0) {
            return { synced: 0, failed: 0, pending: 0 };
        }

        // Client-side filter: only sync annotations whose parent session is synced
        const syncedSessionIds = new Set<string>();
        for (const annotation of allPending) {
            if (!syncedSessionIds.has(annotation.sessionId)) {
                const session = await this.sessionRepo.getById(annotation.sessionId);
                if (session && session.syncStatus === 'synced') {
                    syncedSessionIds.add(annotation.sessionId);
                }
            }
        }

        const pending = allPending.filter(a => syncedSessionIds.has(a.sessionId));

        if (pending.length === 0) {
            return { synced: 0, failed: 0, pending: allPending.length };
        }

        console.log(`[SyncService] Syncing ${pending.length} pending annotations`);

        let synced = 0;
        let failed = 0;
        const errorDetails: Array<{ entityId: string; error: string }> = [];

        for (const annotation of pending) {
            try {
                const payload = mapToCreateAnnotationPayload(annotation);

                await this.retryWithBackoff(
                    () => middleware.invoke<Record<string, unknown>, unknown>({
                        method: 'POST',
                        path: `/api/ClinicalSession/${annotation.sessionId}/annotations/New`,
                        payload: { ...payload },
                    }),
                    annotation.id,
                    'annotation'
                );

                await this.annotationRepo.update(annotation.id, { syncStatus: 'synced' });
                resetRetry(annotation.id);
                synced++;
                console.log(`[SyncService] Annotation synced: ${annotation.id}`);
            } catch (error) {
                failed++;
                const errorMsg = extractErrorMessage(error);
                errorDetails.push({ entityId: annotation.id, error: errorMsg });
                await this.annotationRepo.update(annotation.id, { syncStatus: 'failed' });
                console.error(`[SyncService] Annotation sync failed: ${annotation.id}`, errorMsg);
            }
        }

        const remainingPending = allPending.length - synced - failed;
        return { synced, failed, pending: remainingPending, errorDetails: errorDetails.length > 0 ? errorDetails : undefined };
    }

    /**
     * Exponential backoff retry with jitter.
     * Formula: min(1000 * 2^attempt + jitter, 300000ms)
     * Permanent errors (4xx) fail immediately without retrying.
     */
    private async retryWithBackoff<T>(
        fn: () => Promise<T>,
        entityId: string,
        entityType: string
    ): Promise<T> {
        const BASE_DELAY = 1000;
        const MAX_DELAY = 300_000;
        const MAX_JITTER = 500;

        let lastError: unknown;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Permanent error — no retry
                if (!isTransientError(error)) {
                    console.error(`[SyncService] Permanent error for ${entityType} ${entityId}:`, error);
                    throw error;
                }

                const currentRetry = incrementRetry(entityId);

                if (attempt < this.maxRetries) {
                    const jitter = Math.random() * MAX_JITTER;
                    const delay = Math.min(BASE_DELAY * Math.pow(2, attempt) + jitter, MAX_DELAY);
                    console.log(`[SyncService] Retrying ${entityType} ${entityId} (attempt ${currentRetry}/${this.maxRetries}, delay ${Math.round(delay)}ms)`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    /**
     * Reset retry state for a specific entity (used by retry button).
     */
    resetEntityRetry(entityId: string): void {
        resetRetry(entityId);
    }

    private emptyReport(): SyncReport {
        return {
            sessions: { synced: 0, failed: 0, pending: 0 },
            recordings: { synced: 0, failed: 0, pending: 0 },
            annotations: { synced: 0, failed: 0, pending: 0 },
            timestamp: new Date().toISOString()
        };
    }
}
