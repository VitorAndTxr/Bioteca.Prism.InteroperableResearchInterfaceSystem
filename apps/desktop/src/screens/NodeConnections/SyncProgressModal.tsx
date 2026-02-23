/**
 * SyncProgressModal (Phase 18)
 *
 * Handles all sync operation states in a single modal:
 * - confirmation: shows manifest preview (entity counts) — user confirms before starting
 * - in-progress: spinner while backend performs the full sync
 * - success: summary of synced entities
 * - error: human-readable error with retry
 *
 * Phase 18 change: the modal no longer drives the handshake or per-entity progress.
 * The local backend now owns all sync orchestration. The UI shows a spinner during pull.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Modal from '@/design-system/components/modal/Modal';
import Button from '@/design-system/components/button/Button';
import type { SyncManifest, SyncPreviewResponse, SyncResult } from '@iris/domain';
import type { ResearchNodeConnection } from '@iris/domain';

type ModalState =
    | { phase: 'confirmation'; preview: SyncPreviewResponse }
    | { phase: 'in-progress' }
    | { phase: 'success'; result: SyncResult }
    | { phase: 'error'; message: string; onRetry: () => void };

interface SyncProgressModalProps {
    isOpen: boolean;
    connection: ResearchNodeConnection;
    /** Called when the modal closes after success or user-initiated close on error */
    onClose: (syncCompleted: boolean) => void;
    /** Called to start the preview — contacts local backend which contacts remote node */
    onStartSync: () => Promise<SyncPreviewResponse>;
    /** Called to execute the full pull after user confirms */
    onExecutePull: (since?: string) => Promise<SyncResult>;
}

function formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const SyncProgressModal: React.FC<SyncProgressModalProps> = ({
    isOpen,
    connection,
    onClose,
    onStartSync,
    onExecutePull
}) => {
    const [state, setState] = useState<ModalState | null>(null);
    const previewRef = useRef<SyncPreviewResponse | null>(null);
    const isSyncingRef = useRef(false);

    // Start the preview fetch each time the modal opens
    useEffect(() => {
        if (!isOpen) {
            setState(null);
            previewRef.current = null;
            isSyncingRef.current = false;
            return;
        }

        let cancelled = false;

        setState({ phase: 'in-progress' });

        onStartSync()
            .then(preview => {
                if (cancelled) return;
                previewRef.current = preview;
                setState({ phase: 'confirmation', preview });
            })
            .catch(err => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : String(err);
                setState({
                    phase: 'error',
                    message,
                    onRetry: () => {
                        setState(null);
                        previewRef.current = null;
                    }
                });
            });

        return () => { cancelled = true; };
    }, [isOpen, onStartSync]);

    const handleConfirm = useCallback(async () => {
        if (!previewRef.current || isSyncingRef.current) return;
        isSyncingRef.current = true;
        setState({ phase: 'in-progress' });

        const since = previewRef.current.autoResolvedSince ?? undefined;

        try {
            const result = await onExecutePull(since);
            setState({ phase: 'success', result });
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            const retry = () => {
                isSyncingRef.current = false;
                setState(null);
                previewRef.current = null;
            };
            setState({ phase: 'error', message, onRetry: retry });
        }
    }, [onExecutePull]);

    const handleClose = useCallback(() => {
        if (state?.phase === 'in-progress') return; // Cannot dismiss mid-sync
        onClose(state?.phase === 'success');
    }, [state, onClose]);

    const isSyncing = state?.phase === 'in-progress';

    const modalTitle = (() => {
        if (!state) return 'Preparing sync...';
        switch (state.phase) {
            case 'confirmation': return `Sync from ${connection.nodeName}`;
            case 'in-progress': return 'Syncing...';
            case 'success': return 'Sync complete';
            case 'error': return 'Sync failed';
        }
    })();

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={modalTitle}
            size="medium"
            showCloseButton={!isSyncing}
            closeOnBackdropClick={!isSyncing}
            closeOnEscape={!isSyncing}
        >
            <div aria-live="polite" aria-atomic="true">
                {(!state || state.phase === 'in-progress') && (
                    <InProgressContent />
                )}

                {state?.phase === 'confirmation' && previewRef.current && (
                    <ConfirmationContent
                        manifest={previewRef.current.manifest}
                        onConfirm={handleConfirm}
                        onCancel={() => onClose(false)}
                    />
                )}

                {state?.phase === 'success' && (
                    <SuccessContent result={state.result} onClose={() => onClose(true)} />
                )}

                {state?.phase === 'error' && (
                    <ErrorContent
                        message={state.message}
                        onRetry={state.onRetry}
                        onClose={() => onClose(false)}
                    />
                )}
            </div>
        </Modal>
    );
};

