/**
 * SNOMED Service
 *
 * Service for SNOMED CT body structures and topographical modifiers.
 * Communicates with InteroperableResearchNode SNOMEDController through the
 * encrypted middleware channel. Provides DTO-to-domain mapping as an
 * anti-corruption layer between backend camelCase responses and frontend types.
 *
 * Uses GetActive* endpoints (non-paginated) for the mobile cache strategy.
 * The dataset is expected to be small (< 200 records), so full fetch + cache
 * is more efficient than pagination.
 *
 * Implements US-IS-003 (DTOs + mappers), US-IS-004 (mock swap).
 */

import { type SnomedBodyStructure, type SnomedTopographicalModifier } from '@iris/domain';
import { middleware } from './middleware';

// ── Backend DTO interfaces (internal — not exported) ─────────

interface BodyStructureDTO {
  snomedCode: string;
  displayName: string;
  description: string;
  structureType: string;
  bodyRegionCode: string;
  parentStructureCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TopographicalModifierDTO {
  code: string;
  displayName: string;
  category: string;
  description: string;
  isActive: boolean;
}

// ── DTO → Domain mappers ────────────────────────────────────

function convertToBodyStructure(dto: BodyStructureDTO): SnomedBodyStructure {
  return {
    snomedCode: dto.snomedCode,
    displayName: dto.displayName,
    description: dto.description,
    type: dto.structureType,
  };
}

function convertToTopographicalModifier(dto: TopographicalModifierDTO): SnomedTopographicalModifier {
  return {
    snomedCode: dto.code,
    displayName: dto.displayName,
    category: dto.category,
    description: dto.description,
  };
}

// ── Service ──────────────────────────────────────────────────

class SnomedService {
  private bodyStructureCache: SnomedBodyStructure[] | null = null;
  private topographyCache: SnomedTopographicalModifier[] | null = null;

  /**
   * Get all active body structures.
   * Returns cached data or fetches from backend via GetActiveBodyStructures.
   * Graceful degradation: returns stale cache on network error if available.
   */
  async getBodyStructures(): Promise<SnomedBodyStructure[]> {
    if (this.bodyStructureCache) {
      return this.bodyStructureCache;
    }

    try {
      const dtos = await middleware.invoke<Record<string, unknown>, BodyStructureDTO[]>({
        path: '/api/snomed/BodyStructure/GetActiveBodyStructures',
        method: 'GET',
        payload: {},
      });

      this.bodyStructureCache = dtos.map(convertToBodyStructure);
      return this.bodyStructureCache;
    } catch (error) {
      // No cached fallback — propagate to caller
      throw error;
    }
  }

  /**
   * Refresh body structures from backend.
   * If refresh fails and cache exists, returns stale cache silently.
   * If cache is empty, propagates error.
   */
  async refreshBodyStructures(): Promise<SnomedBodyStructure[]> {
    try {
      const dtos = await middleware.invoke<Record<string, unknown>, BodyStructureDTO[]>({
        path: '/api/snomed/BodyStructure/GetActiveBodyStructures',
        method: 'GET',
        payload: {},
      });

      this.bodyStructureCache = dtos.map(convertToBodyStructure);
      return this.bodyStructureCache;
    } catch (error) {
      if (this.bodyStructureCache) {
        console.warn('[SnomedService] Body structure refresh failed, returning cached data:', error);
        return this.bodyStructureCache;
      }
      throw error;
    }
  }

  /**
   * Get all active topographical modifiers.
   * Returns cached data or fetches from backend via GetActiveTopographicalModifiers.
   * Graceful degradation: returns stale cache on network error if available.
   */
  async getTopographicalModifiers(): Promise<SnomedTopographicalModifier[]> {
    if (this.topographyCache) {
      return this.topographyCache;
    }

    try {
      const dtos = await middleware.invoke<Record<string, unknown>, TopographicalModifierDTO[]>({
        path: '/api/snomed/TopographicalModifier/GetActiveTopographicalModifiers',
        method: 'GET',
        payload: {},
      });

      this.topographyCache = dtos.map(convertToTopographicalModifier);
      return this.topographyCache;
    } catch (error) {
      // No cached fallback — propagate to caller
      throw error;
    }
  }

  /**
   * Refresh topographical modifiers from backend.
   * If refresh fails and cache exists, returns stale cache silently.
   * If cache is empty, propagates error.
   */
  async refreshTopographicalModifiers(): Promise<SnomedTopographicalModifier[]> {
    try {
      const dtos = await middleware.invoke<Record<string, unknown>, TopographicalModifierDTO[]>({
        path: '/api/snomed/TopographicalModifier/GetActiveTopographicalModifiers',
        method: 'GET',
        payload: {},
      });

      this.topographyCache = dtos.map(convertToTopographicalModifier);
      return this.topographyCache;
    } catch (error) {
      if (this.topographyCache) {
        console.warn('[SnomedService] Topographical modifier refresh failed, returning cached data:', error);
        return this.topographyCache;
      }
      throw error;
    }
  }

  /**
   * Clear cache (for testing or manual refresh).
   */
  clearCache(): void {
    this.bodyStructureCache = null;
    this.topographyCache = null;
  }
}

export const snomedService = new SnomedService();
