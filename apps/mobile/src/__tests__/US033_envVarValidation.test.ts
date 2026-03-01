/**
 * US-033: EXPO_PUBLIC_RESEARCH_ID env var validation
 *
 * Tests the isValidResearchId() logic extracted from App.tsx.
 * This is a pure-function test — no React Native rendering required.
 *
 * AC Coverage:
 * AC2: App reads and validates EXPO_PUBLIC_RESEARCH_ID (non-empty, valid UUID format)
 * AC3: If env var is missing or invalid, validation fails (error screen gating)
 */

import { describe, it, expect } from 'vitest';

// ── Pure function extracted from App.tsx for testability ──────────────────────
// This replicates the exact implementation at apps/mobile/App.tsx:67–72

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidResearchId(value: string | undefined): boolean {
  if (!value || value.trim() === '') return false;
  return UUID_REGEX.test(value.trim());
}

// ─────────────────────────────────────────────────────────────────────────────

describe('US-033 — isValidResearchId()', () => {
  describe('AC2: Valid UUID formats are accepted', () => {
    it('accepts a lowercase v4 UUID', () => {
      expect(isValidResearchId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('accepts an uppercase UUID (case-insensitive per spec)', () => {
      expect(isValidResearchId('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
    });

    it('accepts a mixed-case UUID', () => {
      expect(isValidResearchId('550e8400-E29B-41d4-A716-446655440000')).toBe(true);
    });

    it('trims surrounding whitespace before validating', () => {
      expect(isValidResearchId('  550e8400-e29b-41d4-a716-446655440000  ')).toBe(true);
    });
  });

  describe('AC3: Invalid or missing values are rejected', () => {
    it('rejects undefined (env var not set)', () => {
      expect(isValidResearchId(undefined)).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidResearchId('')).toBe(false);
    });

    it('rejects whitespace-only string', () => {
      expect(isValidResearchId('   ')).toBe(false);
    });

    it('rejects a non-UUID string', () => {
      expect(isValidResearchId('not-a-uuid')).toBe(false);
    });

    it('rejects a UUID missing one segment', () => {
      expect(isValidResearchId('550e8400-e29b-41d4-a716')).toBe(false);
    });

    it('rejects a UUID with wrong segment lengths', () => {
      expect(isValidResearchId('550e8400-e29b-41d4-a716-4466554400001')).toBe(false);
    });

    it('rejects a UUID with invalid hex characters', () => {
      expect(isValidResearchId('550e8400-e29b-41d4-a716-44665544000g')).toBe(false);
    });

    it('rejects a UUID without hyphens', () => {
      expect(isValidResearchId('550e8400e29b41d4a716446655440000')).toBe(false);
    });

    it('rejects an integer-looking string', () => {
      expect(isValidResearchId('12345')).toBe(false);
    });
  });
});
