/**
 * Research Service
 *
 * Communicates with InteroperableResearchNode backend through the encrypted
 * middleware channel. Provides DTO-to-ViewModel mapping as an anti-corruption
 * layer between backend response shapes and frontend domain types.
 *
 * Implements US-RC-033, US-RC-034, US-RC-035.
 */

import {
  type Research,
  type ResearchDetail,
  type ResearchStatus,
  type ResearchResearcher,
  type ResearchVolunteer,
  type ResearchDevice,
  type Application,
  type Sensor,
  type PaginatedResponse,
  type UpdateResearchData,
  type AssignResearcherPayload,
  type UpdateResearchResearcherPayload,
  type EnrollVolunteerPayload,
  type UpdateResearchVolunteerPayload,
  type NewApplicationData,
  type UpdateApplicationData,
  type AssignDevicePayload,
  type UpdateResearchDevicePayload,
  type Researcher,
  type Volunteer,
  ResearcherRole,
} from '@iris/domain';
import { middleware } from './middleware';

// ── Backend DTO interfaces (internal — not exported) ─────────

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

// ── DTO → ViewModel mappers ──────────────────────────────────

function mapApplication(dto: ApplicationDTO): Application {
  return {
    id: dto.applicationId,
    researchId: dto.researchId,
    name: dto.appName,
    url: dto.url,
    description: dto.description,
    additionalInfo: dto.additionalInfo,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

function mapSensor(dto: SensorDTO): Sensor {
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
  };
}

function parseResearcherRole(role: string): ResearcherRole {
  const roleMap: Record<string, ResearcherRole> = {
    chief_researcher: ResearcherRole.CHIEF,
    researcher: ResearcherRole.RESEARCHER,
  };
  return roleMap[role.toLowerCase()] ?? ResearcherRole.RESEARCHER;
}

function mapResearchResearcher(dto: ResearchResearcherDTO): ResearchResearcher {
  return {
    researchId: dto.researchId,
    researcherId: dto.researcherId,
    isPrincipal: dto.isPrincipal,
    assignedAt: dto.assignedAt,
    removedAt: dto.removedAt,
    researcher: {
      researcherId: dto.researcherId,
      researchNodeId: '',
      name: dto.researcherName,
      email: dto.email,
      institution: dto.institution,
      role: parseResearcherRole(dto.role),
      orcid: dto.orcid,
    } as Researcher,
  };
}

function mapResearchVolunteer(dto: ResearchVolunteerDTO): ResearchVolunteer {
  return {
    researchId: dto.researchId,
    volunteerId: dto.volunteerId,
    enrollmentStatus: dto.enrollmentStatus as ResearchVolunteer['enrollmentStatus'],
    consentDate: dto.consentDate,
    consentVersion: dto.consentVersion,
    exclusionReason: dto.exclusionReason,
    // Backend DTO only provides summary fields; cast to Volunteer since screens
    // access via optional chaining (volunteer?.name, volunteer?.email)
    volunteer: {
      id: dto.volunteerId,
      volunteerCode: dto.volunteerCode,
      name: dto.volunteerName,
      email: dto.email,
    } as Volunteer,
  };
}

// ── Payload mappers (frontend → backend) ─────────────────────

function mapNewApplicationPayload(data: NewApplicationData): Record<string, unknown> {
  return {
    appName: data.name,
    url: data.url,
    description: data.description,
    additionalInfo: data.additionalInfo ?? '',
  };
}

function mapUpdateApplicationPayload(data: UpdateApplicationData): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.appName = data.name;
  if (data.url !== undefined) payload.url = data.url;
  if (data.description !== undefined) payload.description = data.description;
  if (data.additionalInfo !== undefined) payload.additionalInfo = data.additionalInfo;
  return payload;
}

// ── Pagination helper ────────────────────────────────────────

function adjustPaginatedResponse<T>(response: PaginatedResponse<T>): PaginatedResponse<T> {
  return {
    ...response,
    currentPage: (response.currentPage ?? 1) - 1,
  };
}

// ── Service ──────────────────────────────────────────────────

