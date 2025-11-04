/**
 * Authentication and User Models
 *
 * Defines types for user authentication and authorization in IRIS applications.
 */

/**
 * User Role
 */
export enum UserRole {
    ADMIN = 'admin',
    RESEARCHER = 'researcher',
    CLINICIAN = 'clinician',
    VIEWER = 'viewer'
}

export enum ResearcherRole {
    CHIEF = 'chief_researcher',
    RESEARCHER = 'researcher',
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

export interface Researcher{
    researcherId: string;
    researchNodeId: string;
    name: string;
    email: string;
    institution: string;
    role: ResearcherRole;
    orcid: string;
    researches?: ResearcherResearch[];
}

export interface ResearcherResearch{
    researchId: string;
    researchTitle: string;
    isPrincipal: boolean;
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * Login Response
 */
export interface LoginResponse {
    user: User;
    token: string;
    expiresAt: Date;
}

/**
 * Registration Data
 */
export interface RegistrationData {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    institutionId?: string;
}

/**
 * Auth State
 */
export enum AuthState {
    AUTHENTICATED = 'authenticated',
    UNAUTHENTICATED = 'unauthenticated',
    LOADING = 'loading',
    ERROR = 'error'
}

/**
 * Auth Error
 */
export interface AuthError {
    code: AuthErrorCode;
    message: string;
    details?: any;
}

/**
 * Auth Error Codes
 */
export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'invalid_credentials',
    USER_NOT_FOUND = 'user_not_found',
    USER_ALREADY_EXISTS = 'user_already_exists',
    UNAUTHORIZED = 'unauthorized',
    TOKEN_EXPIRED = 'token_expired',
    NETWORK_ERROR = 'network_error',
    UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Password Reset Request
 */
export interface PasswordResetRequest {
    email: string;
}

/**
 * Password Reset Confirmation
 */
export interface PasswordResetConfirmation {
    token: string;
    newPassword: string;
}

/**
 * Session Info
 */
export interface SessionInfo {
    token: string;
    expiresAt: Date;
    issuedAt: Date;
    rememberMe: boolean;
}

/**
 * Pagination Request
 *
 * Matches backend RequestPaging structure
 */
export interface PaginationRequest {
    page: number;
    pageSize: number;
}

/**
 * Pagination Response
 *
 * Matches backend ResponsePaging structure
 */
export interface PaginationResponse {
    currentRecord: number;
    pageSize: number;
    totalRecords: number;
}

/**
 * Paginated Response
 *
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationResponse;
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
