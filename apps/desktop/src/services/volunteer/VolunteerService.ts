/**
 * Volunteer Service
 *
 * Handles volunteer (patient) management operations with the InteroperableResearchNode backend.
 * Implements pagination support for volunteer listing and full CRUD functionality.
 *
 * Endpoints:
 * - GET /api/Volunteer/GetAllPaginated - Get paginated list of volunteers
 * - GET /api/Volunteer/{id} - Get volunteer by ID
 * - POST /api/Volunteer/New - Create new volunteer
 * - PUT /api/Volunteer/Update/{id} - Update existing volunteer
 * - DELETE /api/Volunteer/{id} - Delete volunteer
 */

import { BaseService, type MiddlewareServices } from '../BaseService';
import {
    VolunteerGender,
    ConsentStatus,
    BloodType,
    type Volunteer,
    type NewVolunteerData,
    type UpdateVolunteerData,
    type PaginatedResponse,
    type AuthErrorCode
} from '@iris/domain';

/**
 * Middleware Volunteer DTO (camelCase - matches backend JSON serialization)
 */
interface VolunteerDTO {
    id: string;
    volunteerId?: string;
    researchNodeId: string;
    volunteerCode: string;
    name: string;
    email: string;
    birthDate: string;
    gender: string;
    bloodType?: string;
    height?: number;
    weight?: number;
    consentStatus: string;
    enrolledAt?: string;
    updatedAt?: string;
    clinicalConditionCodes?: string[];
    clinicalEventCodes?: string[];
    medicationCodes?: string[];
    allergyIntoleranceCodes?: string[];
}

/**
 * Middleware Add Volunteer Payload (PascalCase - matches backend)
 */
interface AddVolunteerPayload extends Record<string, unknown> {
    Name: string;
    Email: string;
    BirthDate: string;
    Gender: string;
    ResearchNodeId: string;
    VolunteerCode?: string;
    BloodType?: string;
    Height?: number;
    Weight?: number;
    ConsentStatus?: string;
    ClinicalConditionCodes?: string[];
    ClinicalEventCodes?: string[];
    MedicationCodes?: string[];
    AllergyIntoleranceCodes?: string[];
}

/**
 * Middleware Update Volunteer Payload (PascalCase - matches backend)
 */
interface UpdateVolunteerPayload extends Record<string, unknown> {
    Name?: string;
    Email?: string;
    BirthDate?: string;
    Gender?: string;
    BloodType?: string;
    Height?: number;
    Weight?: number;
    ConsentStatus?: string;
    ClinicalConditionCodes?: string[];
    ClinicalEventCodes?: string[];
    MedicationCodes?: string[];
    AllergyIntoleranceCodes?: string[];
}

/**
 * Volunteer Service Implementation
 */
export class VolunteerService extends BaseService {
    private readonly USE_MOCK = false;

    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'VolunteerService',
            debug: true
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

    // ==================== Mock Data ====================

