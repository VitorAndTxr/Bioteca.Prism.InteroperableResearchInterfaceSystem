/**
 * User Service
 *
 * Handles user management operations with the InteroperableResearchNode backend.
 * Implements pagination support for user listing and user creation functionality.
 *
 * Endpoints:
 * - GET /api/user/GetUsers - Get paginated list of users
 * - POST /api/user/New - Create new user
 */

import { BaseService, type MiddlewareServices } from '../BaseService';
import type {
    User,
    NewUserData,
    PaginatedResponse,
    AuthError,
    AuthErrorCode
} from '@iris/domain';

/**
 * Middleware User DTO (camelCase - matches backend JSON serialization)
 * Backend returns User entity with these fields
 */
interface UserDTO {
    id: string;
    login: string;
    passwordHash?: string; // Not used, but returned by backend
    role: string;
    createdAt: string;
    updatedAt: string;
    researcher?: ResearcherInfo;
}

/**
 * Middleware Researcher Info (camelCase - matches backend JSON serialization)
 */
interface ResearcherInfo {
    name: string;
    email: string;
    role: string;
    orcid: string;
}

/**
 * Middleware Add User Payload (PascalCase - matches backend)
 */
interface AddUserPayload extends Record<string, unknown> {
    Login: string;
    Password: string;
    Role: string;
    ResearcherId?: string;
}

/**
 * User Service Implementation
 */
export class UserService extends BaseService {
    private readonly USE_MOCK = true;

    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'UserService',
            debug: true // Enable for development
        });
    }

    /**
     * Initialize service
     */
    async initialize(): Promise<void> {
        this.log('Service initialized');
    }

    /**
     * Dispose service
     */
    async dispose(): Promise<void> {
        this.log('Service disposed');
    }

    /**
     * Get paginated list of users
     *
     * @param page - Page number (1-indexed, default: 1)
     * @param pageSize - Items per page (default: 10, max: 100)
     * @returns Paginated user list with metadata
     */
    async getUsers(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<User>> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const mockUsers: User[] = Array(pageSize).fill(null).map((_, i) => ({
                        id: `mock-user-${page}-${i}`,
                        login: `mockuser${page}${i}`,
                        role: 'researcher' as any,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }));
                    resolve({
                        data: mockUsers,
                        currentPage: page,
                        pageSize: pageSize,
                        totalRecords: 100
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log(`Fetching users (page: ${page}, pageSize: ${pageSize})`);

            // Ensure we have an authenticated session
            await this.ensureSession();

            // Prepare pagination query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            // Call backend API with pagination
            // Backend uses [PrismEncryptedChannelConnection] without type parameter
            // This handles GET requests without requiring a body
            const response = await this.middleware.invoke<Record<string, unknown>, PaginatedResponse<UserDTO>>({
                path: `/api/user/GetUsers?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            // Debug: Log full decrypted response
            console.log('[UserService] 🔍 Full decrypted response:', JSON.stringify(response, null, 2));

            this.log(`Retrieved ${response.data?.length || 0} users`);

            // Convert middleware response to domain types
            const users = (response.data || []).map(this.convertToUser.bind(this));

            return {
                data: users,
                currentPage: response.currentPage || 0,
                pageSize: response.pageSize || users.length,
                totalRecords: response.totalRecords || users.length
            };
        });
    }

    /**
     * Create new user
     *
     * @param userData - User data (login, password, role, researcherId)
     * @returns Created user
     */
    async createUser(userData: NewUserData): Promise<User> {
        if (this.USE_MOCK) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        id: `mock-user-new-${Date.now()}`,
                        login: userData.login,
                        role: userData.role as any,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }, 500);
            });
        }

        return this.handleMiddlewareError(async () => {
            this.log('Creating new user:', userData.login);

            // Validate input
            this.validateUserData(userData);

            // Ensure session
            await this.ensureSession();

            // Convert to middleware format (PascalCase)
            const middlewarePayload: AddUserPayload = {
                Login: userData.login,
                Password: userData.password,
                Role: userData.role,
                ResearcherId: userData.researcherId
            };

            // Call backend API
            // Backend returns User entity directly (not wrapped in { User: ... })
            const response = await this.middleware.invoke<AddUserPayload, UserDTO>({
                path: '/api/user/New',
                method: 'POST',
                payload: middlewarePayload
            });

            this.log('✅ User created:', response.id);

            return this.convertToUser(response);
        });
    }

    // ==================== Private Helpers ====================

    /**
     * Convert middleware UserDTO to domain User type
     */
    private convertToUser(dto: UserDTO): User {
        const user: User = {
            id: dto.id,
            login: dto.login,
            role: this.mapRole(dto.role),
            createdAt: new Date(dto.createdAt),
            updatedAt: new Date(dto.updatedAt)
        };

        if (dto.researcher) {
            user.researcher = {
                researcherId: '', // Not provided in MiddlewareResearcherInfo
                researchNodeId: '', // Not provided in MiddlewareResearcherInfo
                name: dto.researcher.name,
                email: dto.researcher.email,
                institution: '', // Not provided in MiddlewareResearcherInfo
                role: dto.researcher.role as any,
                orcid: dto.researcher.orcid
            };
        }

        return user;
    }

    /**
     * Map backend role string to domain UserRole enum
     */
    private mapRole(role: string): any {
        const roleMap: Record<string, string> = {
            'admin': 'admin',
            'researcher': 'researcher',
            'clinician': 'clinician',
            'viewer': 'viewer',
            'ADMIN': 'admin',
            'RESEARCHER': 'researcher',
            'CLINICIAN': 'clinician',
            'VIEWER': 'viewer'
        };

        return (roleMap[role] || role.toLowerCase()) as any;
    }

    /**
     * Validate user creation data
     */
    private validateUserData(data: NewUserData): void {
        if (!data.login || data.login.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'User login is required',
                { field: 'login' }
            );
        }

        if (data.login.length > 100) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'User login must be less than 100 characters',
                { field: 'login', maxLength: 100 }
            );
        }

        if (!data.password || data.password.length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Password is required',
                { field: 'password' }
            );
        }

        if (data.password.length < 8) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Password must be at least 8 characters',
                { field: 'password', minLength: 8 }
            );
        }

        if (!data.role) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'User role is required',
                { field: 'role' }
            );
        }
    }

    /**
     * Override error conversion for service-specific errors
     */
    protected convertToAuthError(error: unknown): AuthError {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            // Map specific backend errors
            if (message.includes('user not found')) {
                return this.createAuthError(
                    'user_not_found' as AuthErrorCode,
                    'User not found'
                );
            }

            if (message.includes('user already exists')) {
                return this.createAuthError(
                    'user_already_exists' as AuthErrorCode,
                    'A user with this login already exists'
                );
            }

            if (message.includes('invalid payload')) {
                return this.createAuthError(
                    'invalid_request' as AuthErrorCode,
                    'Invalid user data provided'
                );
            }

            if (message.includes('researcher does not exist')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'The specified researcher does not exist'
                );
            }
        }

        // Fall back to base error conversion
        return super.convertToAuthError(error);
    }
}
