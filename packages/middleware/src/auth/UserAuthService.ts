import type { HttpClient } from '../http/HttpClient';
import type { SecureStorage } from '../storage/SecureStorage';
import type { ResearchNodeMiddleware } from '../service/ResearchNodeMiddleware';
import type {
    LoginCredentials,
    AuthToken,
    User,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    UserAuthServiceOptions
} from './UserAuthService.types';
import { DEFAULT_USER_AUTH_OPTIONS } from './UserAuthService.types';

interface StoredAuthState {
    token: string;
    expiresAt: string;
    user: User;
}

export class UserAuthService {
    private currentToken: string | null = null;
    private tokenExpiresAt: Date | null = null;
    private currentUser: User | null = null;
    private refreshTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly options: Required<UserAuthServiceOptions>;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly storage: SecureStorage,
        private readonly middleware: ResearchNodeMiddleware,
        options: UserAuthServiceOptions = {}
    ) {
        this.options = { ...DEFAULT_USER_AUTH_OPTIONS, ...options };
    }

    /**
     * Initialize the service by loading stored auth state
     */
    async initialize(): Promise<void> {
        const stored = await this.storage.getItem<StoredAuthState>(`${this.options.storagePrefix}:state`);

        if (stored) {
            const expiresAt = new Date(stored.expiresAt);

            // Check if token is still valid
            if (expiresAt.getTime() > Date.now()) {
                this.currentToken = stored.token;
                this.tokenExpiresAt = expiresAt;
                this.currentUser = stored.user;
                this.scheduleTokenRefresh();
            } else {
                // Token expired, clear storage
                await this.clearStoredAuth();
            }
        }
    }

    /**
     * Login with username and password
     */
    async login(credentials: LoginCredentials): Promise<AuthToken> {
        console.log('[UserAuthService] 🔄 PHASE 4: User authentication starting...');
        console.log('[UserAuthService]    Username:', credentials.username);
        console.log('[UserAuthService]    Research ID:', credentials.researchId || '(none)');

        // Ensure we have a valid session with the research node
        console.log('[UserAuthService]    Ensuring middleware session...');
        await this.middleware.ensureSession();
        console.log('[UserAuthService]    ✅ Middleware session ready');

        // Encode password in Base64 as expected by backend
        const encodedPassword = btoa(credentials.password);

        const loginRequest: LoginRequest = {
            username: credentials.username,
            password: encodedPassword,
            token: '', // Empty token for initial login
            researchId: credentials.researchId
        };

        console.log('[UserAuthService]    Sending login request to /api/userauth/login...');

        // Use middleware.invoke for encrypted communication
        const response = await this.middleware.invoke<LoginRequest, LoginResponse>({
            path: '/api/userauth/login',
            method: 'POST',
            payload: loginRequest
        });

        console.log('[UserAuthService] ✅ PHASE 4 COMPLETE: User authenticated');
        console.log('[UserAuthService]    User ID:', response.user.id);
        console.log('[UserAuthService]    Username:', response.user.username);
        console.log('[UserAuthService]    Email:', response.user.email);
        console.log('[UserAuthService]    Token expires at:', response.expiresAt);

        // Store token and user information
        await this.setAuthState(response.token, response.expiresAt, response.user);

        // Schedule automatic token refresh
        this.scheduleTokenRefresh();

        console.log('[UserAuthService] 🎉 COMPLETE AUTHENTICATION FLOW SUCCESSFUL');

        return {
            token: response.token,
            expiresAt: response.expiresAt
        };
    }

    /**
     * Refresh the current authentication token
     */
    async refreshToken(): Promise<AuthToken> {
        if (!this.currentToken) {
            throw new Error('No token available to refresh. Please login first.');
        }

        // Ensure we have a valid session
        await this.middleware.ensureSession();

        const refreshRequest: RefreshTokenRequest = {
            token: this.currentToken
        };

        const response = await this.middleware.invoke<RefreshTokenRequest, RefreshTokenResponse>({
            path: '/api/userauth/refreshtoken',
            method: 'POST',
            payload: refreshRequest
        });

        // Update stored token
        await this.setAuthState(response.token, response.expiresAt, this.currentUser!);

        // Reschedule token refresh
        this.scheduleTokenRefresh();

        return {
            token: response.token,
            expiresAt: response.expiresAt
        };
    }

    /**
     * Logout and revoke session
     */
    async logout(): Promise<void> {
        // Cancel any pending refresh
        this.cancelTokenRefresh();

        // Revoke the middleware session
        try {
            await this.middleware.revokeSession();
        } catch (error) {
            console.warn('[UserAuthService] Failed to revoke session:', error);
        }

        // Clear authentication state
        await this.clearAuthState();
    }

    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean {
        if (!this.currentToken || !this.tokenExpiresAt) {
            return false;
        }

        // Check if token is still valid (with 1 minute buffer)
        return this.tokenExpiresAt.getTime() > Date.now() + 60_000;
    }

    /**
     * Get the current authentication token
     */
    getToken(): string | null {
        if (!this.isAuthenticated()) {
            return null;
        }
        return this.currentToken;
    }

    /**
     * Get the current authenticated user
     */
    async getCurrentUser(): Promise<User> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated. Please login first.');
        }

        if (!this.currentUser) {
            throw new Error('User information not available.');
        }

        return this.currentUser;
    }

    /**
     * Get token expiration information
     */
    getTokenExpiration(): Date | null {
        return this.tokenExpiresAt;
    }

    /**
     * Get time remaining until token expiration (in milliseconds)
     */
    getTimeUntilExpiration(): number | null {
        if (!this.tokenExpiresAt) {
            return null;
        }
        return Math.max(0, this.tokenExpiresAt.getTime() - Date.now());
    }

    /**
     * Manually trigger token refresh if needed
     */
    async ensureValidToken(): Promise<void> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated. Please login first.');
        }

        const timeRemaining = this.getTimeUntilExpiration();
        if (timeRemaining && timeRemaining < this.options.refreshBeforeExpiration) {
            await this.refreshToken();
        }
    }

    /**
     * Store authentication state
     */
    private async setAuthState(token: string, expiresAt: string, user: User): Promise<void> {
        this.currentToken = token;
        this.tokenExpiresAt = new Date(expiresAt);
        this.currentUser = user;

        const state: StoredAuthState = {
            token,
            expiresAt,
            user
        };

        await this.storage.setItem(`${this.options.storagePrefix}:state`, state);
    }

    /**
     * Clear authentication state
     */
    private async clearAuthState(): Promise<void> {
        this.currentToken = null;
        this.tokenExpiresAt = null;
        this.currentUser = null;
        await this.clearStoredAuth();
    }

    /**
     * Clear stored authentication
     */
    private async clearStoredAuth(): Promise<void> {
        await this.storage.removeItem(`${this.options.storagePrefix}:state`);
    }

    /**
     * Schedule automatic token refresh
     */
    private scheduleTokenRefresh(): void {
        this.cancelTokenRefresh();

        if (!this.tokenExpiresAt) {
            return;
        }

        const timeUntilExpiration = this.tokenExpiresAt.getTime() - Date.now();
        const timeUntilRefresh = timeUntilExpiration - this.options.refreshBeforeExpiration;

        // Only schedule if there's time before expiration
        if (timeUntilRefresh > 0) {
            this.refreshTimer = setTimeout(async () => {
                try {
                    await this.refreshToken();
                    console.log('[UserAuthService] Token automatically refreshed');
                } catch (error) {
                    console.error('[UserAuthService] Failed to auto-refresh token:', error);
                    // Clear auth state on refresh failure
                    await this.clearAuthState();
                }
            }, timeUntilRefresh);
        }
    }

    /**
     * Cancel scheduled token refresh
     */
    private cancelTokenRefresh(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Cleanup resources
     */
    async dispose(): Promise<void> {
        this.cancelTokenRefresh();
        await this.clearAuthState();
    }
}
