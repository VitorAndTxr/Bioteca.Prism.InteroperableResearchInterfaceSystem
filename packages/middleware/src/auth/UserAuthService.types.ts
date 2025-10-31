export interface LoginCredentials {
    username: string;
    password: string;
    researchId?: string;
}

export interface AuthToken {
    token: string;
    expiresAt: string;
    refreshToken?: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    name?: string;
    roles?: string[];
}

export interface LoginRequest extends Record<string, unknown> {
    username: string;
    password: string;
    token: string;
    researchId?: string;
}

export interface LoginResponse {
    token: string;
    expiresAt: string;
    user: User;
}

export interface RefreshTokenRequest extends Record<string, unknown> {
    token: string;
}

export interface RefreshTokenResponse {
    token: string;
    expiresAt: string;
}

export interface UserAuthServiceOptions {
    /**
     * Time in milliseconds before token expiration to trigger auto-refresh.
     * Default: 5 minutes (300000ms)
     */
    refreshBeforeExpiration?: number;

    /**
     * Storage key prefix for auth tokens.
     * Default: 'userauth'
     */
    storagePrefix?: string;
}

export const DEFAULT_USER_AUTH_OPTIONS: Required<UserAuthServiceOptions> = {
    refreshBeforeExpiration: 5 * 60 * 1000, // 5 minutes
    storagePrefix: 'userauth'
};
