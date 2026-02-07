/**
 * Sensor Domain Types
 *
 * Types for managing sensors attached to devices.
 */

/**
 * Sensor entity
 */
export interface Sensor {
    id: string;
    deviceId: string;
    name: string;
    maxSamplingRate: number;
    unit: string;
    accuracy: number;
    minRange: number;
    maxRange: number;
    additionalInfo: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Data required to create a new sensor
 */
export interface NewSensorData {
    deviceId: string;
    name: string;
    maxSamplingRate: string;
    unit: string;
    accuracy: string;
    minRange: string;
    maxRange: string;
    additionalInfo?: string;
}

/**
 * Data for updating an existing sensor (all fields optional)
 */
export interface UpdateSensorData {
    name?: string;
    maxSamplingRate?: number;
    unit?: string;
    accuracy?: number;
    minRange?: number;
    maxRange?: number;
    additionalInfo?: string;
}
