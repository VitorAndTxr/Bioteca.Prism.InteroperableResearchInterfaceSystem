/**
 * Sync Service Tests
 *
 * Unit tests for SyncService functionality.
 *
 * Run with: npm test src/services/SyncService.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncService } from './SyncService';
import { SessionRepository } from '../data/repositories/SessionRepository';
import { RecordingRepository } from '../data/repositories/RecordingRepository';
import { AnnotationRepository } from '../data/repositories/AnnotationRepository';

// Mock repositories
vi.mock('../data/repositories/SessionRepository');
vi.mock('../data/repositories/RecordingRepository');
vi.mock('../data/repositories/AnnotationRepository');

describe('SyncService', () => {
    let syncService: SyncService;
    let sessionRepo: SessionRepository;
    let recordingRepo: RecordingRepository;
    let annotationRepo: AnnotationRepository;

    beforeEach(() => {
        sessionRepo = new SessionRepository();
        recordingRepo = new RecordingRepository();
        annotationRepo = new AnnotationRepository();
        syncService = new SyncService(sessionRepo, recordingRepo, annotationRepo);
    });

    afterEach(() => {
        syncService.stop();
        vi.clearAllMocks();
    });

    describe('start/stop', () => {
        it('should start periodic sync', () => {
            expect(syncService.isRunning()).toBe(false);
            syncService.start(1000);
            expect(syncService.isRunning()).toBe(true);
        });

        it('should stop periodic sync', () => {
            syncService.start(1000);
            expect(syncService.isRunning()).toBe(true);
            syncService.stop();
            expect(syncService.isRunning()).toBe(false);
        });

        it('should not start if already running', () => {
            syncService.start(1000);
            const consoleSpy = vi.spyOn(console, 'log');
            syncService.start(1000);
            expect(consoleSpy).toHaveBeenCalledWith('[SyncService] Already running');
        });
    });

    describe('syncAll', () => {
        it('should return empty report when no pending items', async () => {
            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([]);
            vi.spyOn(recordingRepo, 'getPending').mockResolvedValue([]);
            vi.spyOn(annotationRepo, 'getPending').mockResolvedValue([]);

            const report = await syncService.syncAll();

            expect(report.sessions.synced).toBe(0);
            expect(report.recordings.synced).toBe(0);
            expect(report.annotations.synced).toBe(0);
        });

        it('should sync pending sessions', async () => {
            const mockSession = {
                id: 'session-1',
                volunteerId: 'vol-1',
                researcherId: 'res-1',
                startedAt: new Date().toISOString(),
                durationSeconds: 0,
                syncStatus: 'pending' as const,
                createdAt: new Date().toISOString()
            };

            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([mockSession]);
            vi.spyOn(sessionRepo, 'update').mockResolvedValue(undefined);
            vi.spyOn(recordingRepo, 'getPending').mockResolvedValue([]);
            vi.spyOn(annotationRepo, 'getPending').mockResolvedValue([]);

            const report = await syncService.syncAll();

            expect(report.sessions.synced).toBe(1);
            expect(sessionRepo.update).toHaveBeenCalledWith('session-1', { syncStatus: 'synced' });
        });

        it('should prevent concurrent sync', async () => {
            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([]);
            vi.spyOn(recordingRepo, 'getPending').mockResolvedValue([]);
            vi.spyOn(annotationRepo, 'getPending').mockResolvedValue([]);

            // Start first sync
            const promise1 = syncService.syncAll();

            // Try to start second sync immediately
            const promise2 = syncService.syncAll();

            const [report1, report2] = await Promise.all([promise1, promise2]);

            // Second sync should return empty report (skipped)
            expect(report2.sessions.synced).toBe(0);
        });
    });

    describe('error handling', () => {
        it('should handle sync errors gracefully', async () => {
            const mockSession = {
                id: 'session-1',
                volunteerId: 'vol-1',
                researcherId: 'res-1',
                startedAt: new Date().toISOString(),
                durationSeconds: 0,
                syncStatus: 'pending' as const,
                createdAt: new Date().toISOString()
            };

            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([mockSession]);
            vi.spyOn(sessionRepo, 'update').mockRejectedValue(new Error('Network error'));
            vi.spyOn(recordingRepo, 'getPending').mockResolvedValue([]);
            vi.spyOn(annotationRepo, 'getPending').mockResolvedValue([]);

            const consoleSpy = vi.spyOn(console, 'error');

            const report = await syncService.syncAll();

            expect(report.sessions.failed).toBe(1);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Session sync failed'),
                expect.any(Error)
            );
        });
    });
});
