/**
 * US-035: SessionConfig domain type and startSession() sensor fields
 *
 * Tests that the @iris/domain SessionConfig type includes optional sensorIds/sensorNames
 * fields. Uses TypeScript type-level assertions via runtime shape checks.
 *
 * AC Coverage:
 * AC1: SessionConfig.clinicalData includes optional sensorIds and sensorNames
 * AC3: researchId is sourced from env var (not a required parameter)
 * AC5: TypeScript compilation passes (static check via valid object construction)
 */

import { describe, it, expect } from 'vitest';
import type { SessionConfig, SessionFavorite, CreateFavoritePayload } from '@iris/domain';

describe('US-035 — SessionConfig domain type sensor fields', () => {
  describe('AC1: SessionConfig.clinicalData includes optional sensorIds and sensorNames', () => {
    it('constructs a valid SessionConfig with sensorIds and sensorNames', () => {
      const config: SessionConfig = {
        volunteerId: 'v-001',
        volunteerName: 'Alice',
        researcherId: 'r-001',
        deviceId: 'dev-001',
        researchId: '550e8400-e29b-41d4-a716-446655440000',
        clinicalData: {
          bodyStructureSnomedCode: '123456',
          bodyStructureName: 'Upper Limb',
          laterality: null,
          topographyCodes: ['T001'],
          topographyNames: ['Left Arm'],
          sensorIds: ['sensor-a', 'sensor-b'],
          sensorNames: ['EMG Left', 'EMG Right'],
        },
      };

      expect(config.clinicalData.sensorIds).toEqual(['sensor-a', 'sensor-b']);
      expect(config.clinicalData.sensorNames).toEqual(['EMG Left', 'EMG Right']);
    });

    it('constructs a valid SessionConfig without sensorIds (optional field)', () => {
      const config: SessionConfig = {
        volunteerId: 'v-001',
        volunteerName: 'Alice',
        researcherId: 'r-001',
        clinicalData: {
          bodyStructureSnomedCode: '123456',
          bodyStructureName: 'Upper Limb',
          laterality: null,
          topographyCodes: [],
          topographyNames: [],
          // sensorIds intentionally omitted — must be optional
        },
      };

      expect(config.clinicalData.sensorIds).toBeUndefined();
      expect(config.clinicalData.sensorNames).toBeUndefined();
    });

    it('constructs a SessionConfig with empty sensor arrays', () => {
      const config: SessionConfig = {
        volunteerId: 'v-001',
        volunteerName: 'Alice',
        researcherId: 'r-001',
        clinicalData: {
          bodyStructureSnomedCode: '123456',
          bodyStructureName: 'Upper Limb',
          laterality: null,
          topographyCodes: [],
          topographyNames: [],
          sensorIds: [],
          sensorNames: [],
        },
      };

      expect(config.clinicalData.sensorIds).toEqual([]);
      expect(config.clinicalData.sensorNames).toEqual([]);
    });
  });

  describe('AC3: researchId is optional in SessionConfig (not required from caller)', () => {
    it('constructs a SessionConfig without researchId (env var provides it internally)', () => {
      const config: SessionConfig = {
        volunteerId: 'v-001',
        volunteerName: 'Alice',
        researcherId: 'r-001',
        // researchId intentionally omitted
        clinicalData: {
          bodyStructureSnomedCode: '123456',
          bodyStructureName: 'Upper Limb',
          laterality: null,
          topographyCodes: [],
          topographyNames: [],
        },
      };

      expect(config.researchId).toBeUndefined();
    });
  });
});

describe('US-035 — SessionFavorite and CreateFavoritePayload include sensor fields', () => {
  it('SessionFavorite has sensorIds and sensorNames as required string arrays', () => {
    const fav: SessionFavorite = {
      id: 'fav-001',
      name: 'Test Favorite',
      bodyStructureSnomedCode: '123456',
      bodyStructureName: 'Upper Limb',
      topographyCodes: ['T001'],
      topographyNames: ['Left Arm'],
      topographyCategories: ['Limb'],
      sensorIds: ['sensor-a'],
      sensorNames: ['EMG Left'],
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    expect(fav.sensorIds).toEqual(['sensor-a']);
    expect(fav.sensorNames).toEqual(['EMG Left']);
  });

  it('SessionFavorite allows empty sensorIds and sensorNames arrays', () => {
    const fav: SessionFavorite = {
      id: 'fav-002',
      name: 'Empty Sensors Favorite',
      bodyStructureSnomedCode: '123456',
      bodyStructureName: 'Upper Limb',
      topographyCodes: [],
      topographyNames: [],
      topographyCategories: [],
      sensorIds: [],
      sensorNames: [],
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    };

    expect(fav.sensorIds).toEqual([]);
    expect(fav.sensorNames).toEqual([]);
  });

  it('CreateFavoritePayload includes optional sensorIds and sensorNames', () => {
    const payload: CreateFavoritePayload = {
      name: 'Test',
      bodyStructureSnomedCode: '123456',
      bodyStructureName: 'Upper Limb',
      topographyCodes: [],
      topographyNames: [],
      topographyCategories: [],
      laterality: null,
      sensorIds: ['s1'],
      sensorNames: ['Sensor 1'],
    };

    expect(payload.sensorIds).toEqual(['s1']);
    expect(payload.sensorNames).toEqual(['Sensor 1']);
  });
});
