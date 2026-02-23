/**
 * Research Domain Types
 *
 * Types for managing research projects in the PRISM system.
 */

/**
 * Research Status
 *
 * Represents the current status of a research project
 */
export enum ResearchStatus {
    PLANNING = 'Planning',
    ACTIVE = 'Active',
    COMPLETED = 'Completed',
    SUSPENDED = 'Suspended',
    CANCELLED = 'Cancelled',
}

/**
 * Node Access Level
 *
 * Defines the access level for research node connections
 * Must match backend NodeAccessTypeEnum values
 */
export enum NodeAccessLevel {
    READ_ONLY = 'ReadOnly',
    READ_WRITE = 'ReadWrite',
    ADMIN = 'Admin'
}

/**
 * Authorization Status
 *
 * Node authorization status in the federated network
 */
export enum AuthorizationStatus {
    UNKNOWN = 'unknown',
    PENDING = 'Pending',
    AUTHORIZED = 'Authorized',
    REVOKED = 'Revoked'
}

/**
 * Research Node Connection
 *
 * Information about a research node in the federated network
 */
export interface ResearchNodeConnection {
    id: string;
    nodeName: string;
    nodeUrl: string;
    status: AuthorizationStatus;
    nodeAccessLevel: NodeAccessLevel;
    contactInfo?: string;
    certificate?: string;
    certificateFingerprint?: string;
    institutionDetails?: string;
    registeredAt: Date;
    updatedAt: Date;
    lastSyncedAt?: string;
    lastSyncStatus?: string;
}

/**
 * Research
 *
 * Represents a research project in the system
 */
export interface Research {
    id: string;
    title: string;
    description: string;
    endDate?: Date | null;
    status: ResearchStatus;
    researchNode?: ResearchNodeConnection;
}

/**
 * New Research Data
 *
 * Data required to create a new research project
 */
export interface NewResearchData {
    title: string;
    description: string;
    researchNodeId: string;
    startDate: string;
}

/**
 * New Node Connection Data
 *
 * Data required to create a new research node connection
 */
export interface NewNodeConnectionData {
    nodeName: string;
    nodeUrl: string;
    nodeAccessLevel: NodeAccessLevel;
}

/**
 * Update Node Connection Payload
 *
 * Data required to update an existing research node connection
 */
export interface UpdateNodeConnectionPayload {
    nodeName: string;
    nodeUrl: string;
    nodeAccessLevel: string;
    status: string;
    contactInfo?: string;
    certificate?: string;
    certificateFingerprint?: string;
    institutionDetails?: string;
}

// ── Research Sub-Entity Enums ────────────────────────────────

/**
 * Enrollment Status
 * Matches backend ResearchVolunteer.EnrollmentStatus column values
 */
export enum EnrollmentStatus {
    ENROLLED = 'Enrolled',
    ACTIVE = 'Active',
    WITHDRAWN = 'Withdrawn',
    EXCLUDED = 'Excluded',
    COMPLETED = 'Completed',
}

/**
 * Calibration Status
 * Matches backend ResearchDevice.CalibrationStatus column values
 */
export enum CalibrationStatus {
    NOT_CALIBRATED = 'NotCalibrated',
    IN_PROGRESS = 'InProgress',
    CALIBRATED = 'Calibrated',
    EXPIRED = 'Expired',
}

// ── Junction Types ───────────────────────────────────────────

/**
 * ResearchResearcher — Junction entity
 * Table: research_researcher (ResearchId, ResearcherId)
 */
export interface ResearchResearcher {
    researchId: string;
    researcherId: string;
    isPrincipal: boolean;
    assignedAt: string;
    removedAt?: string | null;
    researcher?: import('./Researcher').Researcher;
}

/**
 * ResearchVolunteer — Junction entity
 * Table: research_volunteer (ResearchId, VolunteerId)
 */
export interface ResearchVolunteer {
    researchId: string;
    volunteerId: string;
    enrollmentStatus: EnrollmentStatus;
    consentDate?: string | null;
    consentVersion?: string | null;
    exclusionReason?: string | null;
    volunteer?: import('./Volunteer').Volunteer;
}

/**
 * ResearchDevice — Junction entity
 * Table: research_device (ResearchId, DeviceId)
 */
export interface ResearchDevice {
    researchId: string;
    deviceId: string;
    role: string;
    calibrationStatus: CalibrationStatus;
    lastCalibrationDate?: string | null;
    addedAt: string;
    removedAt?: string | null;
    deviceName?: string;
    manufacturer?: string;
    model?: string;
    sensorCount?: number;
}

// ── Aggregated Detail Type ───────────────────────────────────

/**
 * ResearchDetail — Extended research view returned by GET /api/research/{id}
 * Includes sub-entity counts for the detail screen header
 */
export interface ResearchDetail extends Research {
    startDate?: string | null;
    researcherCount: number;
    volunteerCount: number;
    applicationCount: number;
    deviceCount: number;
}

// ── DTO / Payload Types ──────────────────────────────────────

export interface UpdateResearchData {
    title?: string;
    description?: string;
    status?: ResearchStatus;
    endDate?: string | null;
}

export interface AssignResearcherPayload {
    researcherId: string;
    isPrincipal: boolean;
}

export interface UpdateResearchResearcherPayload {
    isPrincipal: boolean;
}

export interface EnrollVolunteerPayload {
    volunteerId: string;
    consentDate: string;
    consentVersion: string;
}

export interface UpdateResearchVolunteerPayload {
    enrollmentStatus?: EnrollmentStatus;
    consentDate?: string;
    consentVersion?: string;
    exclusionReason?: string;
}

export interface UpdateApplicationData {
    name?: string;
    url?: string;
    description?: string;
    additionalInfo?: string;
}

export interface AssignDevicePayload {
    deviceId: string;
    role: string;
    calibrationStatus: CalibrationStatus;
    lastCalibrationDate?: string;
}

export interface UpdateResearchDevicePayload {
    role?: string;
    calibrationStatus?: CalibrationStatus;
    lastCalibrationDate?: string;
}
