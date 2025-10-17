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

/**
 * User
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    institutionId?: string;
    createdAt: Date;
    lastLogin?: Date;
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
