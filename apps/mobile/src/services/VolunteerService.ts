/**
 * Volunteer Service
 *
 * Service for volunteer search and retrieval.
 * Communicates with InteroperableResearchNode VolunteerController through the
 * encrypted middleware channel. Provides DTO-to-domain mapping as an
 * anti-corruption layer between backend camelCase responses and frontend types.
 *
 * Implements US-IS-001 (DTOs + mappers), US-IS-002 (mock swap).
 */

import {
  type Volunteer,
  type VolunteerGender,
  type BloodType,
  type ConsentStatus,
  type PaginatedResponse,
} from '@iris/domain';
import { middleware } from './middleware';

// ── Backend DTO interface (internal — not exported) ─────────

interface VolunteerDTO {
  volunteerId: string;
  researchNodeId: string;
  volunteerCode: string;
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  height: number | null;
  weight: number | null;
  consentStatus: string;
  clinicalConditionCodes?: string[];
  clinicalEventCodes?: string[];
  medicationCodes?: string[];
  allergyIntoleranceCodes?: string[];
  enrolledAt: string;
  updatedAt: string;
}

// ── DTO → Domain mapper ─────────────────────────────────────

function convertToVolunteer(dto: VolunteerDTO): Volunteer {
  return {
    id: dto.volunteerId,
    researchNodeId: dto.researchNodeId,
    volunteerCode: dto.volunteerCode,
    name: dto.name,
    email: dto.email,
    birthDate: new Date(dto.birthDate),
    gender: dto.gender as VolunteerGender,
    bloodType: dto.bloodType ? (dto.bloodType as BloodType) : undefined,
    height: dto.height ?? undefined,
    weight: dto.weight ?? undefined,
    clinicalConditionCodes: dto.clinicalConditionCodes ?? [],
    clinicalEventCodes: dto.clinicalEventCodes ?? [],
    medicationCodes: dto.medicationCodes ?? [],
    allergyIntoleranceCodes: dto.allergyIntoleranceCodes ?? [],
    consentStatus: dto.consentStatus as ConsentStatus,
    enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : undefined,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
  };
}

// ── Service ──────────────────────────────────────────────────

interface SearchResult {
  items: Volunteer[];
  totalCount: number;
}

class VolunteerService {
  /**
   * Search volunteers by name or email.
   * Fetches paginated results from backend; client-side filtering is applied
   * because BaseController.HandleQueryParameters does NOT support `search`.
   */
  async search(query: string, page: number = 0, pageSize: number = 20): Promise<SearchResult> {
    const apiPage = page + 1;
    const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<VolunteerDTO>>({
      path: `/api/Volunteer/GetAllPaginated?page=${apiPage}&pageSize=${pageSize}`,
      method: 'GET',
      payload: {},
    });

    const allVolunteers = (response.data ?? []).map(convertToVolunteer);

    if (!query.trim()) {
      return {
        items: allVolunteers,
        totalCount: response.totalRecords ?? allVolunteers.length,
      };
    }

    // Client-side filter since backend has no search param
    const normalizedQuery = query.toLowerCase().trim();
    const filtered = allVolunteers.filter(
      (v) =>
        v.name.toLowerCase().includes(normalizedQuery) ||
        v.email.toLowerCase().includes(normalizedQuery)
    );

    return {
      items: filtered,
      totalCount: filtered.length,
    };
  }

  /**
   * Get volunteer by ID.
   */
  async getById(id: string): Promise<Volunteer | null> {
    const dto = await middleware.invoke<Record<string, unknown>, VolunteerDTO>({
      path: `/api/Volunteer/${id}`,
      method: 'GET',
      payload: {},
    });
    return convertToVolunteer(dto);
  }
}

export const volunteerService = new VolunteerService();
