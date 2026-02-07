/**
 * Research Service
 *
 * Handles research project management operations with the InteroperableResearchNode backend.
 * Implements pagination, CRUD for research projects, and management of sub-entities:
 * researchers, volunteers, applications, devices, and sensors.
 *
 * Endpoints:
 * - GET /api/Research/GetAllPaginated - Get paginated list of research projects
 * - POST /api/Research/New - Create new research project
 * - PUT /api/Research/{id} - Update existing research project
 * - GET /api/Research/{id} - Get research detail
 * - DELETE /api/Research/{id} - Delete research
 * - GET/POST/PUT/DELETE /api/Research/{id}/researchers - Researcher management
 * - GET/POST/PUT/DELETE /api/Research/{id}/volunteers - Volunteer management
 * - GET/POST/PUT/DELETE /api/Research/{id}/applications - Application management
 * - GET/POST/PUT/DELETE /api/Research/{id}/devices - Device management
 * - GET /api/Research/{id}/devices/{did}/sensors - Sensor listing
 */

import { BaseService, type MiddlewareServices } from '../BaseService';
import {
    ResearchStatus,
    NodeAccessLevel,
    AuthorizationStatus,
    EnrollmentStatus,
    CalibrationStatus,
    ResearcherRole,
    VolunteerGender,
    ConsentStatus,
    type Research,
    type ResearchDetail,
    type ResearchResearcher,
    type ResearchVolunteer,
    type ResearchDevice,
    type Application,
    type Sensor,
    type NewResearchData,
    type UpdateResearchData,
    type AssignResearcherPayload,
    type UpdateResearchResearcherPayload,
    type EnrollVolunteerPayload,
    type UpdateResearchVolunteerPayload,
    type UpdateApplicationData,
    type AssignDevicePayload,
    type UpdateResearchDevicePayload,
    type NewApplicationData,
    type PaginatedResponse,
    type AuthError,
    type AuthErrorCode,
    type ResearchNodeConnection
} from '@iris/domain';

// ── Response DTOs (camelCase - matches backend JSON serialization) ──────

interface ResearchDTO {
    id: string;
    title: string;
    description: string;
    endDate?: string | null;
    status: string;
    researchNode?: ResearchNodeConnectionDTO;
}

interface ResearchNodeConnectionDTO {
    id: string;
    nodeName: string;
    nodeUrl: string;
    status: string;
    nodeAccessLevel: string;
    registeredAt: string;
    updatedAt: string;
}

interface ResearchDetailDTO {
    id: string;
    researchNodeId: string;
    title: string;
    description: string;
    startDate?: string | null;
    endDate?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    researchNode?: ResearchNodeConnectionDTO;
    researcherCount: number;
    volunteerCount: number;
    applicationCount: number;
    deviceCount: number;
}

interface ResearchResearcherDTO {
    researchId: string;
    researcherId: string;
    researcherName: string;
    email: string;
    institution: string;
    role: string;
    orcid: string;
    isPrincipal: boolean;
    assignedAt: string;
    removedAt?: string | null;
}

interface ResearchVolunteerDTO {
    researchId: string;
    volunteerId: string;
    volunteerName: string;
    volunteerCode: string;
    email: string;
    enrollmentStatus: string;
    consentDate: string;
    consentVersion: string;
    exclusionReason?: string | null;
    enrolledAt: string;
    withdrawnAt?: string | null;
}

interface ApplicationDTO {
    applicationId: string;
    researchId: string;
    appName: string;
    url: string;
    description: string;
    additionalInfo: string;
    createdAt: string;
    updatedAt: string;
}

interface ResearchDeviceDTO {
    researchId: string;
    deviceId: string;
    deviceName: string;
    manufacturer: string;
    model: string;
    role: string;
    calibrationStatus: string;
    lastCalibrationDate?: string | null;
    addedAt: string;
    removedAt?: string | null;
    sensorCount: number;
}

interface SensorDTO {
    sensorId: string;
    deviceId: string;
    sensorName: string;
    maxSamplingRate: number;
    unit: string;
    minRange: number;
    maxRange: number;
    accuracy: number;
    additionalInfo: string;
    createdAt: string;
    updatedAt: string;
}

// ── Middleware Payloads (PascalCase - matches backend) ──────────────────

