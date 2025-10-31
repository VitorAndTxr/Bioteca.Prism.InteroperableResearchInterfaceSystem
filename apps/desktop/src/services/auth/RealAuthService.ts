/**
 * Real Authentication Service using PRISM Backend
 *
 * This service uses the UserAuthService from middleware to authenticate
 * users against the InteroperableResearchNode backend.
 */

import {
    UserRole
} from '@iris/domain';
import type {
    User,
    LoginCredentials,
    LoginResponse,
    RegistrationData,
    PasswordResetRequest,
    PasswordResetConfirmation,
    SessionInfo
} from '@iris/domain';
import type { UserAuthService, LoginCredentials as MiddlewareCredentials } from '@iris/middleware';

/**
 * Adapter to convert domain User to middleware format and vice versa
 */
function convertMiddlewareUserToDomain(middlewareUser: { id: string; username: string; email: string; name?: string; roles?: string[] }): User {
    // Map middleware roles to domain UserRole
    const role = middlewareUser.roles && middlewareUser.roles.length > 0
        ? (middlewareUser.roles[0] as UserRole)
        : UserRole.VIEWER;

    return {
        id: middlewareUser.id,
        email: middlewareUser.email,
        name: middlewareUser.name || middlewareUser.username,
        role: role,
        institutionId: 'unknown', // TODO: Get from backend
        createdAt: new Date(), // TODO: Get from backend
        lastLogin: new Date()
    };
}

/**
 * Real Authentication Service
 */
export class RealAuthService {
    constructor(private readonly userAuthService: UserAuthService) {}

    /**
     * Login user with real backend
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        console.log('[RealAuthService] 🚀 Login request received from UI');
        console.log('[RealAuthService]    Email:', credentials.email);
        console.log('[RealAuthService]    Remember me:', credentials.rememberMe || false);

        // Convert domain credentials to middleware format
        const middlewareCredentials: MiddlewareCredentials = {
            username: credentials.email, // Backend uses username field
            password: credentials.password
        };

        console.log('[RealAuthService]    Calling userAuthService.login()...');

        // Login via middleware
        const authToken = await this.userAuthService.login(middlewareCredentials);

        console.log('[RealAuthService]    ✅ UserAuthService login successful');

        // Get current user
        const middlewareUser = await this.userAuthService.getCurrentUser();

        // Convert to domain User
        const user = convertMiddlewareUserToDomain(middlewareUser);

        console.log('[RealAuthService] ✅ Login complete - returning to AuthContext');
        console.log('[RealAuthService]    Domain user:', user.name, `(${user.email})`);
        console.log('[RealAuthService]    Role:', user.role);

        return {
            user,
            token: authToken.token,
            expiresAt: new Date(authToken.expiresAt)
        };
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        await this.userAuthService.logout();
    }

    /**
     * Get current user by token
     */
    async getCurrentUser(token: string): Promise<User> {
        // Check if authenticated
        if (!this.userAuthService.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        // Get user from middleware
        const middlewareUser = await this.userAuthService.getCurrentUser();

        return convertMiddlewareUserToDomain(middlewareUser);
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(oldToken: string): Promise<LoginResponse> {
        // Refresh token via middleware
        const authToken = await this.userAuthService.refreshToken();

        // Get current user
        const middlewareUser = await this.userAuthService.getCurrentUser();

        // Convert to domain User
        const user = convertMiddlewareUserToDomain(middlewareUser);

        return {
            user,
            token: authToken.token,
            expiresAt: new Date(authToken.expiresAt)
        };
    }

    /**
     * Validate session
     */
    async validateSession(sessionInfo: SessionInfo): Promise<boolean> {
        // Check if token is expired
        const now = new Date();
        if (now > sessionInfo.expiresAt) {
            return false;
        }

        // Check if user auth service considers us authenticated
        return this.userAuthService.isAuthenticated();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.userAuthService.isAuthenticated();
    }

    /**
     * Get token expiration date
     */
    getTokenExpiration(): Date | null {
        return this.userAuthService.getTokenExpiration();
    }

    /**
     * Register new user
     * NOTE: Not implemented - users are created via backend interface or direct DB
     */
    async register(data: RegistrationData): Promise<LoginResponse> {
        throw new Error('User registration is not available. Users must be created via backend interface.');
    }

    /**
     * Request password reset
     * NOTE: Not implemented - password management handled via backend interface
     */
    async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
        throw new Error('Password reset is not available. Contact your system administrator.');
    }

    /**
     * Confirm password reset
     * NOTE: Not implemented - password management handled via backend interface
     */
    async confirmPasswordReset(confirmation: PasswordResetConfirmation): Promise<void> {
        throw new Error('Password reset is not available. Contact your system administrator.');
    }

    /**
     * Update user profile
     * NOTE: Not implemented - profile updates handled via backend interface
     */
    async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
        throw new Error('Profile updates are not available. Contact your system administrator.');
    }

    /**
     * Check if user has permission based on role hierarchy
     */
    hasPermission(user: User, requiredRole: UserRole): boolean {
        const roleHierarchy: Record<UserRole, number> = {
            [UserRole.VIEWER]: 1,
            [UserRole.CLINICIAN]: 2,
            [UserRole.RESEARCHER]: 3,
            [UserRole.ADMIN]: 4
        };

        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    }

    /**
     * Get mock users (not available in real service)
     */
    getMockUsers(): User[] {
        throw new Error('Mock users are not available in real authentication service.');
    }
}
