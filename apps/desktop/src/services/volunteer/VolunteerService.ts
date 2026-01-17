/**
 * Volunteer Service
 *
 * Handles volunteer (patient) management operations with the InteroperableResearchNode backend.
 * Implements pagination support for volunteer listing and volunteer creation functionality.
 *
 * Endpoints:
 * - GET /api/Volunteer/GetAllPaginatedAsync - Get paginated list of volunteers
 * - POST /api/Volunteer/New - Create new volunteer
 */

import { BaseService, type MiddlewareServices } from '../BaseService';
import {
    VolunteerStatus,
    VolunteerGender,
    type Volunteer,
    type NewVolunteerData,
    type PaginatedResponse,
    type AuthError,
    type AuthErrorCode
} from '@iris/domain';

/**
 * Middleware Volunteer DTO (camelCase - matches backend JSON serialization)
 * Backend returns Volunteer entity with these fields
 */
interface VolunteerDTO {
    id: string;
    name: string;
    email: string;
    birthDate: string;
    gender: string;
    phone?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Middleware Add Volunteer Payload (PascalCase - matches backend)
 */
interface AddVolunteerPayload extends Record<string, unknown> {
    Name: string;
    Email: string;
    BirthDate: string;
    Gender: string;
    Phone?: string;
}

/**
 * Volunteer Service Implementation
 */
export class VolunteerService extends BaseService {
    private readonly USE_MOCK = false;

    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'VolunteerService',
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
     * Get paginated list of volunteers
     *
     * @param page - Page number (1-indexed, default: 1)
     * @param pageSize - Items per page (default: 10, max: 100)
     * @returns Paginated volunteer list with metadata
     */
    async getVolunteersPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<Volunteer>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockVolunteers: Volunteer[] = Array(pageSize).fill(null).map((_, i) => {
                        const birthYear = 1960 + Math.floor(Math.random() * 40);
                        const birthMonth = Math.floor(Math.random() * 12);
                        const birthDay = 1 + Math.floor(Math.random() * 28);

                        return {
                            id: `mock-volunteer-${page}-${i}`,
                            name: `Voluntário ${page}-${i}`,
                            email: `voluntario${page}${i}@email.com`,
                            birthDate: new Date(birthYear, birthMonth, birthDay),
                            gender: [VolunteerGender.MALE, VolunteerGender.FEMALE, VolunteerGender.OTHER][i % 3],
                            phone: `(11) 9${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                            status: [VolunteerStatus.ACTIVE, VolunteerStatus.INACTIVE, VolunteerStatus.COMPLETED][i % 3],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                    });
                    resolve({
                        data: mockVolunteers,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 50
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching volunteers (page: ${page}, pageSize: ${pageSize})`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            // Call backend API with pagination
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<VolunteerDTO>>({
                path: `/api/Volunteer/GetAllPaginatedAsync?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            // Debug: Log full decrypted response
            console.log('[VolunteerService] 🔍 Full decrypted response:', JSON.stringify(response, null, 2));

            this.log(`Retrieved ${response.data?.length || 0} volunteers`);

            // Convert middleware response to domain types
            const volunteers = (response.data || []).map(this.convertToVolunteer.bind(this));

            return {
                data: volunteers,
                currentPage: response.currentPage || 0,
                pageSize: response.pageSize || volunteers.length,
                totalRecords: response.totalRecords || volunteers.length
            };
        });
    }

    /**
     * Create new volunteer
     *
     * @param volunteerData - Volunteer data (name, email, birthDate, gender, phone)
     * @returns Created volunteer
     */
    async createVolunteer(volunteerData: NewVolunteerData): Promise<Volunteer> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        id: `mock-volunteer-new-${Date.now()}`,
                        name: volunteerData.name,
                        email: volunteerData.email,
                        birthDate: new Date(volunteerData.birthDate),
                        gender: volunteerData.gender,
                        phone: volunteerData.phone,
                        status: VolunteerStatus.ACTIVE,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating new volunteer:', volunteerData.name);

            // Validate input
            this.validateVolunteerData(volunteerData);

            // Ensure session
            await this.ensureSession();

            // Convert to middleware format (PascalCase)
            const middlewarePayload: AddVolunteerPayload = {
                Name: volunteerData.name,
                Email: volunteerData.email,
                BirthDate: volunteerData.birthDate,
                Gender: volunteerData.gender,
                Phone: volunteerData.phone
            };

            // Call backend API
            const response = await this.middleware.invoke<AddVolunteerPayload, VolunteerDTO>({
                path: '/api/Volunteer/New',
                method: 'POST',
                payload: middlewarePayload
            });

            this.log('✅ Volunteer created:', response.id);

            return this.convertToVolunteer(response);
        });
    }

    // ==================== Private Helpers ====================

    /**
     * Convert middleware VolunteerDTO to domain Volunteer type
     */
    private convertToVolunteer(dto: VolunteerDTO): Volunteer {
        return {
            id: dto.id,
            name: dto.name,
            email: dto.email,
            birthDate: new Date(dto.birthDate),
            gender: this.mapGender(dto.gender),
            phone: dto.phone,
            status: this.mapStatus(dto.status),
            createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
        };
    }

    /**
     * Map backend status string to domain VolunteerStatus enum
     */
    private mapStatus(status: string): VolunteerStatus {
        const statusMap: Record<string, VolunteerStatus> = {
            'active': VolunteerStatus.ACTIVE,
            'inactive': VolunteerStatus.INACTIVE,
            'suspended': VolunteerStatus.SUSPENDED,
            'completed': VolunteerStatus.COMPLETED,
            'ACTIVE': VolunteerStatus.ACTIVE,
            'INACTIVE': VolunteerStatus.INACTIVE,
            'SUSPENDED': VolunteerStatus.SUSPENDED,
            'COMPLETED': VolunteerStatus.COMPLETED,
            'Active': VolunteerStatus.ACTIVE,
            'Inactive': VolunteerStatus.INACTIVE,
            'Suspended': VolunteerStatus.SUSPENDED,
            'Completed': VolunteerStatus.COMPLETED
        };

        return statusMap[status] || VolunteerStatus.ACTIVE;
    }

    /**
     * Map backend gender string to domain VolunteerGender enum
     */
    private mapGender(gender: string): VolunteerGender {
        const genderMap: Record<string, VolunteerGender> = {
            'male': VolunteerGender.MALE,
            'female': VolunteerGender.FEMALE,
            'other': VolunteerGender.OTHER,
            'not_informed': VolunteerGender.NOT_INFORMED,
            'MALE': VolunteerGender.MALE,
            'FEMALE': VolunteerGender.FEMALE,
            'OTHER': VolunteerGender.OTHER,
            'NOT_INFORMED': VolunteerGender.NOT_INFORMED,
            'Male': VolunteerGender.MALE,
            'Female': VolunteerGender.FEMALE,
            'Other': VolunteerGender.OTHER,
            'NotInformed': VolunteerGender.NOT_INFORMED
        };

        return genderMap[gender] || VolunteerGender.NOT_INFORMED;
    }

    /**
     * Validate volunteer creation data
     */
    private validateVolunteerData(data: NewVolunteerData): void {
        if (!data.name || data.name.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Volunteer name is required',
                { field: 'name' }
            );
        }

        if (data.name.length > 200) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Volunteer name must be less than 200 characters',
                { field: 'name', maxLength: 200 }
            );
        }

        if (!data.email || data.email.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Volunteer email is required',
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

        if (!data.birthDate) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Volunteer birth date is required',
                { field: 'birthDate' }
            );
        }

        if (!data.gender) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Volunteer gender is required',
                { field: 'gender' }
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
            if (message.includes('volunteer not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'Volunteer not found'
                );
            }

            if (message.includes('volunteer already exists') || message.includes('email already registered')) {
                return this.createAuthError(
                    'already_exists' as AuthErrorCode,
                    'A volunteer with this email already exists'
                );
            }

            if (message.includes('invalid payload')) {
                return this.createAuthError(
                    'invalid_request' as AuthErrorCode,
                    'Invalid volunteer data provided'
                );
            }
        }

        // Fall back to base error conversion
        return super.convertToAuthError(error);
    }
}