interface AddResearchPayload extends Record<string, unknown> {
    Title: string;
    Description: string;
    ResearchNodeId: string;
}

interface UpdateResearchMWPayload extends Record<string, unknown> {
    Title?: string;
    Description?: string;
    EndDate?: string | null;
    Status?: string;
}

interface AddResearchResearcherMWPayload extends Record<string, unknown> {
    ResearcherId: string;
    IsPrincipal: boolean;
}

interface UpdateResearchResearcherMWPayload extends Record<string, unknown> {
    IsPrincipal?: boolean;
}

interface AddResearchVolunteerMWPayload extends Record<string, unknown> {
    VolunteerId: string;
    ConsentDate: string;
    ConsentVersion: string;
}

interface UpdateResearchVolunteerMWPayload extends Record<string, unknown> {
    EnrollmentStatus?: string;
    ConsentDate?: string;
    ConsentVersion?: string;
    ExclusionReason?: string;
}

interface AddApplicationMWPayload extends Record<string, unknown> {
    AppName: string;
    Url: string;
    Description?: string;
    AdditionalInfo?: string;
}

interface UpdateApplicationMWPayload extends Record<string, unknown> {
    AppName?: string;
    Url?: string;
    Description?: string;
    AdditionalInfo?: string;
}

interface CreateDeviceMWPayload extends Record<string, unknown> {
    DeviceName: string;
    Manufacturer: string;
    Model: string;
    AdditionalInfo?: string;
}

interface CreateDeviceResponseDTO {
    deviceId: string;
    deviceName: string;
    manufacturer: string;
    model: string;
    additionalInfo: string;
    createdAt: string;
    sensorCount: number;
}

interface CreateSensorMWPayload extends Record<string, unknown> {
    DeviceId: string;
    SensorName: string;
    MaxSamplingRate: number;
    Unit: string;
    MinRange: number;
    MaxRange: number;
    Accuracy: number;
    AdditionalInfo?: string;
}

interface AddResearchDeviceMWPayload extends Record<string, unknown> {
    DeviceId: string;
    Role: string;
    CalibrationStatus: string;
    LastCalibrationDate?: string;
}

interface UpdateResearchDeviceMWPayload extends Record<string, unknown> {
    Role?: string;
    CalibrationStatus?: string;
    LastCalibrationDate?: string;
}

// ── Research Service Implementation ────────────────────────────────────

