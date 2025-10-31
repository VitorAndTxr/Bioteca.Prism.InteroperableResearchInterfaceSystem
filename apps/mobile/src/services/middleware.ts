/**
 * Research Node Middleware Configuration for IRIS Mobile
 *
 * This file configures the middleware to communicate with the InteroperableResearchNode backend.
 * It sets up:
 * - HTTP client (Fetch)
 * - Cryptographic operations (WebCrypto)
 * - Secure storage (Expo SecureStore)
 * - Channel and Session management
 * - User authentication service
 */

import {
    ResearchNodeMiddleware,
    ChannelManager,
    SessionManager,
    WebCryptoDriver,
    FetchHttpClient,
    UserAuthService,
    type ResearchNodeCertificateConfig,
    type ChallengeSignatureContext
} from '@iris/middleware';
import { createReactNativeSecureStorage } from '../storage/ReactNativeSecureStorage';

/**
 * Backend configuration
 * TODO: Move to environment variables or config file
 */
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Mock certificate for development
 * TODO: Replace with real certificate management
 */
const MOCK_CERTIFICATE: ResearchNodeCertificateConfig = {
    subjectName: 'CN=IRIS-Mobile-Development',
    certificate: 'MOCK_CERT_DATA',
    certificateWithPrivateKey: 'MOCK_CERT_WITH_KEY',
    password: 'mock-password',
    validFrom: new Date().toISOString(),
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    thumbprint: 'MOCK_THUMBPRINT',
    serialNumber: 'MOCK_SERIAL'
};

/**
 * Mock signature function for development
 * TODO: Replace with real RSA signature using certificate private key
 */
async function mockSignChallenge(context: ChallengeSignatureContext): Promise<string> {
    const dataToSign = `${context.channelId}:${context.nodeId}:${context.challengeData}:${context.timestamp}`;

    // In production, this should use RSA-SHA256 signature with the certificate's private key
    // For now, we just return a mock signature
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToSign);

    // Use subtle crypto for hashing (mock signature)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `MOCK_SIGNATURE:${hashHex}`;
}

/**
 * Initialize middleware services
 */
function initializeMiddleware() {
    // Create secure storage
    const storage = createReactNativeSecureStorage('iris-mobile');

    // Create HTTP client
    const httpClient = new FetchHttpClient(BACKEND_URL, {
        'Content-Type': 'application/json'
    });

    // Create crypto driver
    const cryptoDriver = new WebCryptoDriver();

    // Create channel manager
    const channelManager = new ChannelManager(httpClient, cryptoDriver);

    // Create session manager
    const sessionManager = new SessionManager(httpClient, cryptoDriver);

    // Create middleware instance
    const middleware = new ResearchNodeMiddleware({
        channelManager,
        sessionManager,
        certificate: MOCK_CERTIFICATE,
        nodeId: 'iris-mobile-node',
        signChallenge: mockSignChallenge,

        // Persistence callbacks
        onChannelPersist: async (channel) => {
            if (channel) {
                await storage.setItem('channel', channel);
            } else {
                await storage.removeItem('channel');
            }
        },
        onSessionPersist: async (session) => {
            if (session) {
                await storage.setItem('session', session);
            } else {
                await storage.removeItem('session');
            }
        }
    });

    // Create user auth service
    const authService = new UserAuthService(
        httpClient,
        storage,
        middleware,
        {
            refreshBeforeExpiration: 5 * 60 * 1000, // 5 minutes
            storagePrefix: 'userauth'
        }
    );

    return {
        middleware,
        authService,
        storage,
        httpClient,
        cryptoDriver,
        channelManager,
        sessionManager
    };
}

// Export singleton instances
let services: ReturnType<typeof initializeMiddleware> | null = null;

/**
 * Get middleware services (singleton)
 */
export function getMiddlewareServices() {
    if (!services) {
        services = initializeMiddleware();
    }
    return services;
}

/**
 * Initialize and hydrate middleware from storage
 */
export async function initializeAndHydrate() {
    const { middleware, authService, storage } = getMiddlewareServices();

    try {
        // Load persisted channel and session
        const channel = await storage.getItem('channel');
        const session = await storage.getItem('session');

        // Hydrate middleware with persisted state
        if (channel || session) {
            await middleware.hydrate();
        }

        // Initialize auth service (loads stored auth state)
        await authService.initialize();

        console.log('[Middleware] Successfully initialized and hydrated');
        console.log('[Middleware] Status:', middleware.currentStatus);
        console.log('[Middleware] Authenticated:', authService.isAuthenticated());
    } catch (error) {
        console.error('[Middleware] Failed to initialize:', error);
    }
}

// Export commonly used services
export const { middleware, authService } = getMiddlewareServices();

/**
 * Cleanup middleware resources
 */
export async function cleanupMiddleware() {
    const { authService } = getMiddlewareServices();
    await authService.dispose();
}
