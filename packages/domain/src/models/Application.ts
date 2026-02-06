/**
 * Application Domain Types
 *
 * Types for managing applications linked to research projects.
 */

/**
 * Application entity
 */
export interface Application {
    id: string;
    researchId: string;
    name: string;
    url: string;
    description: string;
    additionalInfo: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Data required to create a new application
 */
export interface NewApplicationData {
    researchId: string;
    name: string;
    url: string;
    description: string;
    additionalInfo?: string;
}