export class ResearchService extends BaseService {
    private readonly USE_MOCK = false;

    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'ResearchService',
            debug: true
        });
    }

    async initialize(): Promise<void> {
        this.log('Service initialized');
    }

    async dispose(): Promise<void> {
        this.log('Service disposed');
    }

    // ==================== Research List & CRUD ====================

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
            await this.ensureSession();

            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchDTO>>({
                path: `/api/Research/GetAllPaginated?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            this.log(`Retrieved ${response.data?.length || 0} research projects`);

            const researchProjects = (response.data || []).map(this.convertToResearch.bind(this));

            return {
                data: researchProjects,
                currentPage: response.currentPage || 0,
                pageSize: response.pageSize || researchProjects.length,
                totalRecords: response.totalRecords || researchProjects.length
            };
        });
    }

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
            this.validateResearchData(researchData);
            await this.ensureSession();

            const middlewarePayload: AddResearchPayload = {
                Title: researchData.title,
                Description: researchData.description,
                ResearchNodeId: researchData.researchNodeId,
            };

            const response = await this.middleware.invoke<AddResearchPayload, ResearchDTO>({
                path: '/api/Research/New',
                method: 'POST',
                payload: middlewarePayload
            });

            this.log('Research project created:', response.id);
            return this.convertToResearch(response);
        });
    }

    async updateResearch(id: string, data: UpdateResearchData): Promise<Research> {
        return this.handleMiddlewareError(async () => {
            this.log(`Updating research project: ${id}`);
            await this.ensureSession();

            const statusToBackend: Record<string, string> = {
                [ResearchStatus.PLANNING]: 'Planning',
                [ResearchStatus.ACTIVE]: 'Active',
                [ResearchStatus.COMPLETED]: 'Completed',
                [ResearchStatus.SUSPENDED]: 'Suspended',
                [ResearchStatus.CANCELLED]: 'Cancelled',
            };

            const middlewarePayload: UpdateResearchMWPayload = {};
            if (data.title !== undefined) middlewarePayload.Title = data.title;
            if (data.description !== undefined) middlewarePayload.Description = data.description;
            if (data.endDate !== undefined) middlewarePayload.EndDate = data.endDate;
            if (data.status !== undefined) middlewarePayload.Status = statusToBackend[data.status] ?? data.status;

            const response = await this.middleware.invoke<UpdateResearchMWPayload, ResearchDTO>({
                path: `/api/Research/${id}`,
                method: 'PUT',
                payload: middlewarePayload
            });

            this.log('Research project updated:', response.id);
            return this.convertToResearch(response);
        });
    }

    // ==================== Research Detail ====================

    async getResearchById(id: string): Promise<ResearchDetail> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching research detail: ${id}`);
            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, ResearchDetailDTO>({
                path: `/api/Research/${id}`,
                method: 'GET',
                payload: {}
            });

            return this.convertToResearchDetail(response);
        });
    }

    async deleteResearch(id: string): Promise<void> {
        return this.handleMiddlewareError(async () => {
            this.log(`Deleting research: ${id}`);
            await this.ensureSession();

            await this.middleware.invoke<Record<string, unknown>, void>({
                path: `/api/Research/${id}`,
                method: 'DELETE',
                payload: {}
            });

            this.log('Research deleted:', id);
        });
    }

    // ==================== Researchers ====================

    async getResearchResearchers(researchId: string): Promise<ResearchResearcher[]> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching researchers for research: ${researchId}`);
            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchResearcherDTO>>({
                path: `/api/Research/${researchId}/researchers`,
                method: 'GET',
                payload: {}
            });

            return (response.data || []).map((dto: ResearchResearcherDTO) => this.convertToResearchResearcher(dto));
        });
    }

    async addResearchResearcher(
        researchId: string,
        payload: AssignResearcherPayload
    ): Promise<ResearchResearcher> {
        return this.handleMiddlewareError(async () => {
            this.log(`Assigning researcher to research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: AddResearchResearcherMWPayload = {
                ResearcherId: payload.researcherId,
                IsPrincipal: payload.isPrincipal
            };

            const response = await this.middleware.invoke<AddResearchResearcherMWPayload, ResearchResearcherDTO>({
                path: `/api/Research/${researchId}/researchers`,
                method: 'POST',
                payload: middlewarePayload
            });

            return this.convertToResearchResearcher(response);
        });
    }

    async updateResearchResearcher(
        researchId: string,
        researcherId: string,
        payload: UpdateResearchResearcherPayload
    ): Promise<ResearchResearcher> {
        return this.handleMiddlewareError(async () => {
            this.log(`Updating researcher ${researcherId} in research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: UpdateResearchResearcherMWPayload = {
                IsPrincipal: payload.isPrincipal
            };

            const response = await this.middleware.invoke<UpdateResearchResearcherMWPayload, ResearchResearcherDTO>({
                path: `/api/Research/${researchId}/researchers/${researcherId}`,
                method: 'PUT',
                payload: middlewarePayload
            });

            return this.convertToResearchResearcher(response);
        });
    }

    async removeResearchResearcher(researchId: string, researcherId: string): Promise<void> {
        return this.handleMiddlewareError(async () => {
            this.log(`Removing researcher ${researcherId} from research: ${researchId}`);
            await this.ensureSession();

            await this.middleware.invoke<Record<string, unknown>, void>({
                path: `/api/Research/${researchId}/researchers/${researcherId}`,
                method: 'DELETE',
                payload: {}
            });
        });
    }

    // ==================== Volunteers ====================

    async getResearchVolunteers(researchId: string): Promise<ResearchVolunteer[]> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching volunteers for research: ${researchId}`);
            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchVolunteerDTO>>({
                path: `/api/Research/${researchId}/volunteers`,
                method: 'GET',
                payload: {}
            });

            return (response.data || []).map((dto: ResearchVolunteerDTO) => this.convertToResearchVolunteer(dto));
        });
    }

    async enrollVolunteer(
        researchId: string,
        payload: EnrollVolunteerPayload
    ): Promise<ResearchVolunteer> {
        return this.handleMiddlewareError(async () => {
            this.log(`Enrolling volunteer in research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: AddResearchVolunteerMWPayload = {
                VolunteerId: payload.volunteerId,
                ConsentDate: payload.consentDate,
                ConsentVersion: payload.consentVersion
            };

            const response = await this.middleware.invoke<AddResearchVolunteerMWPayload, ResearchVolunteerDTO>({
                path: `/api/Research/${researchId}/volunteers`,
                method: 'POST',
                payload: middlewarePayload
            });

            return this.convertToResearchVolunteer(response);
        });
    }

    async updateResearchVolunteer(
        researchId: string,
        volunteerId: string,
        payload: UpdateResearchVolunteerPayload
    ): Promise<ResearchVolunteer> {
        return this.handleMiddlewareError(async () => {
            this.log(`Updating volunteer ${volunteerId} in research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: UpdateResearchVolunteerMWPayload = {};
            if (payload.enrollmentStatus !== undefined) middlewarePayload.EnrollmentStatus = payload.enrollmentStatus;
            if (payload.consentDate !== undefined) middlewarePayload.ConsentDate = payload.consentDate;
            if (payload.consentVersion !== undefined) middlewarePayload.ConsentVersion = payload.consentVersion;
            if (payload.exclusionReason !== undefined) middlewarePayload.ExclusionReason = payload.exclusionReason;

            const response = await this.middleware.invoke<UpdateResearchVolunteerMWPayload, ResearchVolunteerDTO>({
                path: `/api/Research/${researchId}/volunteers/${volunteerId}`,
                method: 'PUT',
                payload: middlewarePayload
            });

            return this.convertToResearchVolunteer(response);
        });
    }

    async removeResearchVolunteer(researchId: string, volunteerId: string): Promise<void> {
        return this.handleMiddlewareError(async () => {
            this.log(`Removing volunteer ${volunteerId} from research: ${researchId}`);
            await this.ensureSession();

            await this.middleware.invoke<Record<string, unknown>, void>({
                path: `/api/Research/${researchId}/volunteers/${volunteerId}`,
                method: 'DELETE',
                payload: {}
            });
        });
    }

    // ==================== Applications ====================

    async getResearchApplications(researchId: string): Promise<Application[]> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching applications for research: ${researchId}`);
            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<ApplicationDTO>>({
                path: `/api/Research/${researchId}/applications`,
                method: 'GET',
                payload: {}
            });

            return (response.data || []).map((dto: ApplicationDTO) => this.convertToApplication(dto));
        });
    }

    async addApplication(researchId: string, payload: NewApplicationData): Promise<Application> {
        return this.handleMiddlewareError(async () => {
            this.log(`Adding application to research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: AddApplicationMWPayload = {
                AppName: payload.name,
                Url: payload.url,
                Description: payload.description,
                AdditionalInfo: payload.additionalInfo
            };

            const response = await this.middleware.invoke<AddApplicationMWPayload, ApplicationDTO>({
                path: `/api/Research/${researchId}/applications`,
                method: 'POST',
                payload: middlewarePayload
            });

            return this.convertToApplication(response);
        });
    }

    async updateApplication(
        researchId: string,
        applicationId: string,
        payload: UpdateApplicationData
    ): Promise<Application> {
        return this.handleMiddlewareError(async () => {
            this.log(`Updating application ${applicationId} in research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: UpdateApplicationMWPayload = {};
            if (payload.name !== undefined) middlewarePayload.AppName = payload.name;
            if (payload.url !== undefined) middlewarePayload.Url = payload.url;
            if (payload.description !== undefined) middlewarePayload.Description = payload.description;
            if (payload.additionalInfo !== undefined) middlewarePayload.AdditionalInfo = payload.additionalInfo;

            const response = await this.middleware.invoke<UpdateApplicationMWPayload, ApplicationDTO>({
                path: `/api/Research/${researchId}/applications/${applicationId}`,
                method: 'PUT',
                payload: middlewarePayload
            });

            return this.convertToApplication(response);
        });
    }

    async deleteApplication(researchId: string, applicationId: string): Promise<void> {
        return this.handleMiddlewareError(async () => {
            this.log(`Deleting application ${applicationId} from research: ${researchId}`);
            await this.ensureSession();

            await this.middleware.invoke<Record<string, unknown>, void>({
                path: `/api/Research/${researchId}/applications/${applicationId}`,
                method: 'DELETE',
                payload: {}
            });
        });
    }

    // ==================== Devices ====================

    async getResearchDevices(researchId: string): Promise<ResearchDevice[]> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching devices for research: ${researchId}`);
            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchDeviceDTO>>({
                path: `/api/Research/${researchId}/devices`,
                method: 'GET',
                payload: {}
            });

            return (response.data || []).map((dto: ResearchDeviceDTO) => this.convertToResearchDevice(dto));
        });
    }

    async addResearchDevice(researchId: string, payload: AssignDevicePayload): Promise<ResearchDevice> {
        return this.handleMiddlewareError(async () => {
            this.log(`Adding device to research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: AddResearchDeviceMWPayload = {
                DeviceId: payload.deviceId,
                Role: payload.role,
                CalibrationStatus: payload.calibrationStatus,
                LastCalibrationDate: payload.lastCalibrationDate
            };

            const response = await this.middleware.invoke<AddResearchDeviceMWPayload, ResearchDeviceDTO>({
                path: `/api/Research/${researchId}/devices`,
                method: 'POST',
                payload: middlewarePayload
            });

            return this.convertToResearchDevice(response);
        });
    }

    async updateResearchDevice(
        researchId: string,
        deviceId: string,
        payload: UpdateResearchDevicePayload
    ): Promise<ResearchDevice> {
        return this.handleMiddlewareError(async () => {
            this.log(`Updating device ${deviceId} in research: ${researchId}`);
            await this.ensureSession();

            const middlewarePayload: UpdateResearchDeviceMWPayload = {};
            if (payload.role !== undefined) middlewarePayload.Role = payload.role;
            if (payload.calibrationStatus !== undefined) middlewarePayload.CalibrationStatus = payload.calibrationStatus;
            if (payload.lastCalibrationDate !== undefined) middlewarePayload.LastCalibrationDate = payload.lastCalibrationDate;

            const response = await this.middleware.invoke<UpdateResearchDeviceMWPayload, ResearchDeviceDTO>({
                path: `/api/Research/${researchId}/devices/${deviceId}`,
                method: 'PUT',
                payload: middlewarePayload
            });

            return this.convertToResearchDevice(response);
        });
    }

    async removeResearchDevice(researchId: string, deviceId: string): Promise<void> {
        return this.handleMiddlewareError(async () => {
            this.log(`Removing device ${deviceId} from research: ${researchId}`);
            await this.ensureSession();

            await this.middleware.invoke<Record<string, unknown>, void>({
                path: `/api/Research/${researchId}/devices/${deviceId}`,
                method: 'DELETE',
                payload: {}
            });
        });
    }

    async createDeviceAndAssign(
        researchId: string,
        deviceData: { name: string; manufacturer: string; model: string; additionalInfo?: string },
        role: string = 'Primary',
        calibrationStatus: string = 'NotCalibrated'
    ): Promise<ResearchDevice> {
        return this.handleMiddlewareError(async () => {
            this.log(`Creating device and assigning to research: ${researchId}`);
            await this.ensureSession();

            const createPayload: CreateDeviceMWPayload = {
                DeviceName: deviceData.name,
                Manufacturer: deviceData.manufacturer,
                Model: deviceData.model,
                AdditionalInfo: deviceData.additionalInfo
            };

            const created = await this.middleware.invoke<CreateDeviceMWPayload, CreateDeviceResponseDTO>({
                path: '/api/Device/New',
                method: 'POST',
                payload: createPayload
            });

            const assignPayload: AddResearchDeviceMWPayload = {
                DeviceId: created.deviceId,
                Role: role,
                CalibrationStatus: calibrationStatus
            };

            const assigned = await this.middleware.invoke<AddResearchDeviceMWPayload, ResearchDeviceDTO>({
                path: `/api/Research/${researchId}/devices`,
                method: 'POST',
                payload: assignPayload
            });

            return this.convertToResearchDevice(assigned);
        });
    }

    // ==================== Sensors ====================

    async getDeviceSensors(researchId: string, deviceId: string): Promise<Sensor[]> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching sensors for device ${deviceId} in research: ${researchId}`);
            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SensorDTO>>({
                path: `/api/Research/${researchId}/devices/${deviceId}/sensors`,
                method: 'GET',
                payload: {}
            });

            return (response.data || []).map((dto: SensorDTO) => this.convertToSensor(dto));
        });
    }

    async getAllResearchSensors(researchId: string): Promise<Sensor[]> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching all sensors for research: ${researchId}`);
            await this.ensureSession();

            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<SensorDTO>>({
                path: `/api/Research/${researchId}/sensors`,
                method: 'GET',
                payload: {}
            });

            return (response.data || []).map((dto: SensorDTO) => this.convertToSensor(dto));
        });
    }

    async createSensor(deviceId: string, sensorData: {
        name: string;
        maxSamplingRate: number;
        unit: string;
        accuracy: number;
        minRange: number;
        maxRange: number;
        additionalInfo?: string;
    }): Promise<Sensor> {
        return this.handleMiddlewareError(async () => {
            this.log(`Creating sensor for device: ${deviceId}`);
            await this.ensureSession();

            const payload: CreateSensorMWPayload = {
                DeviceId: deviceId,
                SensorName: sensorData.name,
                MaxSamplingRate: sensorData.maxSamplingRate,
                Unit: sensorData.unit,
                MinRange: sensorData.minRange,
                MaxRange: sensorData.maxRange,
                Accuracy: sensorData.accuracy,
                AdditionalInfo: sensorData.additionalInfo
            };

            const response = await this.middleware.invoke<CreateSensorMWPayload, SensorDTO>({
                path: '/api/Sensor/New',
                method: 'POST',
                payload
            });

            return this.convertToSensor(response);
        });
    }

    // ==================== DTO Mappers (Private) ====================

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

    private convertToResearchDetail(dto: ResearchDetailDTO): ResearchDetail {
        return {
            id: dto.id,
            title: dto.title,
            description: dto.description,
            startDate: dto.startDate ?? null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            status: this.mapStatus(dto.status),
            researchNode: dto.researchNode
                ? this.convertToResearchNodeConnection(dto.researchNode)
                : undefined,
            researcherCount: dto.researcherCount,
            volunteerCount: dto.volunteerCount,
            applicationCount: dto.applicationCount,
            deviceCount: dto.deviceCount,
        };
    }

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

    private convertToResearchResearcher(dto: ResearchResearcherDTO): ResearchResearcher {
        return {
            researchId: dto.researchId,
            researcherId: dto.researcherId,
            isPrincipal: dto.isPrincipal,
            assignedAt: dto.assignedAt,
            removedAt: dto.removedAt ?? null,
            researcher: {
                researcherId: dto.researcherId,
                researchNodeId: '',
                name: dto.researcherName,
                email: dto.email,
                institution: dto.institution,
                role: this.mapResearcherRole(dto.role),
                orcid: dto.orcid,
            },
        };
    }

    private convertToResearchVolunteer(dto: ResearchVolunteerDTO): ResearchVolunteer {
        return {
            researchId: dto.researchId,
            volunteerId: dto.volunteerId,
            enrollmentStatus: this.mapEnrollmentStatus(dto.enrollmentStatus),
            consentDate: dto.consentDate ?? null,
            consentVersion: dto.consentVersion ?? null,
            exclusionReason: dto.exclusionReason ?? null,
            volunteer: {
                id: dto.volunteerId,
                researchNodeId: '',
                volunteerCode: dto.volunteerCode,
                name: dto.volunteerName,
                email: dto.email,
                birthDate: new Date(),
                gender: VolunteerGender.NOT_INFORMED,
                consentStatus: ConsentStatus.PENDING,
            },
        };
    }

    private convertToApplication(dto: ApplicationDTO): Application {
        return {
            id: dto.applicationId,
            researchId: dto.researchId,
            name: dto.appName,
            url: dto.url,
            description: dto.description,
            additionalInfo: dto.additionalInfo,
            createdAt: new Date(dto.createdAt),
            updatedAt: new Date(dto.updatedAt),
        };
    }

    private convertToResearchDevice(dto: ResearchDeviceDTO): ResearchDevice {
        return {
            researchId: dto.researchId,
            deviceId: dto.deviceId,
            role: dto.role,
            calibrationStatus: this.mapCalibrationStatus(dto.calibrationStatus),
            lastCalibrationDate: dto.lastCalibrationDate ?? null,
            addedAt: dto.addedAt,
            removedAt: dto.removedAt ?? null,
            deviceName: dto.deviceName,
            manufacturer: dto.manufacturer,
            model: dto.model,
            sensorCount: dto.sensorCount,
        };
    }

    private convertToSensor(dto: SensorDTO): Sensor {
        return {
            id: dto.sensorId,
            deviceId: dto.deviceId,
            name: dto.sensorName,
            maxSamplingRate: dto.maxSamplingRate,
            unit: dto.unit,
            minRange: dto.minRange,
            maxRange: dto.maxRange,
            accuracy: dto.accuracy,
            additionalInfo: dto.additionalInfo,
            createdAt: new Date(dto.createdAt),
            updatedAt: new Date(dto.updatedAt),
        };
    }

    // ==================== Enum Mappers ====================

    private mapStatus(status: string): ResearchStatus {
        const statusMap: Record<string, ResearchStatus> = {
            'planning': ResearchStatus.PLANNING,
            'active': ResearchStatus.ACTIVE,
            'completed': ResearchStatus.COMPLETED,
            'suspended': ResearchStatus.SUSPENDED,
            'archived': ResearchStatus.CANCELLED,
            'cancelled': ResearchStatus.CANCELLED,
            'PLANNING': ResearchStatus.PLANNING,
            'ACTIVE': ResearchStatus.ACTIVE,
            'COMPLETED': ResearchStatus.COMPLETED,
            'SUSPENDED': ResearchStatus.SUSPENDED,
            'ARCHIVED': ResearchStatus.CANCELLED,
            'CANCELLED': ResearchStatus.CANCELLED,
            'Planning': ResearchStatus.PLANNING,
            'Active': ResearchStatus.ACTIVE,
            'Completed': ResearchStatus.COMPLETED,
            'Suspended': ResearchStatus.SUSPENDED,
            'Archived': ResearchStatus.CANCELLED,
            'Cancelled': ResearchStatus.CANCELLED
        };

        return statusMap[status] || ResearchStatus.PLANNING;
    }

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

    private mapEnrollmentStatus(status: string): EnrollmentStatus {
        const map: Record<string, EnrollmentStatus> = {
            'enrolled': EnrollmentStatus.ENROLLED,
            'Enrolled': EnrollmentStatus.ENROLLED,
            'active': EnrollmentStatus.ACTIVE,
            'Active': EnrollmentStatus.ACTIVE,
            'withdrawn': EnrollmentStatus.WITHDRAWN,
            'Withdrawn': EnrollmentStatus.WITHDRAWN,
            'excluded': EnrollmentStatus.EXCLUDED,
            'Excluded': EnrollmentStatus.EXCLUDED,
            'completed': EnrollmentStatus.COMPLETED,
            'Completed': EnrollmentStatus.COMPLETED,
        };
        return map[status] || EnrollmentStatus.ENROLLED;
    }

    private mapCalibrationStatus(status: string): CalibrationStatus {
        const map: Record<string, CalibrationStatus> = {
            'notcalibrated': CalibrationStatus.NOT_CALIBRATED,
            'NotCalibrated': CalibrationStatus.NOT_CALIBRATED,
            'calibrated': CalibrationStatus.CALIBRATED,
            'Calibrated': CalibrationStatus.CALIBRATED,
            'expired': CalibrationStatus.EXPIRED,
            'Expired': CalibrationStatus.EXPIRED,
            'inprogress': CalibrationStatus.IN_PROGRESS,
            'InProgress': CalibrationStatus.IN_PROGRESS,
        };
        return map[status] || CalibrationStatus.NOT_CALIBRATED;
    }

    private mapResearcherRole(role: string): ResearcherRole {
        const map: Record<string, ResearcherRole> = {
            'chief_researcher': ResearcherRole.CHIEF,
            'Chief': ResearcherRole.CHIEF,
            'chief': ResearcherRole.CHIEF,
            'researcher': ResearcherRole.RESEARCHER,
            'Researcher': ResearcherRole.RESEARCHER,
        };
        return map[role] || ResearcherRole.RESEARCHER;
    }

    // ==================== Validation ====================

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

    protected convertToAuthError(error: unknown): AuthError {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

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

        return super.convertToAuthError(error);
    }
}
