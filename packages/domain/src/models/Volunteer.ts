/**
 * Volunteer Domain Model
 *
 * Represents a volunteer (patient) participating in research studies.
 * Part of the PRISM federated research framework.
 */

/**
 * Volunteer status enumeration
 */
export enum VolunteerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    COMPLETED = 'completed'
}

/**
 * Volunteer gender enumeration
 */
export enum VolunteerGender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    NOT_INFORMED = 'not_informed'
}

/**
 * Volunteer entity
 */
export interface Volunteer {
    id: string;
    name: string;
    email: string;
    birthDate: Date;
    gender: VolunteerGender;
    phone?: string;
    status: VolunteerStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Data required to create a new volunteer
 */
export interface NewVolunteerData {
    name: string;
    email: string;
    birthDate: string; // ISO 8601 format
    gender: VolunteerGender;
    phone?: string;
}