class ResearchService {
  // ── Group 1: Research Core CRUD ──────────────────────────

  async getAll(page = 0, pageSize = 20): Promise<PaginatedResponse<Research>> {
    const apiPage = page + 1;
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<Research>>({
      path: `/api/research/GetAllPaginated?page=${apiPage}&pageSize=${pageSize}`,
      method: 'GET',
      payload: {},
    });
    return adjustPaginatedResponse(response);
  }

  async getById(researchId: string): Promise<ResearchDetail> {
    return middleware.invoke<Record<string, unknown>, ResearchDetail>({
      path: `/api/research/${researchId}`,
      method: 'GET',
      payload: {},
    });
  }

  async update(researchId: string, data: UpdateResearchData): Promise<ResearchDetail> {
    return middleware.invoke<Record<string, unknown>, ResearchDetail>({
      path: `/api/research/${researchId}`,
      method: 'PUT',
      payload: { ...data },
    });
  }

  async remove(researchId: string): Promise<void> {
    await middleware.invoke<Record<string, unknown>, unknown>({
      path: `/api/research/${researchId}`,
      method: 'DELETE',
      payload: {},
    });
  }

  async getByStatus(
    status: ResearchStatus,
    page = 0,
    pageSize = 20
  ): Promise<PaginatedResponse<Research>> {
    const apiPage = page + 1;
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<Research>>({
      path: `/api/research/GetByStatus?status=${status}&page=${apiPage}&pageSize=${pageSize}`,
      method: 'GET',
      payload: {},
    });
    return adjustPaginatedResponse(response);
  }

  async getActive(page = 0, pageSize = 20): Promise<PaginatedResponse<Research>> {
    const apiPage = page + 1;
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<Research>>({
      path: `/api/research/GetActive?page=${apiPage}&pageSize=${pageSize}`,
      method: 'GET',
      payload: {},
    });
    return adjustPaginatedResponse(response);
  }

  // ── Group 2: Research Researchers ────────────────────────

  async getResearchers(researchId: string): Promise<ResearchResearcher[]> {
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchResearcherDTO>>({
      path: `/api/research/${researchId}/researchers`,
      method: 'GET',
      payload: {},
    });
    return (response.data ?? []).map(mapResearchResearcher);
  }

  async assignResearcher(
    researchId: string,
    payload: AssignResearcherPayload
  ): Promise<ResearchResearcher> {
    const dto = await middleware.invoke<Record<string, unknown>, ResearchResearcherDTO>({
      path: `/api/research/${researchId}/researchers`,
      method: 'POST',
      payload: { ...payload },
    });
    return mapResearchResearcher(dto);
  }

  async removeResearcher(researchId: string, researcherId: string): Promise<void> {
    await middleware.invoke<Record<string, unknown>, unknown>({
      path: `/api/research/${researchId}/researchers/${researcherId}`,
      method: 'DELETE',
      payload: {},
    });
  }

  async updateResearcher(
    researchId: string,
    researcherId: string,
    payload: UpdateResearchResearcherPayload
  ): Promise<ResearchResearcher> {
    const dto = await middleware.invoke<Record<string, unknown>, ResearchResearcherDTO>({
      path: `/api/research/${researchId}/researchers/${researcherId}`,
      method: 'PUT',
      payload: { ...payload },
    });
    return mapResearchResearcher(dto);
  }

  // ── Group 3: Research Volunteers ─────────────────────────

  async getVolunteers(researchId: string): Promise<ResearchVolunteer[]> {
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchVolunteerDTO>>({
      path: `/api/research/${researchId}/volunteers`,
      method: 'GET',
      payload: {},
    });
    return (response.data ?? []).map(mapResearchVolunteer);
  }

  async enrollVolunteer(
    researchId: string,
    payload: EnrollVolunteerPayload
  ): Promise<ResearchVolunteer> {
    const dto = await middleware.invoke<Record<string, unknown>, ResearchVolunteerDTO>({
      path: `/api/research/${researchId}/volunteers`,
      method: 'POST',
      payload: { ...payload },
    });
    return mapResearchVolunteer(dto);
  }

