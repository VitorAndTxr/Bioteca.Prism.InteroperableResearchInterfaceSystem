/**
 * NodeSyncServiceAdapter (Phase 18)
 *
 * Simplified adapter that delegates sync orchestration entirely to the local backend.
 * The backend performs the 4-phase handshake and data fetch internally via SyncPullService.
 *
 * Previously this adapter created ChannelManager/SessionManager/WebCryptoDriver instances
 * to orchestrate the handshake from the UI layer. All of that complexity is removed.
 * The desktop app now issues a single HTTP call to the local backend for each operation.
 */

import type { ResearchNodeConnection, SyncLogEntry, SyncPreviewResponse, SyncResult } from '@iris/domain';
import { BaseService, type MiddlewareServices } from './BaseService';

interface SyncPullRequest {
    remoteNodeId: string;
    since: string | null;
}

export class NodeSyncServiceAdapter extends BaseService {
    constructor(services: MiddlewareServices) {
        super(services, { serviceName: 'NodeSyncServiceAdapter', debug: true });
    }

    /**
     * Fetches the sync manifest from the local backend (which contacts the remote node).
     * Returns aggregate metadata only — no PII or entity data.
     *
     * @param connection - The remote node connection to preview
     * @param since - Optional ISO-8601 watermark for incremental sync
     */
    async preview(
        connection: ResearchNodeConnection,
        since?: string
    ): Promise<SyncPreviewResponse> {
        await this.ensureSession();

        return this.middleware.invoke<SyncPullRequest, SyncPreviewResponse>({
            path: '/api/sync/preview',
            method: 'POST',
            payload: { remoteNodeId: connection.id, since: since ?? null }
        });
    }

    /**
     * Triggers a full backend-to-backend sync pull.
     * The backend performs the handshake, fetches all entities, and imports them transactionally.
     *
     * @param connection - The remote node connection to pull from
     * @param since - Optional ISO-8601 watermark for incremental sync
     */
    async pull(
        connection: ResearchNodeConnection,
        since?: string
    ): Promise<SyncResult> {
        await this.ensureSession();

        return this.middleware.invoke<SyncPullRequest, SyncResult>({
            path: '/api/sync/pull',
            method: 'POST',
            payload: { remoteNodeId: connection.id, since: since ?? null }
        });
    }

    /**
     * Fetches the most recent sync log entry for a given remote node ID.
     * Returns null if no sync log entries exist for the node.
     *
     * @param remoteNodeId - ID of the remote node connection
     */
    async getLatestSyncLog(remoteNodeId: string): Promise<SyncLogEntry | null> {
        return this.handleMiddlewareError(async () => {
            await this.ensureSession();

            const params = new URLSearchParams({
                remoteNodeId,
                page: '1',
                pageSize: '1'
            });

            const response = await this.middleware.invoke<
                Record<string, unknown>,
                { data: SyncLogEntry[]; totalRecords: number }
            >({
                path: `/api/sync/log?${params.toString()}`,
                method: 'GET',
                payload: {}
            });

            return response.data?.[0] ?? null;
        });
    }

    /**
     * Retrieves all sync log entries for a given remote node, paginated.
     *
     * @param remoteNodeId - ID of the remote node connection
     * @param page - Page number (1-indexed)
     * @param pageSize - Number of records per page
     */
    async getSyncLogs(
        remoteNodeId: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<{ data: SyncLogEntry[]; totalRecords: number }> {
        return this.handleMiddlewareError(async () => {
            await this.ensureSession();

            const params = new URLSearchParams({
                remoteNodeId,
                page: String(page),
                pageSize: String(pageSize)
            });

            return this.middleware.invoke<
                Record<string, unknown>,
                { data: SyncLogEntry[]; totalRecords: number }
            >({
                path: `/api/sync/log?${params.toString()}`,
                method: 'GET',
                payload: {}
            });
        });
    }
}

/** Singleton instance — initialized lazily by middleware.ts */
let _nodeSyncServiceAdapter: NodeSyncServiceAdapter | null = null;

export function createNodeSyncServiceAdapter(services: MiddlewareServices): NodeSyncServiceAdapter {
    _nodeSyncServiceAdapter = new NodeSyncServiceAdapter(services);
    return _nodeSyncServiceAdapter;
}