// ── Sub-components ───────────────────────────────────────────────────────────

const InProgressContent: React.FC = () => (
    <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <ArrowPathIcon
            style={{
                width: 40,
                height: 40,
                color: '#49A2A8',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
            }}
        />
        <p style={{ color: '#393939', fontSize: 15, marginBottom: 12 }}>
            Syncing...
        </p>
        <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
    </div>
);

interface ConfirmationContentProps {
    manifest: SyncManifest;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationContent: React.FC<ConfirmationContentProps> = ({ manifest, onConfirm, onCancel }) => {
    const totalEntities =
        manifest.snomed.count +
        manifest.volunteers.count +
        manifest.research.count +
        manifest.sessions.count;

    return (
        <div style={{ padding: '4px 0 16px' }}>
            <p style={{ color: '#393939', fontSize: 14, marginBottom: 16 }}>
                Node <strong>{manifest.nodeName}</strong> has{' '}
                <strong>{totalEntities}</strong> entities to sync.
                {manifest.lastSyncedAt && (
                    <> Last synced {formatRelativeTime(manifest.lastSyncedAt)}.</>
                )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                <EntityCount label="SNOMED" count={manifest.snomed.count} />
                <EntityCount label="Volunteers" count={manifest.volunteers.count} />
                <EntityCount label="Research" count={manifest.research.count} />
                <EntityCount label="Sessions" count={manifest.sessions.count} />
                <EntityCount
                    label="Recordings"
                    count={manifest.recordings.count}
                    extra={manifest.recordings.totalSizeBytes > 0
                        ? `(${formatBytes(manifest.recordings.totalSizeBytes)})`
                        : undefined}
                />
            </div>

            <div className="iris-modal__actions">
                <Button variant="primary" onClick={onConfirm}>
                    Start Sync
                </Button>
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

interface EntityCountProps {
    label: string;
    count: number;
    extra?: string;
}

const EntityCount: React.FC<EntityCountProps> = ({ label, count, extra }) => (
    <div style={{
        background: '#f9fafb',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 13
    }}>
        <span style={{ color: '#6b7280' }}>{label}</span>
        <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
            {count} {extra}
        </span>
    </div>
);

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface SuccessContentProps {
    result: SyncResult;
    onClose: () => void;
}

const SuccessContent: React.FC<SuccessContentProps> = ({ result, onClose }) => {
    const total = Object.values(result.entitiesReceived).reduce((a, b) => a + b, 0);

    return (
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <CheckCircleIcon style={{ width: 48, height: 48, color: '#16a34a', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>
                {total} records synced
            </p>
            {result.completedAt && (
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                    Completed at {new Date(result.completedAt).toLocaleTimeString()}
                </p>
            )}
            <div className="iris-modal__actions">
                <Button variant="primary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
};

interface ErrorContentProps {
    message: string;
    onRetry: () => void;
    onClose: () => void;
}

const ErrorContent: React.FC<ErrorContentProps> = ({ message, onRetry, onClose }) => (
    <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <ExclamationTriangleIcon style={{ width: 48, height: 48, color: '#dc2626', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>
            Sync failed
        </p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
            All changes were rolled back. No data was modified.
        </p>
        <p style={{ fontSize: 13, color: '#393939', background: '#fef2f2', borderRadius: 8, padding: '8px 12px', marginBottom: 20, wordBreak: 'break-word' }}>
            {message}
        </p>
        <div className="iris-modal__actions">
            <Button variant="primary" onClick={onRetry}>
                Retry
            </Button>
            <Button variant="outline" onClick={onClose}>
                Close
            </Button>
        </div>
    </div>
);

export default SyncProgressModal;
