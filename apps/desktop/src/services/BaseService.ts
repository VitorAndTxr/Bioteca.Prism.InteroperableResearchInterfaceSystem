/**
 * Base Service
 *
 * Provides common middleware wrapping and utilities for services that consume
 * the InteroperableResearchNode middleware.
 *
 * This abstraction allows services to:
 * - Access middleware components (HttpClient, CryptoDriver, Middleware, etc.)
 * - Handle initialization and cleanup lifecycle
 * - Implement common error handling patterns
 * - Convert between domain and middleware types
 *
 * Usage:
 * ```typescript
 * class MyService extends BaseService {
 *   async myOperation() {
 *     return this.handleMiddlewareError(async () => {
 *       await this.middleware.ensureSession();
 *       // ... service logic
 *     });
 *   }
 * }
 * ```
 */

import type {
    ResearchNodeMiddleware,
    ChannelManager,
    SessionManager,
    CryptoDriver,
    HttpClient,
    SecureStorage
} from '@iris/middleware';
import type { AuthError, AuthErrorCode } from '@iris/domain';

/**
 * Middleware Services Container
 *
 * Contains all middleware components that services may need to access.
 * Passed to BaseService constructor to provide dependency injection.
 */
export interface MiddlewareServices {
    /** Main middleware instance for 4-phase handshake */
    middleware: ResearchNodeMiddleware;

    /** HTTP client for encrypted communication */
    httpClient: HttpClient;

    /** Cryptographic operations driver */
    cryptoDriver: CryptoDriver;

    /** Channel manager for Phase 1 (encrypted channel) */
    channelManager: ChannelManager;

    /** Session manager for Phase 4 (session management) */
    sessionManager: SessionManager;

    /** Secure storage for persisting sensitive data */
    storage: SecureStorage;
}

/**
 * Base Service Options
 */
export interface BaseServiceOptions {
    /** Optional service name for logging */
    serviceName?: string;

    /** Enable debug logging */
    debug?: boolean;
}

/**
 * Base Service Abstract Class
 *
 * Extend this class to create new services that consume the middleware.
 */
export abstract class BaseService {
    /** Middleware instance */
    protected readonly middleware: ResearchNodeMiddleware;

    /** HTTP client */
    protected readonly httpClient: HttpClient;

    /** Crypto driver */
    protected readonly cryptoDriver: CryptoDriver;

    /** Channel manager */
    protected readonly channelManager: ChannelManager;

    /** Session manager */
    protected readonly sessionManager: SessionManager;

    /** Secure storage */
    protected readonly storage: SecureStorage;

    /** Service name for logging */
    protected readonly serviceName: string;

    /** Debug mode */
    protected readonly debug: boolean;

    /**
     * Constructor
     *
     * @param services - Middleware services container
     * @param options - Service configuration options
     */
    constructor(
        services: MiddlewareServices,
        options: BaseServiceOptions = {}
    ) {
        this.middleware = services.middleware;
        this.httpClient = services.httpClient;
        this.cryptoDriver = services.cryptoDriver;
        this.channelManager = services.channelManager;
        this.sessionManager = services.sessionManager;
        this.storage = services.storage;

        this.serviceName = options.serviceName || this.constructor.name;
        this.debug = options.debug || false;

        this.log('Service initialized');
    }

    // ==================== Lifecycle Methods ====================

    /**
     * Initialize service
     *
     * Override this method to perform service-specific initialization.
     * Called after service construction.
     */
    async initialize(): Promise<void> {
        this.log('Initialize (default implementation - no action)');
    }

    /**
     * Dispose service
     *
     * Override this method to perform cleanup when service is destroyed.
     */
    async dispose(): Promise<void> {
        this.log('Dispose (default implementation - no action)');
    }

    // ==================== Error Handling ====================

    /**
     * Handle middleware error and convert to domain error
     *
     * Wraps middleware operations and converts thrown errors to domain AuthError format.
     *
     * @param operation - Async operation that may throw middleware errors
     * @returns Result of the operation
     * @throws AuthError with appropriate error code and message
     */
    protected async handleMiddlewareError<T>(
        operation: () => Promise<T>
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            this.logError('Middleware error caught', error);
            throw this.convertToAuthError(error);
        }
    }

    /**
     * Convert error to domain AuthError
     *
     * Override this method to provide service-specific error mapping.
     *
     * @param error - Original error from middleware
     * @returns Converted AuthError
     */
    protected convertToAuthError(error: unknown): AuthError {
        if (this.isAuthError(error)) {
            return error;
        }

        const message = error instanceof Error ? error.message : String(error);

        // Map common middleware errors to auth error codes
        if (message.includes('network') || message.includes('fetch')) {
            return this.createAuthError('network_error' as AuthErrorCode, message);
        }

        if (message.includes('token') || message.includes('expired')) {
            return this.createAuthError('token_expired' as AuthErrorCode, message);
        }

        if (message.includes('unauthorized') || message.includes('authentication')) {
            return this.createAuthError('invalid_credentials' as AuthErrorCode, message);
        }

        // Default to server error
        return this.createAuthError(
            'server_error' as AuthErrorCode,
            message || 'An unexpected error occurred'
        );
    }

    /**
     * Create auth error
     *
     * @param code - Error code
     * @param message - Error message
     * @param details - Optional error details
     * @returns AuthError object
     */
    protected createAuthError(
        code: AuthErrorCode,
        message: string,
        details: unknown = null
    ): AuthError {
        return {
            code,
            message,
            details
        };
    }

    /**
     * Check if error is already an AuthError
     *
     * @param error - Error to check
     * @returns True if error is AuthError
     */
    private isAuthError(error: unknown): error is AuthError {
        return (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            'message' in error
        );
    }

    // ==================== Logging ====================

    /**
     * Log message
     *
     * @param message - Log message
     * @param data - Optional data to log
     */
    protected log(message: string, ...data: unknown[]): void {
        if (this.debug) {
            console.log(`[${this.serviceName}] ${message}`, ...data);
        }
    }

    /**
     * Log error
     *
     * @param message - Error message
     * @param error - Error object
     */
    protected logError(message: string, error: unknown): void {
        console.error(`[${this.serviceName}] ❌ ${message}`, error);
    }

    // ==================== Utilities ====================

    /**
     * Ensure middleware session is established
     *
     * Helper method that ensures the 4-phase handshake is complete
     * before performing operations that require authentication.
     *
     * @throws Error if session cannot be established
     */
    protected async ensureSession(): Promise<void> {
        await this.middleware.ensureSession();
        this.log('Session ensured, status:', this.middleware.currentStatus);
    }

    /**
     * Get current middleware status
     *
     * @returns Current middleware status (idle, channel-ready, session)
     */
    protected getMiddlewareStatus(): string {
        return this.middleware.currentStatus;
    }

    /**
     * Check if middleware has active session
     *
     * @returns True if middleware is in session-ready state
     */
    protected hasActiveSession(): boolean {
        return this.middleware.currentStatus === 'session-ready';
    }
}
