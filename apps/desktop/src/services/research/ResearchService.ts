/**
 * Research Service
 *
 * Handles research project management operations with the InteroperableResearchNode backend.
 * Implements pagination support for research listing and research creation functionality.
 *
 * Endpoints:
 * - GET /api/Research/GetAllPaginatedAsync - Get paginated list of research projects
 * - POST /api/Research/New - Create new research project
 */

import { BaseService, type MiddlewareServices } from '../BaseService';
import {
    ResearchStatus,
    NodeAccessLevel,
    AuthorizationStatus,
    type Research,
    type NewResearchData,
    type PaginatedResponse,
    type AuthError,
    type AuthErrorCode,
    type ResearchNodeConnection
} from '@iris/domain';

/**
 * Middleware Research DTO (camelCase - matches backend JSON serialization)
 * Backend returns Research entity with these fields
 */
interface ResearchDTO {
    id: string;
    title: string;
    description: string;
    endDate?: string | null;
    status: string;
    researchNode?: ResearchNodeConnectionDTO;
}

/**
 * Middleware Research Node Connection DTO
 */
interface ResearchNodeConnectionDTO {
    id: string;
    nodeName: string;
    nodeUrl: string;
    status: string;
    nodeAccessLevel: string;
    registeredAt: string;
    updatedAt: string;
}

/**
 * Middleware Add Research Payload (PascalCase - matches backend)
 */
interface AddResearchPayload extends Record<string, unknown> {
    Title: string;
    Description: string;
    ResearchNodeId: string;
}

/**
 * Research Service Implementation
 */
