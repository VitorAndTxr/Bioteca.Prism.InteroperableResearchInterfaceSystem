/**
 * Clinical Session Models
 *
 * Defines types for clinical research sessions including volunteer data,
 * clinical context (body structure, laterality, topography), and session metadata.
 */

import { SyncStatus } from './SyncStatus';

/**
 * Laterality Type
 */
export type Laterality = 'left' | 'right' | 'bilateral';

/**
 * Clinical Session
 *
 * Represents a research session with a volunteer, including timing,
 * researcher assignment, device usage, and synchronization status.
 */
export interface ClinicalSession {
    id: string;
    volunteerId: string;
    volunteerName?: string;
    researcherId: string;
    deviceId?: string;
    researchId?: string;
    researchTitle?: string;
    startedAt: string; // ISO 8601
    endedAt?: string; // ISO 8601
    durationSeconds: number;
    syncStatus: SyncStatus;
    createdAt: string; // ISO 8601
}

/**
 * Clinical Data
 *
 * Represents the clinical context for a session: target body structure
 * (SNOMED CT code), laterality, and associated topography codes.
 */
export interface ClinicalData {
    id: string;
    sessionId: string;
    bodyStructureSnomedCode: string;
    bodyStructureName: string;
    laterality: Laterality | null;
    topographyCodes: string[]; // JSON-serialized in SQLite
    topographyNames: string[];
}

/**
 * Session Config
 *
 * Configuration data used to create a new clinical session.
 * Includes volunteer information, researcher ID, device assignment,
 * and clinical context (body structure, laterality, topography).
 */
export interface SessionConfig {
    volunteerId: string;
    volunteerName: string;
    researcherId: string;
    deviceId?: string;
    researchId?: string;
    researchTitle?: string;
    clinicalData: {
        bodyStructureSnomedCode: string;
        bodyStructureName: string;
        laterality: Laterality | null;
        topographyCodes: string[];
        topographyNames: string[];
    };
}
