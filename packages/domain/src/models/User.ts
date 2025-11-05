import { Researcher } from "./Researcher";

/**
 * User Role
 */
export enum UserRole {
    ADMIN = 'admin',
    RESEARCHER = 'researcher',
    CLINICIAN = 'clinician',
    VIEWER = 'viewer'
}

/**
 * User
 */
export interface User {
    id: string;
    login: string;
    role: UserRole;
    researcher?: Researcher;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
}

/**
 * New User Data
 *
 * Data required to create a new user
 */
export interface NewUserData {
    login: string;
    password: string;
    role: string;
    researcherId?: string;
}
