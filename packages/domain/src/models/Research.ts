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
    PLANNING = 'planning',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    SUSPENDED = 'suspended',
    ARCHIVED = 'archived'
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