export class ResearchService extends BaseService {
    private readonly USE_MOCK = true;

    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'ResearchService',
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
     * Get paginated list of research projects
     *
     * @param page - Page number (1-indexed, default: 1)
     * @param pageSize - Items per page (default: 10, max: 100)
     * @returns Paginated research list with metadata
     */
    async getResearchPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<Research>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockResearch: Research[] = Array(pageSize).fill(null).map((_, i) => ({
                        id: `mock-research-${page}-${i}`,
                        title: `Mock Research Project ${page}-${i}`,
                        description: `Description for Mock Research Project ${page}-${i}`,
                        endDate: null,
                        status: ResearchStatus.ACTIVE,
                        researchNode: {
                            id: `mock-node-${page}-${i}`,
                            nodeName: `Mock Node ${page}-${i}`,
                            nodeUrl: `https://mock-node-${page}-${i}.com`,
                            status: AuthorizationStatus.AUTHORIZED,
                            nodeAccessLevel: NodeAccessLevel.READ_ONLY,
                            registeredAt: new Date(),
                            updatedAt: new Date()
                        }
                    }));
                    resolve({
                        data: mockResearch,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching research projects (page: ${page}, pageSize: ${pageSize})`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchDTO>>({
                path: `/api/Research/GetAllPaginatedAsync?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            // Debug: Log full decrypted response
            console.log('[ResearchService] 🔍 Full decrypted response:', JSON.stringify(response, null, 2));

            this.log(`Retrieved ${response.data?.length || 0} research projects`);

            // Convert middleware response to domain types
            const researchProjects = (response.data || []).map(this.convertToResearch.bind(this));

            return {
                data: researchProjects,
                currentPage: response.currentPage || 0,
                pageSize: response.pageSize || researchProjects.length,
                totalRecords: response.totalRecords || researchProjects.length
            };
        });
    }

    /**
     * Create new research project
     *
     * @param researchData - Research data (title, description, researchNodeId)
     * @returns Created research project
     */
    async createResearch(researchData: NewResearchData): Promise<Research> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        id: `mock-research-new-${Date.now()}`,
                        title: researchData.title,
                        description: researchData.description,
                        endDate: null,
                        status: ResearchStatus.ACTIVE,
                        researchNode: {
                            id: researchData.researchNodeId,
                            nodeName: 'Mock Node',
                            nodeUrl: 'https://mock-node.com',
                            status: AuthorizationStatus.AUTHORIZED,
                            nodeAccessLevel: NodeAccessLevel.READ_ONLY,
                            registeredAt: new Date(),
                            updatedAt: new Date()
                        }
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating new research project:', researchData.title);

            // Validate input
            this.validateResearchData(researchData);

            // Ensure session
            await this.ensureSession();

            // Convert to middleware format (PascalCase)
            const middlewarePayload: AddResearchPayload = {
                Title: researchData.title,
                Description: researchData.description,
                ResearchNodeId: researchData.researchNodeId
            };

            // Call backend API
            const response = await this.middleware.invoke<AddResearchPayload, ResearchDTO>({
                path: '/api/Research/New',
                method: 'POST',
                payload: middlewarePayload
            });

            this.log('✅ Research project created:', response.id);

            return this.convertToResearch(response);
        });
    }

    // ==================== Private Helpers ====================

    /**
     * Convert middleware ResearchDTO to domain Research type
     */
    private convertToResearch(dto: ResearchDTO): Research {
        const research: Research = {
            id: dto.id,
            title: dto.title,
            description: dto.description,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            status: this.mapStatus(dto.status)
        };

        if (dto.researchNode) {
            research.researchNode = this.convertToResearchNodeConnection(dto.researchNode);
        }

        return research;
    }

    /**
     * Convert middleware ResearchNodeConnectionDTO to domain ResearchNodeConnection
     */
    private convertToResearchNodeConnection(dto: ResearchNodeConnectionDTO): ResearchNodeConnection {
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
     * Map backend status string to domain ResearchStatus enum
     */
    private mapStatus(status: string): ResearchStatus {
        const statusMap: Record<string, ResearchStatus> = {
            'active': ResearchStatus.ACTIVE,
            'completed': ResearchStatus.COMPLETED,
            'suspended': ResearchStatus.SUSPENDED,
            'archived': ResearchStatus.ARCHIVED,
            'ACTIVE': ResearchStatus.ACTIVE,
            'COMPLETED': ResearchStatus.COMPLETED,
            'SUSPENDED': ResearchStatus.SUSPENDED,
            'ARCHIVED': ResearchStatus.ARCHIVED,
            'Active': ResearchStatus.ACTIVE,
            'Completed': ResearchStatus.COMPLETED,
            'Suspended': ResearchStatus.SUSPENDED,
            'Archived': ResearchStatus.ARCHIVED
        };

        return statusMap[status] || ResearchStatus.ACTIVE;
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
            'readonly': NodeAccessLevel.READ_ONLY,
            'readwrite': NodeAccessLevel.READ_WRITE,
            'admin': NodeAccessLevel.ADMIN,
            'READONLY': NodeAccessLevel.READ_ONLY,
            'READWRITE': NodeAccessLevel.READ_WRITE,
            'ADMIN': NodeAccessLevel.ADMIN,
            'ReadOnly': NodeAccessLevel.READ_ONLY,
            'ReadWrite': NodeAccessLevel.READ_WRITE,
            'Admin': NodeAccessLevel.ADMIN
        };

        return levelMap[level] || NodeAccessLevel.READ_ONLY;
    }

    /**
     * Validate research creation data
     */
    private validateResearchData(data: NewResearchData): void {
        if (!data.title || data.title.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Research title is required',
                { field: 'title' }
            );
        }

        if (data.title.length > 500) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Research title must be less than 500 characters',
                { field: 'title', maxLength: 500 }
            );
        }

        if (!data.description || data.description.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Research description is required',
                { field: 'description' }
            );
        }

        if (data.description.length > 2000) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Research description must be less than 2000 characters',
                { field: 'description', maxLength: 2000 }
            );
        }

        if (!data.researchNodeId || data.researchNodeId.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Research node ID is required',
                { field: 'researchNodeId' }
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
            if (message.includes('research not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'Research project not found'
                );
            }

            if (message.includes('research already exists')) {
                return this.createAuthError(
                    'already_exists' as AuthErrorCode,
                    'A research project with this title already exists'
                );
            }

            if (message.includes('invalid payload')) {
                return this.createAuthError(
                    'invalid_request' as AuthErrorCode,
                    'Invalid research data provided'
                );
            }

            if (message.includes('research node not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'The specified research node does not exist'
                );
            }
        }

        // Fall back to base error conversion
        return super.convertToAuthError(error);
    }
}
