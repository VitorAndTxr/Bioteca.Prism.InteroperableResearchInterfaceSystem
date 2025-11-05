/**
 * Researcher Service
 *
 * Handles researcher management operations with the InteroperableResearchNode backend.
 * Implements pagination support for researcher listing and researcher creation functionality.
 *
 * Endpoints:
 * - GET /api/researcher/GetResearchers - Get paginated list of researchers
 * - POST /api/researcher/New - Create new researcher
 */

import { BaseService, type MiddlewareServices } from '../BaseService';
import type {
    Researcher,
    NewResearcherData,
    PaginatedResponse,
    PaginationResponse,
    AuthError,
    AuthErrorCode,
    ResearcherRole
} from '@iris/domain';

/**
 * Middleware Researcher DTO (camelCase - matches backend JSON serialization)
 * Backend returns Researcher entity with these fields
 */
interface MiddlewareResearcherDTO {
    researcherId: string;
    researchNodeId: string;
    name: string;
    email: string;
    institution: string;
    role: string;
    orcid: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Middleware Add Researcher Payload (PascalCase - matches backend)
 */
interface MiddlewareAddResearcherPayload extends Record<string, unknown> {
    Name: string;
    Email: string;
    Institution: string;
    Role: string;
    ResearchNodeId: string;
    Orcid: string;
}

/**
 * Middleware Get Researchers Response (Backend PagedResult<List<ResearcherDTO>>)
 */
interface MiddlewarePaginatedResponse<T> {
    data?: T[];
    currentPage?: number;
    pageSize?: number;
    totalRecords?: number;
    totalPages?: number;
}

/**
 * Researcher Service Implementation
 */
export class ResearcherService extends BaseService {
    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'ResearcherService',
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
     * Get paginated list of researchers
     *
     * @param page - Page number (1-indexed, default: 1)
     * @param pageSize - Items per page (default: 10, max: 100)
     * @returns Paginated researcher list with metadata
     */
    async getResearchersPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<Researcher>> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching researchers (page: ${page}, pageSize: ${pageSize})`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, MiddlewarePaginatedResponse<MiddlewareResearcherDTO>>({
                path: `/api/researcher/GetResearchers?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            // Debug: Log full decrypted response
            console.log('[ResearcherService] 🔍 Full decrypted response:', JSON.stringify(response, null, 2));

            this.log(`Retrieved ${response.data?.length || 0} researchers`);

            // Convert middleware response to domain types
            const researchers = (response.data || []).map(this.convertToResearcher.bind(this));

            const pagination: PaginationResponse = {
                currentRecord: response.currentPage || 0,
                pageSize: response.pageSize || researchers.length,
                totalRecords: response.totalRecords || researchers.length
            };

            return {
                data: researchers,
                pagination
            };
        });
    }

    /**
     * Create new researcher
     *
     * @param researcherData - Researcher data (name, email, institution, orcid, role)
     * @returns Created researcher
     */
    async createResearcher(researcherData: NewResearcherData): Promise<Researcher> {
        return this.handleMiddlewareError(async () => {
            this.log('Creating new researcher:', researcherData.name);

            // Validate input
            this.validateResearcherData(researcherData);

            // Ensure session
            await this.ensureSession();

            // Convert to middleware format (PascalCase)
            const middlewarePayload: MiddlewareAddResearcherPayload = {
                Name: researcherData.name,
                Email: researcherData.email,
                Institution: researcherData.institution,
                Role: researcherData.role,
                Orcid: researcherData.orcid,
                ResearchNodeId: researcherData.researchNodeId
            };

            // Call backend API
            const response = await this.middleware.invoke<MiddlewareAddResearcherPayload, MiddlewareResearcherDTO>({
                path: '/api/researcher/New',
                method: 'POST',
                payload: middlewarePayload
            });

            this.log('✅ Researcher created:', response.researcherId);

            return this.convertToResearcher(response);
        });
    }


    async getByNodeId(): Promise<Researcher[]> {
        return this.handleMiddlewareError(async () => {
            await this.ensureSession();
            const researchNodeId = import.meta.env.VITE_IRN_MIDDLEWARE_RESEARCH_NODE_ID || '';
            const response = await this.middleware.invoke<Record<string, unknown>, MiddlewareResearcherDTO[]>({
                path: `/api/researcher/GetResearcherByNodeId/${researchNodeId}`,
                method: 'GET',
                payload: {}
            });

            return response.map(this.convertToResearcher.bind(this));
        });
    }
    // ==================== Private Helpers ====================

    /**
     * Convert middleware ResearcherDTO to domain Researcher type
     */
    private convertToResearcher(dto: MiddlewareResearcherDTO): Researcher {
        return {
            researcherId: dto.researcherId,
            researchNodeId: dto.researchNodeId,
            name: dto.name,
            email: dto.email,
            institution: dto.institution,
            role: this.mapRole(dto.role),
            orcid: dto.orcid
        };
    }

    /**
     * Map backend role string to domain ResearcherRole enum
     */
    private mapRole(role: string): ResearcherRole {
        const roleMap: Record<string, ResearcherRole> = {
            'chief_researcher': 'chief_researcher' as ResearcherRole,
            'researcher': 'researcher' as ResearcherRole,
            'CHIEF_RESEARCHER': 'chief_researcher' as ResearcherRole,
            'RESEARCHER': 'researcher' as ResearcherRole,
            'ChiefResearcher': 'chief_researcher' as ResearcherRole,
            'Researcher': 'researcher' as ResearcherRole
        };

        return roleMap[role] || ('researcher' as ResearcherRole);
    }

    /**
     * Validate researcher creation data
     */
    private validateResearcherData(data: NewResearcherData): void {
        if (!data.name || data.name.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Researcher name is required',
                { field: 'name' }
            );
        }

        if (data.name.length > 200) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Researcher name must be less than 200 characters',
                { field: 'name', maxLength: 200 }
            );
        }

        if (!data.email || data.email.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Email is required',
                { field: 'email' }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Invalid email format',
                { field: 'email' }
            );
        }

        if (!data.institution || data.institution.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Institution is required',
                { field: 'institution' }
            );
        }

        if (!data.orcid || data.orcid.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'ORCID is required',
                { field: 'orcid' }
            );
        }

        // ORCID format validation (0000-0000-0000-0000)
        const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
        if (!orcidRegex.test(data.orcid)) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Invalid ORCID format (expected: 0000-0000-0000-0000)',
                { field: 'orcid' }
            );
        }

        if (!data.role) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Researcher role is required',
                { field: 'role' }
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
            if (message.includes('researcher not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'Researcher not found'
                );
            }

            if (message.includes('researcher already exists')) {
                return this.createAuthError(
                    'already_exists' as AuthErrorCode,
                    'A researcher with this email or ORCID already exists'
                );
            }

            if (message.includes('invalid payload')) {
                return this.createAuthError(
                    'invalid_request' as AuthErrorCode,
                    'Invalid researcher data provided'
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
