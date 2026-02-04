/**
 * SNOMED Service
 *
 * Mock service for SNOMED CT data (body structures and topographical modifiers).
 * Backend endpoints exist but may not be accessible during development.
 * Will be replaced with middleware.invoke() calls later.
 */

import { SnomedBodyStructure, SnomedTopographicalModifier } from '@iris/domain';

// Mock SNOMED Body Structures with real codes
const MOCK_BODY_STRUCTURES: SnomedBodyStructure[] = [
  {
    snomedCode: '53120007',
    displayName: 'Upper Limb',
    description: 'Structure of upper limb',
    type: 'Limb',
  },
  {
    snomedCode: '61685007',
    displayName: 'Lower Limb',
    description: 'Structure of lower limb',
    type: 'Limb',
  },
  {
    snomedCode: '22943007',
    displayName: 'Trunk',
    description: 'Structure of trunk',
    type: 'Body Region',
  },
  {
    snomedCode: '69536005',
    displayName: 'Head and Neck',
    description: 'Structure of head and neck',
    type: 'Body Region',
  },
  {
    snomedCode: '40983000',
    displayName: 'Shoulder',
    description: 'Structure of shoulder region',
    type: 'Joint Region',
  },
  {
    snomedCode: '127949000',
    displayName: 'Forearm',
    description: 'Structure of forearm',
    type: 'Limb Segment',
  },
  {
    snomedCode: '30021000',
    displayName: 'Thigh',
    description: 'Structure of thigh',
    type: 'Limb Segment',
  },
  {
    snomedCode: '30315005',
    displayName: 'Lower Leg',
    description: 'Structure of lower leg',
    type: 'Limb Segment',
  },
];

// Mock Topographical Modifiers with real codes
const MOCK_TOPOGRAPHICAL_MODIFIERS: SnomedTopographicalModifier[] = [
  {
    snomedCode: '49137007',
    displayName: 'Biceps Brachii',
    category: 'Upper Limb Muscle',
    description: 'Biceps brachii muscle',
  },
  {
    snomedCode: '60687008',
    displayName: 'Triceps Brachii',
    category: 'Upper Limb Muscle',
    description: 'Triceps brachii muscle',
  },
  {
    snomedCode: '38066006',
    displayName: 'Deltoid',
    category: 'Upper Limb Muscle',
    description: 'Deltoid muscle',
  },
  {
    snomedCode: '20924004',
    displayName: 'Brachioradialis',
    category: 'Upper Limb Muscle',
    description: 'Brachioradialis muscle',
  },
  {
    snomedCode: '52927003',
    displayName: 'Flexor Carpi Radialis',
    category: 'Upper Limb Muscle',
    description: 'Flexor carpi radialis muscle',
  },
  {
    snomedCode: '71616004',
    displayName: 'Quadriceps Femoris',
    category: 'Lower Limb Muscle',
    description: 'Quadriceps femoris muscle',
  },
  {
    snomedCode: '31064002',
    displayName: 'Hamstrings',
    category: 'Lower Limb Muscle',
    description: 'Hamstring muscles',
  },
  {
    snomedCode: '83607008',
    displayName: 'Gastrocnemius',
    category: 'Lower Limb Muscle',
    description: 'Gastrocnemius muscle',
  },
  {
    snomedCode: '20527005',
    displayName: 'Tibialis Anterior',
    category: 'Lower Limb Muscle',
    description: 'Tibialis anterior muscle',
  },
  {
    snomedCode: '79327005',
    displayName: 'Gluteus Maximus',
    category: 'Lower Limb Muscle',
    description: 'Gluteus maximus muscle',
  },
  {
    snomedCode: '8376008',
    displayName: 'Rectus Abdominis',
    category: 'Trunk Muscle',
    description: 'Rectus abdominis muscle',
  },
  {
    snomedCode: '22823000',
    displayName: 'Erector Spinae',
    category: 'Trunk Muscle',
    description: 'Erector spinae muscles',
  },
  {
    snomedCode: '79368004',
    displayName: 'Pectoralis Major',
    category: 'Trunk Muscle',
    description: 'Pectoralis major muscle',
  },
  {
    snomedCode: '77831004',
    displayName: 'Trapezius',
    category: 'Trunk Muscle',
    description: 'Trapezius muscle',
  },
];

class SnomedService {
  private bodyStructureCache: SnomedBodyStructure[] | null = null;
  private topographyCache: SnomedTopographicalModifier[] | null = null;

  /**
   * Get all body structures.
   * Returns cached data or fetches from backend.
   * Currently using mock data - will be replaced with middleware API call.
   */
  async getBodyStructures(): Promise<SnomedBodyStructure[]> {
    // Return cached data if available
    if (this.bodyStructureCache) {
      return this.bodyStructureCache;
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // TODO: Replace with actual API call
    // const result = await middleware.invoke('snomed', 'getBodyStructures', {});
    // this.bodyStructureCache = result.data;

    this.bodyStructureCache = MOCK_BODY_STRUCTURES;
    return this.bodyStructureCache;
  }

  /**
   * Get all topographical modifiers.
   * Returns cached data or fetches from backend.
   * Currently using mock data - will be replaced with middleware API call.
   */
  async getTopographicalModifiers(): Promise<SnomedTopographicalModifier[]> {
    // Return cached data if available
    if (this.topographyCache) {
      return this.topographyCache;
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // TODO: Replace with actual API call
    // const result = await middleware.invoke('snomed', 'getTopographicalModifiers', {});
    // this.topographyCache = result.data;

    this.topographyCache = MOCK_TOPOGRAPHICAL_MODIFIERS;
    return this.topographyCache;
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