    private static readonly MOCK_VOLUNTEERS: Volunteer[] = [
        { id: 'vol-001', researchNodeId: 'node-1', volunteerCode: 'VC-001', name: 'Ana Clara Mendes', email: 'ana.mendes@gmail.com', birthDate: new Date(1985, 2, 14), gender: VolunteerGender.FEMALE, bloodType: BloodType.A_POSITIVE, height: 1.65, weight: 58, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-06-10'), updatedAt: new Date('2025-06-10') },
        { id: 'vol-002', researchNodeId: 'node-1', volunteerCode: 'VC-002', name: 'Carlos Eduardo Ferreira', email: 'carlos.ferreira@outlook.com', birthDate: new Date(1978, 7, 22), gender: VolunteerGender.MALE, bloodType: BloodType.O_POSITIVE, height: 1.78, weight: 82, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-06-12'), updatedAt: new Date('2025-06-12') },
        { id: 'vol-003', researchNodeId: 'node-1', volunteerCode: 'VC-003', name: 'Beatriz Oliveira Santos', email: 'bia.santos@hotmail.com', birthDate: new Date(1992, 0, 5), gender: VolunteerGender.FEMALE, bloodType: BloodType.B_NEGATIVE, height: 1.60, weight: 55, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-06-15'), updatedAt: new Date('2025-07-01') },
        { id: 'vol-004', researchNodeId: 'node-1', volunteerCode: 'VC-004', name: 'Rafael Almeida Costa', email: 'rafael.costa@gmail.com', birthDate: new Date(1990, 10, 30), gender: VolunteerGender.MALE, bloodType: BloodType.AB_POSITIVE, height: 1.82, weight: 88, consentStatus: ConsentStatus.REVOKED, enrolledAt: new Date('2025-05-20'), updatedAt: new Date('2025-09-15') },
        { id: 'vol-005', researchNodeId: 'node-1', volunteerCode: 'VC-005', name: 'Juliana Pereira Lima', email: 'juliana.lima@usp.br', birthDate: new Date(1988, 5, 18), gender: VolunteerGender.FEMALE, bloodType: BloodType.O_NEGATIVE, height: 1.70, weight: 62, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-07-01'), updatedAt: new Date('2025-07-01') },
        { id: 'vol-006', researchNodeId: 'node-1', volunteerCode: 'VC-006', name: 'Fernando Henrique Souza', email: 'fernando.souza@unicamp.br', birthDate: new Date(1975, 3, 8), gender: VolunteerGender.MALE, bloodType: BloodType.A_NEGATIVE, height: 1.75, weight: 78, consentStatus: ConsentStatus.PENDING, enrolledAt: new Date('2025-04-10'), updatedAt: new Date('2025-08-20') },
        { id: 'vol-007', researchNodeId: 'node-1', volunteerCode: 'VC-007', name: 'Mariana Rodrigues Silva', email: 'mariana.silva@gmail.com', birthDate: new Date(1995, 8, 25), gender: VolunteerGender.FEMALE, bloodType: BloodType.B_POSITIVE, height: 1.68, weight: 60, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-07-15'), updatedAt: new Date('2025-07-15') },
        { id: 'vol-008', researchNodeId: 'node-1', volunteerCode: 'VC-008', name: 'Lucas Gabriel Martins', email: 'lucas.martins@outlook.com', birthDate: new Date(1982, 1, 12), gender: VolunteerGender.MALE, bloodType: BloodType.AB_NEGATIVE, height: 1.80, weight: 85, consentStatus: ConsentStatus.REVOKED, enrolledAt: new Date('2025-06-01'), updatedAt: new Date('2025-10-05') },
        { id: 'vol-009', researchNodeId: 'node-1', volunteerCode: 'VC-009', name: 'Camila Nascimento Rocha', email: 'camila.rocha@gmail.com', birthDate: new Date(1998, 11, 3), gender: VolunteerGender.FEMALE, bloodType: BloodType.O_POSITIVE, height: 1.62, weight: 52, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-08-01'), updatedAt: new Date('2025-08-01') },
        { id: 'vol-010', researchNodeId: 'node-1', volunteerCode: 'VC-010', name: 'Thiago Barbosa Nunes', email: 'thiago.nunes@hotmail.com', birthDate: new Date(1987, 6, 19), gender: VolunteerGender.MALE, bloodType: BloodType.A_POSITIVE, height: 1.76, weight: 80, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-08-10'), updatedAt: new Date('2025-08-10') },
        { id: 'vol-011', researchNodeId: 'node-1', volunteerCode: 'VC-011', name: 'Larissa Campos Teixeira', email: 'larissa.teixeira@unifesp.br', birthDate: new Date(1993, 4, 27), gender: VolunteerGender.FEMALE, height: 1.64, weight: 57, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-03-15'), updatedAt: new Date('2025-07-30') },
        { id: 'vol-012', researchNodeId: 'node-1', volunteerCode: 'VC-012', name: 'Gabriel Santos Araujo', email: 'gabriel.araujo@gmail.com', birthDate: new Date(1980, 9, 15), gender: VolunteerGender.MALE, height: 1.85, weight: 90, consentStatus: ConsentStatus.GRANTED, enrolledAt: new Date('2025-09-01'), updatedAt: new Date('2025-09-01') },
    ];

    // ==================== CRUD Operations ====================

    /**
     * Get paginated list of volunteers
     */
    async getVolunteersPaginated(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<Volunteer>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const all = VolunteerService.MOCK_VOLUNTEERS;
                    const start = (page - 1) * pageSize;
                    const data = all.slice(start, start + pageSize);

                    resolve({
                        data,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: all.length
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching volunteers (page: ${page}, pageSize: ${pageSize})`);

            await this.ensureSession();

            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<VolunteerDTO>>({
                path: `/api/Volunteer/GetAllPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            this.log(`Retrieved ${response.data?.length || 0} volunteers`);

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
     * Get volunteer by ID
     */
    async getVolunteerById(id: string): Promise<Volunteer> {
        if (this.USE_MOCK) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const volunteer = VolunteerService.MOCK_VOLUNTEERS.find(v => v.id === id);
                    if (volunteer) {
                        resolve(volunteer);
                    } else {
                        reject(new Error('Volunteer not found'));
                    }
                }, 300);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching volunteer by ID: ${id}`);

            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, VolunteerDTO>({
                path: `/api/Volunteer/${id}`,
                method: 'GET',
                payload: {}
            });

            return this.convertToVolunteer(response);
        });
    }

    /**
     * Create new volunteer
     */
    async createVolunteer(volunteerData: NewVolunteerData): Promise<Volunteer> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        id: `mock-volunteer-new-${Date.now()}`,
                        researchNodeId: 'node-1',
                        volunteerCode: volunteerData.volunteerCode || `VC-${Date.now()}`,
                        name: volunteerData.name,
                        email: volunteerData.email,
                        birthDate: new Date(volunteerData.birthDate),
                        gender: volunteerData.gender,
                        bloodType: volunteerData.bloodType,
                        height: volunteerData.height,
                        weight: volunteerData.weight,
                        consentStatus: volunteerData.consentStatus || ConsentStatus.PENDING,
                        clinicalConditionCodes: volunteerData.clinicalConditionCodes,
                        clinicalEventCodes: volunteerData.clinicalEventCodes,
                        medicationCodes: volunteerData.medicationCodes,
                        allergyIntoleranceCodes: volunteerData.allergyIntoleranceCodes,
                        enrolledAt: new Date(),
                        updatedAt: new Date()
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating new volunteer:', volunteerData.name);

            this.validateVolunteerData(volunteerData);

            await this.ensureSession();

            const middlewarePayload: AddVolunteerPayload = {
                Name: volunteerData.name,
                Email: volunteerData.email,
                BirthDate: volunteerData.birthDate,
                Gender: volunteerData.gender,
                ResearchNodeId: import.meta.env.VITE_IRN_MIDDLEWARE_RESEARCH_NODE_ID || '',
                VolunteerCode: volunteerData.volunteerCode,
                BloodType: volunteerData.bloodType,
                Height: volunteerData.height,
                Weight: volunteerData.weight,
                ConsentStatus: volunteerData.consentStatus,
                ClinicalConditionCodes: volunteerData.clinicalConditionCodes,
                ClinicalEventCodes: volunteerData.clinicalEventCodes,
                MedicationCodes: volunteerData.medicationCodes,
                AllergyIntoleranceCodes: volunteerData.allergyIntoleranceCodes
            };

            const response = await this.middleware.invoke<AddVolunteerPayload, VolunteerDTO>({
                path: '/api/Volunteer/New',
                method: 'POST',
                payload: middlewarePayload
            });

            this.log('Volunteer created:', response.id || response.volunteerId);

            return this.convertToVolunteer(response);
        });
    }

    /**
     * Update existing volunteer
     */
    async updateVolunteer(id: string, data: UpdateVolunteerData): Promise<Volunteer> {
        if (this.USE_MOCK) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const existing = VolunteerService.MOCK_VOLUNTEERS.find(v => v.id === id);
                    if (!existing) {
                        reject(new Error('Volunteer not found'));
                        return;
                    }
                    resolve({
                        ...existing,
                        ...data,
                        birthDate: data.birthDate ? new Date(data.birthDate) : existing.birthDate,
                        gender: data.gender || existing.gender,
                        consentStatus: data.consentStatus || existing.consentStatus,
                        updatedAt: new Date()
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Updating volunteer: ${id}`);

            await this.ensureSession();

            const middlewarePayload: UpdateVolunteerPayload = {
                Name: data.name,
                Email: data.email,
                BirthDate: data.birthDate,
                Gender: data.gender,
                BloodType: data.bloodType,
                Height: data.height,
                Weight: data.weight,
                ConsentStatus: data.consentStatus,
                ClinicalConditionCodes: data.clinicalConditionCodes,
                ClinicalEventCodes: data.clinicalEventCodes,
                MedicationCodes: data.medicationCodes,
                AllergyIntoleranceCodes: data.allergyIntoleranceCodes
            };

            const response = await this.middleware.invoke<UpdateVolunteerPayload, VolunteerDTO>({
                path: `/api/Volunteer/Update/${id}`,
                method: 'PUT',
                payload: middlewarePayload
            });

            this.log('Volunteer updated:', id);

            return this.convertToVolunteer(response);
        });
    }

    /**
     * Delete volunteer
     */
    async deleteVolunteer(id: string): Promise<void> {
        if (this.USE_MOCK) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const index = VolunteerService.MOCK_VOLUNTEERS.findIndex(v => v.id === id);
                    if (index === -1) {
                        reject(new Error('Volunteer not found'));
                        return;
                    }
                    resolve();
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Deleting volunteer: ${id}`);

            await this.ensureSession();

            await this.middleware.invoke<Record<string, unknown>, void>({
                path: `/api/Volunteer/${id}`,
                method: 'DELETE',
                payload: {}
            });

            this.log('Volunteer deleted:', id);
        });
    }

    // ==================== Private Helpers ====================

    /**
     * Convert middleware VolunteerDTO to domain Volunteer type
     */
    private convertToVolunteer(dto: VolunteerDTO): Volunteer {
        return {
            id: dto.volunteerId || dto.id,
            researchNodeId: dto.researchNodeId,
            volunteerCode: dto.volunteerCode,
            name: dto.name,
            email: dto.email,
            birthDate: new Date(dto.birthDate),
            gender: this.mapGender(dto.gender),
            bloodType: dto.bloodType ? this.mapBloodType(dto.bloodType) : undefined,
            height: dto.height,
            weight: dto.weight,
            consentStatus: this.mapConsentStatus(dto.consentStatus),
            clinicalConditionCodes: dto.clinicalConditionCodes ?? [],
            clinicalEventCodes: dto.clinicalEventCodes ?? [],
            medicationCodes: dto.medicationCodes ?? [],
            allergyIntoleranceCodes: dto.allergyIntoleranceCodes ?? [],
            enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : undefined,
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
        };
    }

    /**
     * Map backend consent status string to domain ConsentStatus enum
     */
    private mapConsentStatus(status: string): ConsentStatus {
        const statusMap: Record<string, ConsentStatus> = {
            'Pending': ConsentStatus.PENDING,
            'pending': ConsentStatus.PENDING,
            'PENDING': ConsentStatus.PENDING,
            'Granted': ConsentStatus.GRANTED,
            'granted': ConsentStatus.GRANTED,
            'GRANTED': ConsentStatus.GRANTED,
            'Revoked': ConsentStatus.REVOKED,
            'revoked': ConsentStatus.REVOKED,
            'REVOKED': ConsentStatus.REVOKED
        };

        return statusMap[status] || ConsentStatus.PENDING;
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
     * Map backend blood type string to domain BloodType enum
     */
    private mapBloodType(bloodType: string): BloodType {
        const bloodTypeMap: Record<string, BloodType> = {
            'A+': BloodType.A_POSITIVE,
            'A-': BloodType.A_NEGATIVE,
            'B+': BloodType.B_POSITIVE,
            'B-': BloodType.B_NEGATIVE,
            'AB+': BloodType.AB_POSITIVE,
            'AB-': BloodType.AB_NEGATIVE,
            'O+': BloodType.O_POSITIVE,
            'O-': BloodType.O_NEGATIVE,
            'Unknown': BloodType.UNKNOWN
        };

        return bloodTypeMap[bloodType] || BloodType.UNKNOWN;
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
    protected convertToAuthError(error: unknown): import('@iris/domain').AuthError {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

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

        return super.convertToAuthError(error);
    }
}
