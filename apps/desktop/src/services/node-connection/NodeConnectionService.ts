/**
 * Node Connection Service
 *
 * Handles research node connection management operations with the InteroperableResearchNode backend.
 * Implements pagination support for connection listing and connection creation functionality.
 *
 * Endpoints:
 * - GET /api/node/GetActiveNodeConnectionsPaginated - Get paginated list of active node connections
 * - GET /api/node/GetAllUnaprovedPaginated - Get paginated list of unapproved node connections
 * - POST /api/node/NewConnection - Create new node connection
 */

import { BaseService, type MiddlewareServices } from '../BaseService';
import {
    NodeAccessLevel,
    AuthorizationStatus,
    type ResearchNodeConnection,
    type NewNodeConnectionData,
    type PaginatedResponse,
    type AuthError,
    type AuthErrorCode
} from '@iris/domain';

/**
 * Middleware Node Connection DTO (camelCase - matches backend JSON serialization)
 * Backend returns ResearchNodeConnection entity with these fields
 */
interface NodeConnectionDTO {
    id: string;
    nodeName: string;
    nodeUrl: string;
    status: string;
    nodeAccessLevel: string;
    registeredAt: string;
    updatedAt: string;
}

/**
 * Middleware Add Node Connection Payload (PascalCase - matches backend)
 */
interface AddNodeConnectionPayload extends Record<string, unknown> {
    NodeName: string;
    NodeUrl: string;
    NodeAccessLevel: string;
}

/**
 * Node Connection Service Implementation
 */
