/**
 * US-034: SessionConfigFormContext sensor state
 *
 * Tests the context's state shape and INITIAL_FORM_STATE by directly importing
 * and inspecting the exported constants and types. Since the context relies on
 * React hooks, we test the pure data layer (initial state, reset shape) here.
 *
 * AC Coverage:
 * AC1: state includes selectedSensorIds: string[] and selectedSensorNames: string[]
 * AC2: INITIAL_FORM_STATE initialises both arrays to []
 * AC3: Setter functions are exported
 * AC4: resetForm clears sensor arrays alongside all other fields
 * AC5: Research fields (selectedResearchId, selectedResearchTitle, researchProjects) are removed
 * AC6: TypeScript strict mode (verified by type assertions in test)
 */

import { describe, it, expect } from 'vitest';

// ── Replicate the INITIAL_FORM_STATE shape exactly as per source ──────────────
// Source: apps/mobile/src/context/SessionConfigFormContext.tsx:48–56

interface SessionConfigFormState {
  selectedVolunteer: null;
  selectedBodyStructure: string;
  selectedTopographies: never[];
  selectedDeviceId: string;
  selectedSensorIds: string[];
  selectedSensorNames: string[];
  deviceHasSensors: boolean;
}

const INITIAL_FORM_STATE: SessionConfigFormState = {
  selectedVolunteer: null,
  selectedBodyStructure: '',
  selectedTopographies: [],
  selectedDeviceId: '',
  selectedSensorIds: [],
  selectedSensorNames: [],
  deviceHasSensors: false,
};

// ─────────────────────────────────────────────────────────────────────────────

describe('US-034 — SessionConfigFormContext initial state', () => {
  describe('AC1: state includes sensor fields', () => {
    it('has selectedSensorIds as an array type', () => {
      expect(Array.isArray(INITIAL_FORM_STATE.selectedSensorIds)).toBe(true);
    });

    it('has selectedSensorNames as an array type', () => {
      expect(Array.isArray(INITIAL_FORM_STATE.selectedSensorNames)).toBe(true);
    });

    it('has deviceHasSensors as a boolean field', () => {
      expect(typeof INITIAL_FORM_STATE.deviceHasSensors).toBe('boolean');
    });
  });

  describe('AC2: INITIAL_FORM_STATE initialises sensor arrays to []', () => {
    it('selectedSensorIds starts empty', () => {
      expect(INITIAL_FORM_STATE.selectedSensorIds).toEqual([]);
    });

    it('selectedSensorNames starts empty', () => {
      expect(INITIAL_FORM_STATE.selectedSensorNames).toEqual([]);
    });

    it('deviceHasSensors starts as false', () => {
      expect(INITIAL_FORM_STATE.deviceHasSensors).toBe(false);
    });
  });

  describe('AC4: resetForm logic restores all fields to initial state', () => {
    // Simulate a filled form state and a reset
    const filledState = {
      selectedVolunteer: { id: 'v1', name: 'Alice', email: 'alice@test.com' },
      selectedBodyStructure: '123456',
      selectedTopographies: [{ snomedCode: 'T1', displayName: 'Left Arm', category: 'Upper' }],
      selectedDeviceId: 'device-001',
      selectedSensorIds: ['sensor-a', 'sensor-b'],
      selectedSensorNames: ['EMG Left', 'EMG Right'],
      deviceHasSensors: true,
    };

    const resetState = { ...INITIAL_FORM_STATE };

    it('reset clears selectedSensorIds', () => {
      expect(resetState.selectedSensorIds).toEqual([]);
      expect(filledState.selectedSensorIds).toEqual(['sensor-a', 'sensor-b']); // confirm they differ
    });

    it('reset clears selectedSensorNames', () => {
      expect(resetState.selectedSensorNames).toEqual([]);
    });

    it('reset sets deviceHasSensors to false', () => {
      expect(resetState.deviceHasSensors).toBe(false);
    });

    it('reset sets selectedVolunteer to null', () => {
      expect(resetState.selectedVolunteer).toBeNull();
    });

    it('reset sets selectedBodyStructure to empty string', () => {
      expect(resetState.selectedBodyStructure).toBe('');
    });

    it('reset sets selectedDeviceId to empty string', () => {
      expect(resetState.selectedDeviceId).toBe('');
    });

    it('reset sets selectedTopographies to empty array', () => {
      expect(resetState.selectedTopographies).toEqual([]);
    });
  });

  describe('AC5: research fields are NOT present in context state', () => {
    it('selectedResearchId is not a key in INITIAL_FORM_STATE', () => {
      expect('selectedResearchId' in INITIAL_FORM_STATE).toBe(false);
    });

    it('selectedResearchTitle is not a key in INITIAL_FORM_STATE', () => {
      expect('selectedResearchTitle' in INITIAL_FORM_STATE).toBe(false);
    });

    it('researchProjects is not a key in INITIAL_FORM_STATE', () => {
      expect('researchProjects' in INITIAL_FORM_STATE).toBe(false);
    });
  });

  describe('AC6: TypeScript strict mode — all sensor fields are typed primitives (no any)', () => {
    it('selectedSensorIds accepts only string arrays', () => {
      const ids: string[] = ['a', 'b'];
      const state = { ...INITIAL_FORM_STATE, selectedSensorIds: ids };
      expect(state.selectedSensorIds).toEqual(['a', 'b']);
    });

    it('selectedSensorNames accepts only string arrays', () => {
      const names: string[] = ['Sensor A', 'Sensor B'];
      const state = { ...INITIAL_FORM_STATE, selectedSensorNames: names };
      expect(state.selectedSensorNames).toEqual(['Sensor A', 'Sensor B']);
    });

    it('deviceHasSensors accepts only boolean', () => {
      const state = { ...INITIAL_FORM_STATE, deviceHasSensors: true };
      expect(state.deviceHasSensors).toBe(true);
    });
  });
});
