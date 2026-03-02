/**
 * Volunteer Domain Model
 *
 * Represents a volunteer (patient) participating in research studies.
 * Part of the PRISM federated research framework.
 *
 * Aligned with backend entity: InteroperableResearchNode Volunteer
 */

/**
 * Volunteer consent status
 */
export enum ConsentStatus {
    PENDING = 'Pending',
    GRANTED = 'Granted',
    REVOKED = 'Revoked'
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
 * Blood type enumeration
 */
export enum BloodType {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
    UNKNOWN = 'Unknown'
}

/**
 * Volunteer entity
 *
 * Matches backend fields: VolunteerId, ResearchNodeId, VolunteerCode,
 * Name, Email, BirthDate, Gender, BloodType, Height, Weight,
 * ConsentStatus, EnrolledAt, UpdatedAt, ClinicalConditionCodes,
 * ClinicalEventCodes, MedicationCodes, AllergyIntoleranceCodes
 */
export interface Volunteer {
    id: string;
    researchNodeId: string;
    volunteerCode: string;
    name: string;
    email: string;
    birthDate: Date;
    gender: VolunteerGender;
    bloodType?: BloodType;
    height?: number;
    weight?: number;
    consentStatus: ConsentStatus;
    enrolledAt?: Date;
    updatedAt?: Date;
    clinicalConditionCodes?: string[];
    clinicalEventCodes?: string[];
    medicationCodes?: string[];
    allergyIntoleranceCodes?: string[];
}

/**
 * Data required to create a new volunteer
 */
export interface NewVolunteerData {
    name: string;
    email: string;
    birthDate: string;
    gender: VolunteerGender;
    volunteerCode?: string;
    bloodType?: BloodType;
    height?: number;
    weight?: number;
    consentStatus?: ConsentStatus;
    clinicalConditionCodes?: string[];
    clinicalEventCodes?: string[];
    medicationCodes?: string[];
    allergyIntoleranceCodes?: string[];
}

/**
 * Data required to update an existing volunteer
 */
export interface UpdateVolunteerData {
    name?: string;
    email?: string;
    birthDate?: string;
    gender?: VolunteerGender;
    bloodType?: BloodType;
    height?: number;
    weight?: number;
    consentStatus?: ConsentStatus;
    clinicalConditionCodes?: string[];
    clinicalEventCodes?: string[];
    medicationCodes?: string[];
    allergyIntoleranceCodes?: string[];
}