export class NodeConnectionService extends BaseService {
    private readonly USE_MOCK = false;

    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'NodeConnectionService',
            debug: true // Enable for development
        });
    }

    /**
     * Initialize service
     */
    async initialize(): Promise<void> {
        this.log('Service initialized');
    }

    /**
     * Dispose service
     */
    async dispose(): Promise<void> {
        this.log('Service disposed');
    }

    /**
     * Get paginated list of active node connections
     *
     * @param page - Page number (1-indexed, default: 1)
     * @param pageSize - Items per page (default: 10, max: 100)
     * @returns Paginated node connection list with metadata
     */
    async getActiveNodeConnectionsPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<ResearchNodeConnection>> {
        if (this.USE_MOCK) {
            this.log(`[MOCK] Fetching active node connections (page: ${page}, pageSize: ${pageSize})`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            
            const mockData: ResearchNodeConnection[] = [
                {
                    id: 'conn-1',
                    nodeName: 'Hospital das Clínicas',
                    nodeUrl: 'https://hc.fm.usp.br/api/node',
                    status: AuthorizationStatus.AUTHORIZED,
                    nodeAccessLevel: NodeAccessLevel.PUBLIC,
                    registeredAt: new Date('2025-01-15T10:00:00Z'),
                    updatedAt: new Date('2025-01-15T10:00:00Z')
                },
                {
                    id: 'conn-2',
                    nodeName: 'Instituto do Coração',
                    nodeUrl: 'https://incor.usp.br/api/node',
                    status: AuthorizationStatus.AUTHORIZED,
                    nodeAccessLevel: NodeAccessLevel.RESTRICTED,
                    registeredAt: new Date('2025-02-01T14:30:00Z'),
                    updatedAt: new Date('2025-02-01T14:30:00Z')
                }
            ];

            return {
                data: mockData,
                currentRecord: 1,
                pageSize: pageSize,
                totalRecords: mockData.length
            };
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching active node connections (page: ${page}, pageSize: ${pageSize})`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<NodeConnectionDTO>>({
                path: `/api/node/GetActiveNodeConnectionsPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            // Debug: Log full decrypted response
            console.log('[NodeConnectionService] 🔍 Full decrypted response (active):', JSON.stringify(response, null, 2));

            this.log(`Retrieved ${response.data?.length || 0} active node connections`);

            // Convert middleware response to domain types
            const connections = (response.data || []).map(this.convertToNodeConnection.bind(this));

            return {
                data: connections,
                currentRecord: response.currentPage || 0,
                pageSize: response.pageSize || connections.length,
                totalRecords: response.totalRecords || connections.length
            };
        });
    }

    /**
     * Get paginated list of unapproved node connections
     *
     * @param page - Page number (1-indexed, default: 1)
     * @param pageSize - Items per page (default: 10, max: 100)
     * @returns Paginated node connection list with metadata
     */
    async getAllUnapprovedPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<ResearchNodeConnection>> {
        if (this.USE_MOCK) {
            this.log(`[MOCK] Fetching unapproved node connections (page: ${page}, pageSize: ${pageSize})`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            
            const mockData: ResearchNodeConnection[] = [
                {
                    id: 'req-1',
                    nodeName: 'Universidade Federal de São Paulo',
                    nodeUrl: 'https://unifesp.br/api/node',
                    status: AuthorizationStatus.PENDING,
                    nodeAccessLevel: NodeAccessLevel.PUBLIC,
                    registeredAt: new Date('2025-10-18T09:15:00Z'),
                    updatedAt: new Date('2025-10-18T09:15:00Z')
                },
                {
                    id: 'req-2',
                    nodeName: 'Laboratório de Neurociência',
                    nodeUrl: 'https://neuro.lab.org/api/node',
                    status: AuthorizationStatus.PENDING,
                    nodeAccessLevel: NodeAccessLevel.PRIVATE,
                    registeredAt: new Date('2025-10-19T11:45:00Z'),
                    updatedAt: new Date('2025-10-19T11:45:00Z')
                }
            ];

            return {
                data: mockData,
                currentRecord: 1,
                pageSize: pageSize,
                totalRecords: mockData.length
            };
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching unapproved node connections (page: ${page}, pageSize: ${pageSize})`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<NodeConnectionDTO>>({
                path: `/api/node/GetAllUnaprovedPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            // Debug: Log full decrypted response
            console.log('[NodeConnectionService] 🔍 Full decrypted response (unapproved):', JSON.stringify(response, null, 2));

            this.log(`Retrieved ${response.data?.length || 0} unapproved node connections`);

            // Convert middleware response to domain types
            const connections = (response.data || []).map(this.convertToNodeConnection.bind(this));

            return {
                data: connections,
                currentRecord: response.currentPage || 0,
                pageSize: response.pageSize || connections.length,
                totalRecords: response.totalRecords || connections.length
            };
        });
    }

    /**
     * Create new node connection
     *
     * @param connectionData - Node connection data (nodeName, nodeUrl, nodeAccessLevel)
     * @returns Created node connection
     */
    async createNodeConnection(connectionData: NewNodeConnectionData): Promise<ResearchNodeConnection> {
        if (this.USE_MOCK) {
            this.log('[MOCK] Creating new node connection:', connectionData.nodeName);
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
            
            return {
                id: `mock-conn-${Date.now()}`,
                nodeName: connectionData.nodeName,
                nodeUrl: connectionData.nodeUrl,
                status: AuthorizationStatus.PENDING,
                nodeAccessLevel: connectionData.nodeAccessLevel,
                registeredAt: new Date(),
                updatedAt: new Date()
            };
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating new node connection:', connectionData.nodeName);

            // Validate input
            this.validateConnectionData(connectionData);

            // Ensure session
            await this.ensureSession();

            // Convert to middleware format (PascalCase)
            const middlewarePayload: AddNodeConnectionPayload = {
                NodeName: connectionData.nodeName,
                NodeUrl: connectionData.nodeUrl,
                NodeAccessLevel: this.mapNodeAccessLevelToString(connectionData.nodeAccessLevel)
            };

            // Call backend API
            const response = await this.middleware.invoke<AddNodeConnectionPayload, NodeConnectionDTO>({
                path: '/api/node/NewConnection',
                method: 'POST',
                payload: middlewarePayload
            });

            this.log('✅ Node connection created:', response.id);

            return this.convertToNodeConnection(response);
        });
    }

    /**
     * Approve a pending node connection request
     *
     * @param connectionId - ID of the connection to approve
     */
    async approveConnection(connectionId: string): Promise<void> {
        if (this.USE_MOCK) {
            this.log(`[MOCK] Approving connection: ${connectionId}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            return;
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Approving connection: ${connectionId}`);

            // Ensure session
            await this.ensureSession();

            // Call backend API
            await this.middleware.invoke<{ ConnectionId: string }, void>({
                path: `/api/node/${connectionId}/approve`,
                method: 'POST',
                payload: { ConnectionId: connectionId }
            });

            this.log(`✅ Connection approved: ${connectionId}`);
        });
    }

    /**
     * Reject a pending node connection request
     *
     * @param connectionId - ID of the connection to reject
     */
    async rejectConnection(connectionId: string): Promise<void> {
        if (this.USE_MOCK) {
            this.log(`[MOCK] Rejecting connection: ${connectionId}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
            return;
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Rejecting connection: ${connectionId}`);

            // Ensure session
            await this.ensureSession();

            // Call backend API
            await this.middleware.invoke<{ ConnectionId: string }, void>({
                path: `/api/node/${connectionId}/reject`,
                method: 'POST',
                payload: { ConnectionId: connectionId }
            });

            this.log(`✅ Connection rejected: ${connectionId}`);
        });
    }

    // ==================== Private Helpers ====================

    /**
     * Convert middleware NodeConnectionDTO to domain ResearchNodeConnection type
     */
    private convertToNodeConnection(dto: NodeConnectionDTO): ResearchNodeConnection {
        return {
            id: dto.id,
            nodeName: dto.nodeName,
            nodeUrl: dto.nodeUrl,
            status: this.mapAuthorizationStatus(dto.status),
            nodeAccessLevel: this.mapNodeAccessLevel(dto.nodeAccessLevel),
            registeredAt: new Date(dto.registeredAt),
            updatedAt: new Date(dto.updatedAt)
        };
    }

    /**
     * Map backend authorization status to domain enum
     */
    private mapAuthorizationStatus(status: string): AuthorizationStatus {
        const statusMap: Record<string, AuthorizationStatus> = {
            'unknown': AuthorizationStatus.UNKNOWN,
            'pending': AuthorizationStatus.PENDING,
            'authorized': AuthorizationStatus.AUTHORIZED,
            'revoked': AuthorizationStatus.REVOKED,
            'UNKNOWN': AuthorizationStatus.UNKNOWN,
            'PENDING': AuthorizationStatus.PENDING,
            'AUTHORIZED': AuthorizationStatus.AUTHORIZED,
            'REVOKED': AuthorizationStatus.REVOKED,
            'Unknown': AuthorizationStatus.UNKNOWN,
            'Pending': AuthorizationStatus.PENDING,
            'Authorized': AuthorizationStatus.AUTHORIZED,
            'Revoked': AuthorizationStatus.REVOKED
        };

        return statusMap[status] || AuthorizationStatus.UNKNOWN;
    }

    /**
     * Map backend node access level to domain enum
     */
    private mapNodeAccessLevel(level: string): NodeAccessLevel {
        const levelMap: Record<string, NodeAccessLevel> = {
            'public': NodeAccessLevel.PUBLIC,
            'private': NodeAccessLevel.PRIVATE,
            'restricted': NodeAccessLevel.RESTRICTED,
            'PUBLIC': NodeAccessLevel.PUBLIC,
            'PRIVATE': NodeAccessLevel.PRIVATE,
            'RESTRICTED': NodeAccessLevel.RESTRICTED,
            'Public': NodeAccessLevel.PUBLIC,
            'Private': NodeAccessLevel.PRIVATE,
            'Restricted': NodeAccessLevel.RESTRICTED
        };

        return levelMap[level] || NodeAccessLevel.PUBLIC;
    }

    /**
     * Map domain NodeAccessLevel enum to string for backend
     */
    private mapNodeAccessLevelToString(level: NodeAccessLevel): string {
        const levelMap: Record<NodeAccessLevel, string> = {
            [NodeAccessLevel.PUBLIC]: 'Public',
            [NodeAccessLevel.PRIVATE]: 'Private',
            [NodeAccessLevel.RESTRICTED]: 'Restricted'
        };

        return levelMap[level] || 'Public';
    }

    /**
     * Validate node connection creation data
     */
    private validateConnectionData(data: NewNodeConnectionData): void {
        if (!data.nodeName || data.nodeName.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Node name is required',
                { field: 'nodeName' }
            );
        }

        if (data.nodeName.length > 200) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Node name must be less than 200 characters',
                { field: 'nodeName', maxLength: 200 }
            );
        }

        if (!data.nodeUrl || data.nodeUrl.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Node URL is required',
                { field: 'nodeUrl' }
            );
        }

        // Validate URL format
        try {
            new URL(data.nodeUrl);
        } catch {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Node URL must be a valid URL',
                { field: 'nodeUrl' }
            );
        }

        if (!data.nodeAccessLevel) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Node access level is required',
                { field: 'nodeAccessLevel' }
            );
        }
    }

    /**
     * Override error conversion for service-specific errors
     */
    protected convertToAuthError(error: unknown): AuthError {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            // Map specific backend errors
            if (message.includes('connection not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'Node connection not found'
                );
            }

            if (message.includes('connection already exists')) {
                return this.createAuthError(
                    'already_exists' as AuthErrorCode,
                    'A connection with this name or URL already exists'
                );
            }

            if (message.includes('invalid payload')) {
                return this.createAuthError(
                    'invalid_request' as AuthErrorCode,
                    'Invalid connection data provided'
                );
            }

            if (message.includes('node not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'The specified node does not exist'
                );
            }
        }

        // Fall back to base error conversion
        return super.convertToAuthError(error);
    }
}
