/**
 * NodeSync Domain Types
 *
 * Shared TypeScript interfaces for the Node-to-Node synchronization protocol.
 * Used by the desktop service adapter (NodeSyncServiceAdapter), UI (SyncProgressModal), and backend SyncPullService.
 */

export interface SyncEntitySummary {
    count: number;
    latestUpdate: string;
}

export interface SyncRecordingSummary {
    count: number;
    totalSizeBytes: number;
}

export interface SyncManifest {
    nodeId: string;
    nodeName: string;
    generatedAt: string;
    lastSyncedAt: string | null;
    snomed: SyncEntitySummary;
    volunteers: SyncEntitySummary;
    research: SyncEntitySummary;
    sessions: SyncEntitySummary;
    recordings: SyncRecordingSummary;
}

export interface SyncProgress {
    phase: 'manifest' | 'snomed' | 'volunteers' | 'research' | 'sessions' | 'recordings';
    current: number;
    total: number;
    entityType: string;
}

export interface SyncResult {
    status: 'completed' | 'failed' | 'rolled_back';
    startedAt: string;
    completedAt: string;
    entitiesReceived: Record<string, number>;
    errorMessage?: string;
}

export interface SyncLogEntry {
    id: string;
    remoteNodeId: string;
    startedAt: string;
    completedAt: string | null;
    status: string;
    lastSyncedAt: string | null;
    entitiesReceived: Record<string, number> | null;
    errorMessage: string | null;
}

/// <summary>
/// Response from POST /api/sync/preview (backend-to-backend sync, Phase 18).
/// Contains only aggregate metadata — no PII or entity data.
/// </summary>
export interface SyncPreviewResponse {
    manifest: SyncManifest;
    autoResolvedSince: string | null;
    remoteNodeId: string;
}

export interface PaginatedSyncResponse<T = unknown> {
    data: T[];
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface SyncSnomedPayload {
    bodyRegions: unknown[];
    bodyStructures: unknown[];
    lateralities: unknown[];
    topographicalModifiers: unknown[];
    severityCodes: unknown[];
    clinicalConditions: unknown[];
    clinicalEvents: unknown[];
    medications: unknown[];
    allergyIntolerances: unknown[];
}

export interface SyncImportPayload {
    manifestGeneratedAt: string;
    remoteNodeId: string;
    snomed: SyncSnomedPayload;
    volunteers: unknown[];
    research: unknown[];
    sessions: unknown[];
    recordings: Array<{
        id: string;
        contentBase64: string;
        contentType: string;
        fileName: string;
    }>;
}
