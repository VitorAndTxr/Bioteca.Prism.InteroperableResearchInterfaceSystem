/**
 * Authentication Service
 *
 * Provides authentication and authorization functionality for IRIS Desktop.
 * Currently uses mock data for development.
 */

import type {
    User,
    UserRole,
    LoginCredentials,
    LoginResponse,
    RegistrationData,
    PasswordResetRequest,
    PasswordResetConfirmation,
    SessionInfo,
    AuthError,
    AuthErrorCode
} from '@iris/domain';

/**
 * Mock Users Database
 */
const MOCK_USERS: User[] = [
    {
        id: '1',
        email: 'admin@iris.dev',
        name: 'Admin User',
        role: 'admin' as UserRole,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        institutionId: 'inst-001',
        createdAt: new Date('2025-01-01'),
        lastLogin: new Date()
    },
    {
        id: '2',
        email: 'researcher@iris.dev',
        name: 'Jane Researcher',
        role: 'researcher' as UserRole,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        institutionId: 'inst-001',
        createdAt: new Date('2025-01-05'),
        lastLogin: new Date()
    },
    {
        id: '3',
        email: 'clinician@iris.dev',
        name: 'Dr. John Smith',
        role: 'clinician' as UserRole,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        institutionId: 'inst-002',
        createdAt: new Date('2025-01-10'),
        lastLogin: new Date()
    },
    {
        id: '4',
        email: 'viewer@iris.dev',
        name: 'Sarah Viewer',
        role: 'viewer' as UserRole,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        institutionId: 'inst-001',
        createdAt: new Date('2025-01-15'),
        lastLogin: new Date()
    }
];

/**
 * Default password for all mock users (for development only)
 */
const MOCK_PASSWORD = 'password123';

/**
 * Authentication Service Class
 */
export class AuthService {
    private static instance: AuthService;

    private constructor() {}

    /**
     * Get singleton instance
     */
    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        // Simulate network delay
        await this.delay(800);

        // Find user by email
        const user = MOCK_USERS.find(u => u.email === credentials.email);

        if (!user) {
            throw this.createAuthError(
                'user_not_found' as AuthErrorCode,
                'User not found with the provided email address'
            );
        }

        // Validate password (mock validation)
        if (credentials.password !== MOCK_PASSWORD) {
            throw this.createAuthError(
                'invalid_credentials' as AuthErrorCode,
                'Invalid email or password'
            );
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate mock token
        const token = this.generateToken(user);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + (credentials.rememberMe ? 720 : 24)); // 30 days or 24 hours

        return {
            user,
            token,
            expiresAt
        };
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        // Simulate network delay
        await this.delay(300);
        // In a real implementation, this would invalidate the token on the server
    }

    /**
     * Register new user
     */
    async register(data: RegistrationData): Promise<LoginResponse> {
        // Simulate network delay
        await this.delay(1000);

        // Check if user already exists
        const existingUser = MOCK_USERS.find(u => u.email === data.email);
        if (existingUser) {
            throw this.createAuthError(
                'user_already_exists' as AuthErrorCode,
                'A user with this email already exists'
            );
        }

        // Create new user
        const newUser: User = {
            id: `user-${Date.now()}`,
            email: data.email,
            name: data.name,
            role: data.role,
            institutionId: data.institutionId,
            createdAt: new Date(),
            lastLogin: new Date()
        };

        // Add to mock database
        MOCK_USERS.push(newUser);

        // Generate token
        const token = this.generateToken(newUser);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        return {
            user: newUser,
            token,
            expiresAt
        };
    }

    /**
     * Get current user by token
     */
    async getCurrentUser(token: string): Promise<User> {
        // Simulate network delay
        await this.delay(400);

        try {
            // Parse token (mock implementation)
            const userId = this.parseToken(token);
            const user = MOCK_USERS.find(u => u.id === userId);

            if (!user) {
                throw this.createAuthError(
                    'user_not_found' as AuthErrorCode,
                    'User not found'
                );
            }

            return user;
        } catch (error) {
            throw this.createAuthError(
                'token_expired' as AuthErrorCode,
                'Session expired. Please login again.'
            );
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(oldToken: string): Promise<LoginResponse> {
        // Simulate network delay
        await this.delay(500);

        const user = await this.getCurrentUser(oldToken);
        const token = this.generateToken(user);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        return {
            user,
            token,
            expiresAt
        };
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
        // Simulate network delay
        await this.delay(800);

        const user = MOCK_USERS.find(u => u.email === request.email);
        if (!user) {
            // Don't reveal if user exists or not (security best practice)
            // Just return success
        }

        // In a real implementation, this would send an email
        console.log(`[Mock] Password reset email sent to ${request.email}`);
    }

    /**
     * Confirm password reset
     */
    async confirmPasswordReset(confirmation: PasswordResetConfirmation): Promise<void> {
        // Simulate network delay
        await this.delay(800);

        // In a real implementation, this would validate the token and update the password
        console.log('[Mock] Password reset confirmed');
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
        // Simulate network delay
        await this.delay(600);

        const user = MOCK_USERS.find(u => u.id === userId);
        if (!user) {
            throw this.createAuthError(
                'user_not_found' as AuthErrorCode,
                'User not found'
            );
        }

        // Update user (only allowed fields)
        if (updates.name) user.name = updates.name;
        if (updates.avatar) user.avatar = updates.avatar;

        return user;
    }

    /**
     * Check if user has permission
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
     * Validate session
     */
    async validateSession(sessionInfo: SessionInfo): Promise<boolean> {
        // Simulate network delay
        await this.delay(300);

        // Check if token is expired
        const now = new Date();
        if (now > sessionInfo.expiresAt) {
            return false;
        }

        try {
            await this.getCurrentUser(sessionInfo.token);
            return true;
        } catch {
            return false;
        }
    }

    // ==================== Private Helpers ====================

    /**
     * Generate mock JWT token
     */
    private generateToken(user: User): string {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Date.now()
        }));
        const signature = btoa(`mock-signature-${user.id}`);

        return `${header}.${payload}.${signature}`;
    }

    /**
     * Parse mock JWT token
     */
    private parseToken(token: string): string {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const payload = JSON.parse(atob(parts[1]));
            return payload.userId;
        } catch {
            throw new Error('Invalid token');
        }
    }

    /**
     * Create auth error
     */
    private createAuthError(code: AuthErrorCode, message: string): AuthError {
        return {
            code,
            message,
            details: null
        };
    }

    /**
     * Simulate network delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get all mock users (for testing only)
     */
    getMockUsers(): User[] {
        return [...MOCK_USERS];
    }
}

// Export singleton instance
export const authService = AuthService.getInstance();