  async withdrawVolunteer(researchId: string, volunteerId: string): Promise<void> {
    await middleware.invoke<Record<string, unknown>, unknown>({
      path: `/api/research/${researchId}/volunteers/${volunteerId}`,
      method: 'DELETE',
      payload: {},
    });
  }

  async updateVolunteer(
    researchId: string,
    volunteerId: string,
    payload: UpdateResearchVolunteerPayload
  ): Promise<ResearchVolunteer> {
    const dto = await middleware.invoke<Record<string, unknown>, ResearchVolunteerDTO>({
      path: `/api/research/${researchId}/volunteers/${volunteerId}`,
      method: 'PUT',
      payload: { ...payload },
    });
    return mapResearchVolunteer(dto);
  }

  // ── Group 4: Research Applications ───────────────────────

  async getApplications(researchId: string): Promise<Application[]> {
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<ApplicationDTO>>({
      path: `/api/research/${researchId}/applications`,
      method: 'GET',
      payload: {},
    });
    return (response.data ?? []).map(mapApplication);
  }

  async createApplication(researchId: string, data: NewApplicationData): Promise<Application> {
    const dto = await middleware.invoke<Record<string, unknown>, ApplicationDTO>({
      path: `/api/research/${researchId}/applications`,
      method: 'POST',
      payload: mapNewApplicationPayload(data),
    });
    return mapApplication(dto);
  }

  async updateApplication(
    researchId: string,
    applicationId: string,
    data: UpdateApplicationData
  ): Promise<Application> {
    const dto = await middleware.invoke<Record<string, unknown>, ApplicationDTO>({
      path: `/api/research/${researchId}/applications/${applicationId}`,
      method: 'PUT',
      payload: mapUpdateApplicationPayload(data),
    });
    return mapApplication(dto);
  }

  async deleteApplication(researchId: string, applicationId: string): Promise<void> {
    await middleware.invoke<Record<string, unknown>, unknown>({
      path: `/api/research/${researchId}/applications/${applicationId}`,
      method: 'DELETE',
      payload: {},
    });
  }

  // ── Group 5: Research Devices ────────────────────────────

  async getDevices(researchId: string): Promise<ResearchDevice[]> {
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearchDevice>>({
      path: `/api/research/${researchId}/devices`,
      method: 'GET',
      payload: {},
    });
    return response.data ?? [];
  }

  async assignDevice(researchId: string, payload: AssignDevicePayload): Promise<ResearchDevice> {
    return middleware.invoke<Record<string, unknown>, ResearchDevice>({
      path: `/api/research/${researchId}/devices`,
      method: 'POST',
      payload: { ...payload },
    });
  }

  async removeDevice(researchId: string, deviceId: string): Promise<void> {
    await middleware.invoke<Record<string, unknown>, unknown>({
      path: `/api/research/${researchId}/devices/${deviceId}`,
      method: 'DELETE',
      payload: {},
    });
  }

  async updateDevice(
    researchId: string,
    deviceId: string,
    payload: UpdateResearchDevicePayload
  ): Promise<ResearchDevice> {
    return middleware.invoke<Record<string, unknown>, ResearchDevice>({
      path: `/api/research/${researchId}/devices/${deviceId}`,
      method: 'PUT',
      payload: { ...payload },
    });
  }

  // ── Group 6: Device Sensors (Read-Only) ──────────────────

  async getAllResearchSensors(researchId: string): Promise<Sensor[]> {
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<SensorDTO>>({
      path: `/api/research/${researchId}/sensors`,
      method: 'GET',
      payload: {},
    });
    return (response.data ?? []).map(mapSensor);
  }

  async getDeviceSensors(researchId: string, deviceId: string): Promise<Sensor[]> {
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<SensorDTO>>({
      path: `/api/research/${researchId}/devices/${deviceId}/sensors`,
      method: 'GET',
      payload: {},
    });
    return (response.data ?? []).map(mapSensor);
  }
}

export const researchService = new ResearchService();
