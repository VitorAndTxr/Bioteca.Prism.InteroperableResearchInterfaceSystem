/**
 * Sync Context
 *
 * Manages data synchronization lifecycle across the mobile application.
 * Automatically starts/stops sync based on authentication state.
 *
 * Features:
 * - Automatic sync start on authentication
 * - Automatic sync stop on logout
 * - Manual sync trigger
 * - Sync status reporting
 *
 * Usage:
 * ```typescript
 * const { syncReport, syncNow, isRunning } = useSyncContext();
 *
 * // Manual sync
 * await syncNow();
 *
 * // Check last sync report
 * console.log(syncReport);
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, FC } from 'react';
import { SyncService } from '../services/SyncService';
import { SessionRepository } from '../data/repositories/SessionRepository';
import { RecordingRepository } from '../data/repositories/RecordingRepository';
import { AnnotationRepository } from '../data/repositories/AnnotationRepository';
import type { SyncReport } from '../services/SyncService.types';
import { useAuth } from './AuthContext';

interface SyncContextValue {
    syncReport: SyncReport | null;
    syncNow: () => Promise<SyncReport>;
    isRunning: boolean;
    isSyncing: boolean;
}

const SyncContext = createContext<SyncContextValue | null>(null);

interface SyncProviderProps {
    children: ReactNode;
    syncIntervalMs?: number;
    maxRetries?: number;
    enabled?: boolean;
}

export const SyncProvider: FC<SyncProviderProps> = ({
    children,
    syncIntervalMs = 60000, // Default: 1 minute
    maxRetries = 5,
    enabled = true
}) => {
    const { isAuthenticated } = useAuth();
    const [syncService] = useState(() => {
        const sessionRepo = new SessionRepository();
        const recordingRepo = new RecordingRepository();
        const annotationRepo = new AnnotationRepository();
        return new SyncService(sessionRepo, recordingRepo, annotationRepo, maxRetries);
    });
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    /**
     * Manual sync trigger.
     */
    const syncNow = useCallback(async (): Promise<SyncReport> => {
        if (!enabled) {
            console.log('[SyncContext] Sync is disabled');
            return {
                sessions: { synced: 0, failed: 0, pending: 0 },
                recordings: { synced: 0, failed: 0, pending: 0 },
                annotations: { synced: 0, failed: 0, pending: 0 },
                timestamp: new Date().toISOString()
            };
        }

        setIsSyncing(true);
        try {
            const report = await syncService.syncAll();
            setSyncReport(report);
            return report;
        } catch (error) {
            console.error('[SyncContext] Manual sync failed:', error);
            throw error;
        } finally {
            setIsSyncing(false);
        }
    }, [syncService, enabled]);

    /**
     * Start/stop sync based on authentication and enabled state.
     */
    useEffect(() => {
        if (!enabled) {
            console.log('[SyncContext] Sync is disabled');
            syncService.stop();
            setIsRunning(false);
            return;
        }

        if (isAuthenticated) {
            console.log('[SyncContext] Starting sync service (user authenticated)');
            syncService.start(syncIntervalMs);
            setIsRunning(true);
        } else {
            console.log('[SyncContext] Stopping sync service (user not authenticated)');
            syncService.stop();
            setIsRunning(false);
            setSyncReport(null);
        }

        return () => {
            syncService.stop();
            setIsRunning(false);
        };
    }, [isAuthenticated, syncService, syncIntervalMs, enabled]);

    return (
        <SyncContext.Provider value={{ syncReport, syncNow, isRunning, isSyncing }}>
            {children}
        </SyncContext.Provider>
    );
};

/**
 * Hook to access sync context.
 *
 * @throws Error if used outside SyncProvider
 */
export function useSyncContext(): SyncContextValue {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error('useSyncContext must be used within SyncProvider');
    }
    return context;
}
