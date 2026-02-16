/**
 * Sync Service Tests
 *
 * Unit tests for SyncService functionality including middleware.invoke() calls,
 * dependency ordering, retry logic, and error classification.
 *
 * Run with: npm test src/services/SyncService.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncService } from './SyncService';
import type { SessionRepository } from '../data/repositories/SessionRepository';
import type { RecordingRepository } from '../data/repositories/RecordingRepository';
import type { AnnotationRepository } from '../data/repositories/AnnotationRepository';

// Mock middleware module
const mockInvoke = vi.fn().mockResolvedValue({});
vi.mock('./middleware', () => ({
    middleware: {
        invoke: (...args: unknown[]) => mockInvoke(...args),
    },
}));

// Mock expo-file-system
vi.mock('expo-file-system', () => ({
    getInfoAsync: vi.fn().mockResolvedValue({ exists: true, size: 1024 }),
    readAsStringAsync: vi.fn().mockResolvedValue('bW9ja2Jhc2U2NA=='),
    EncodingType: { Base64: 'base64' },
}));

// Mock mapper functions (they are pure and tested separately if needed)
vi.mock('./SyncService.mappers', () => ({
    mapToCreateSessionPayload: vi.fn((_session: unknown, _data: unknown) => ({
        Id: 'session-1',
        ResearchId: null,
        VolunteerId: 'vol-1',
        ClinicalContext: '{}',
        StartAt: '2026-01-01T00:00:00Z',
        FinishedAt: null,
    })),
    mapToCreateRecordingPayload: vi.fn((_recording: unknown) => ({
        Id: 'rec-1',
        SignalType: 'sEMG',
        SamplingRate: 215,
        SamplesCount: 1000,
        FileUrl: '',
        CollectionDate: '2026-01-01T00:00:00Z',
        SensorId: null,
    })),
    mapToCreateAnnotationPayload: vi.fn((_annotation: unknown) => ({
        Id: 'ann-1',
        Text: 'Test annotation',
        CreatedAt: '2026-01-01T00:00:00Z',
    })),
    buildUploadPayload: vi.fn(() => ({
        RecordingId: 'rec-1',
        SessionId: 'session-1',
        FileName: 'recording.csv',
        ContentType: 'text/csv',
        FileData: 'bW9ja2Jhc2U2NA==',
        FileSizeBytes: 1024,
    })),
}));

function createMockSessionRepo(): SessionRepository {
    return {
        getPending: vi.fn().mockResolvedValue([]),
        getClinicalData: vi.fn().mockResolvedValue({
            bodyStructureSnomedCode: '12345',
            bodyStructureName: 'Biceps',
            laterality: 'left',
            topographyCodes: [],
            topographyNames: [],
        }),
        getById: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(undefined),
    } as unknown as SessionRepository;
}

function createMockRecordingRepo(): RecordingRepository {
    return {
        getPendingWithSyncedParent: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue(undefined),
    } as unknown as RecordingRepository;
}

function createMockAnnotationRepo(): AnnotationRepository {
    return {
        getPending: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue(undefined),
    } as unknown as AnnotationRepository;
}

const mockSession = {
    id: 'session-1',
    volunteerId: 'vol-1',
    researcherId: 'res-1',
    startedAt: '2026-01-01T00:00:00Z',
    durationSeconds: 0,
    syncStatus: 'pending' as const,
    createdAt: '2026-01-01T00:00:00Z',
};

const mockRecording = {
    id: 'rec-1',
    sessionId: 'session-1',
    dataType: 'sEMG',
    sampleRate: 215,
    sampleCount: 1000,
    filePath: '/data/recording.csv',
    filename: 'recording.csv',
    recordedAt: '2026-01-01T00:00:00Z',
    syncStatus: 'pending' as const,
    createdAt: '2026-01-01T00:00:00Z',
};

const mockAnnotation = {
    id: 'ann-1',
    sessionId: 'session-1',
    text: 'Test annotation',
    createdAt: '2026-01-01T00:00:00Z',
    syncStatus: 'pending' as const,
};

describe('SyncService', () => {
    let syncService: SyncService;
    let sessionRepo: SessionRepository;
    let recordingRepo: RecordingRepository;
    let annotationRepo: AnnotationRepository;

    beforeEach(() => {
        sessionRepo = createMockSessionRepo();
        recordingRepo = createMockRecordingRepo();
        annotationRepo = createMockAnnotationRepo();
        // maxRetries=0 to avoid retry delays in tests
        syncService = new SyncService(sessionRepo, recordingRepo, annotationRepo, 0);
        mockInvoke.mockResolvedValue({});
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
            const report = await syncService.syncAll();

            expect(report.sessions.synced).toBe(0);
            expect(report.recordings.synced).toBe(0);
            expect(report.annotations.synced).toBe(0);
        });

        it('should sync pending sessions via middleware.invoke()', async () => {
            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([mockSession]);

            const report = await syncService.syncAll();

            expect(report.sessions.synced).toBe(1);
            expect(sessionRepo.getClinicalData).toHaveBeenCalledWith('session-1');
            expect(mockInvoke).toHaveBeenCalledWith(expect.objectContaining({
                method: 'POST',
                path: '/api/ClinicalSession/New',
            }));
            expect(sessionRepo.update).toHaveBeenCalledWith('session-1', { syncStatus: 'synced' });
        });

        it('should skip session if no clinical data found', async () => {
            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([mockSession]);
            vi.spyOn(sessionRepo, 'getClinicalData').mockResolvedValue(null);

            const report = await syncService.syncAll();

            expect(report.sessions.synced).toBe(0);
            expect(report.sessions.failed).toBe(0);
            expect(mockInvoke).not.toHaveBeenCalled();
        });

        it('should sync recordings with two-step process', async () => {
            vi.spyOn(recordingRepo, 'getPendingWithSyncedParent').mockResolvedValue([mockRecording]);

            const report = await syncService.syncAll();

            expect(report.recordings.synced).toBe(1);
            // Step 1: metadata POST
            expect(mockInvoke).toHaveBeenCalledWith(expect.objectContaining({
                method: 'POST',
                path: '/api/ClinicalSession/session-1/recordings/New',
            }));
            // Step 2: file upload
            expect(mockInvoke).toHaveBeenCalledWith(expect.objectContaining({
                method: 'POST',
                path: '/api/Upload/recording',
            }));
            expect(recordingRepo.update).toHaveBeenCalledWith('rec-1', { syncStatus: 'synced' });
        });

        it('should sync annotations only when parent session is synced', async () => {
            vi.spyOn(annotationRepo, 'getPending').mockResolvedValue([mockAnnotation]);
            vi.spyOn(sessionRepo, 'getById').mockResolvedValue({
                ...mockSession,
                syncStatus: 'synced',
            });

            const report = await syncService.syncAll();

            expect(report.annotations.synced).toBe(1);
            expect(mockInvoke).toHaveBeenCalledWith(expect.objectContaining({
                method: 'POST',
                path: '/api/ClinicalSession/session-1/annotations/New',
            }));
            expect(annotationRepo.update).toHaveBeenCalledWith('ann-1', { syncStatus: 'synced' });
        });

        it('should not sync annotations when parent session is still pending', async () => {
            vi.spyOn(annotationRepo, 'getPending').mockResolvedValue([mockAnnotation]);
            vi.spyOn(sessionRepo, 'getById').mockResolvedValue({
                ...mockSession,
                syncStatus: 'pending',
            });

            const report = await syncService.syncAll();

            expect(report.annotations.synced).toBe(0);
            expect(report.annotations.pending).toBe(1);
        });

        it('should prevent concurrent sync', async () => {
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
        it('should mark session as failed on permanent error (4xx)', async () => {
            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([mockSession]);
            mockInvoke.mockRejectedValue({ status: 400, message: 'Bad Request' });

            const report = await syncService.syncAll();

            expect(report.sessions.failed).toBe(1);
            expect(report.sessions.errorDetails).toEqual([
                { entityId: 'session-1', error: '400: Bad Request' },
            ]);
            expect(sessionRepo.update).toHaveBeenCalledWith('session-1', { syncStatus: 'failed' });
        });

        it('should mark session as failed on transient error when maxRetries=0', async () => {
            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([mockSession]);
            mockInvoke.mockRejectedValue(new Error('Network error'));

            const report = await syncService.syncAll();

            expect(report.sessions.failed).toBe(1);
            expect(sessionRepo.update).toHaveBeenCalledWith('session-1', { syncStatus: 'failed' });
        });

        it('should mark recording as failed on middleware error', async () => {
            vi.spyOn(recordingRepo, 'getPendingWithSyncedParent').mockResolvedValue([mockRecording]);
            mockInvoke.mockRejectedValue({ status: 422, message: 'Validation error' });

            const report = await syncService.syncAll();

            expect(report.recordings.failed).toBe(1);
            expect(recordingRepo.update).toHaveBeenCalledWith('rec-1', { syncStatus: 'failed' });
        });

        it('should continue syncing other entities after one fails', async () => {
            vi.spyOn(sessionRepo, 'getPending').mockResolvedValue([mockSession]);
            vi.spyOn(annotationRepo, 'getPending').mockResolvedValue([mockAnnotation]);
            vi.spyOn(sessionRepo, 'getById').mockResolvedValue({
                ...mockSession,
                syncStatus: 'synced',
            });

            // Session sync fails but annotations should still attempt
            let callCount = 0;
            mockInvoke.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.reject({ status: 500, message: 'Server error' });
                }
                return Promise.resolve({});
            });

            const report = await syncService.syncAll();

            expect(report.sessions.failed).toBe(1);
            expect(report.annotations.synced).toBe(1);
        });
    });

    describe('resetEntityRetry', () => {
        it('should be callable without error', () => {
            expect(() => syncService.resetEntityRetry('session-1')).not.toThrow();
        });
    });
});
