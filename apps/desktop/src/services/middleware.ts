/**
 * Research Node Middleware Configuration for IRIS Desktop
 *
 * This file configures the middleware to communicate with the InteroperableResearchNode backend.
 * It sets up:
 * - HTTP client (Fetch)
 * - Cryptographic operations (WebCrypto)
 * - Secure storage (Electron safeStorage)
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
import { createElectronSecureStorage } from '../storage/ElectronSecureStorage';
import { RealAuthService } from './auth/RealAuthService';
import { UserService } from './user/UserService';
import { ResearcherService } from './researcher/ResearcherService';
import * as forge from 'node-forge';
import { SnomedService } from './snomed/SnomedService';

/**
 * Backend configuration
 */
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Load certificate configuration from environment variables
 * Falls back to node_a certificate from InteroperableResearchNode for development
 */
function loadCertificateConfig(): ResearchNodeCertificateConfig {
    const env = import.meta.env;

    const subjectName = env.VITE_IRN_MIDDLEWARE_SUBJECT_NAME;
    const certificate = env.VITE_IRN_MIDDLEWARE_CERTIFICATE;
    const certificateWithPrivateKey = env.VITE_IRN_MIDDLEWARE_CERTIFICATE_WITH_PRIVATE_KEY;
    const password = env.VITE_IRN_MIDDLEWARE_CERTIFICATE_PASSWORD;
    const validFrom = env.VITE_IRN_MIDDLEWARE_VALID_FROM;
    const validTo = env.VITE_IRN_MIDDLEWARE_VALID_TO;
    const thumbprint = env.VITE_IRN_MIDDLEWARE_THUMBPRINT;
    const serialNumber = env.VITE_IRN_MIDDLEWARE_SERIAL_NUMBER;

    // Check if any required environment variables are missing
    const missing = [
        ['VITE_IRN_MIDDLEWARE_SUBJECT_NAME', subjectName],
        ['VITE_IRN_MIDDLEWARE_CERTIFICATE', certificate],
        ['VITE_IRN_MIDDLEWARE_CERTIFICATE_WITH_PRIVATE_KEY', certificateWithPrivateKey],
        ['VITE_IRN_MIDDLEWARE_CERTIFICATE_PASSWORD', password],
        ['VITE_IRN_MIDDLEWARE_VALID_FROM', validFrom],
        ['VITE_IRN_MIDDLEWARE_VALID_TO', validTo],
        ['VITE_IRN_MIDDLEWARE_THUMBPRINT', thumbprint],
        ['VITE_IRN_MIDDLEWARE_SERIAL_NUMBER', serialNumber]
    ].filter(([, value]) => !value);

    if (missing.length > 0) {
        console.warn('[Middleware] Missing certificate environment variables:', missing.map(([key]) => key));
        console.warn('[Middleware] Using node_a certificate from InteroperableResearchNode for development');
        console.warn('[Middleware] This is NOT secure for production!');

        // Use node_a certificate from InteroperableResearchNode (from node_a.md)
        return {
            subjectName: 'noda_a',
            certificate: 'MIIC0zCCAbugAwIBAgIIEhp057X+zFwwDQYJKoZIhvcNAQELBQAwETEPMA0GA1UEAwwGbm9kYV9hMB4XDTI1MTAyMzIxMzcyMVoXDTI3MTAyMzIxMzcyMVowETEPMA0GA1UEAwwGbm9kYV9hMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh8zFiUpVqcUInFkn0UhU2KOIkQccWgiGl8/kRP7beqChLbakJuLEzScd7jQIgsUh/qBaCXaWIdcgur+nQODaazlCFvnf/9Xky+56TGWjhnGUEZbo/JCRAoKeQU1k1n/n09USgU5IdiCe/59UoSeK+FNVEaUXaEZi/n8ap852cKhfiJbuQQHrevtdWkMqfhUtN0nDfkMQNvuzkeC9SI9HajNUIX+jwpffHi10crxXXOs5pZexhDpr46/MMZ8k+a6YcbQ0Oz+C2Qbv/Djk7Kec9cyoqzoYPw+d9E+T5P3qCa7Y9qeOiQAQMq7h6yvz6b8Dttmu+VYAQADgplXx40L9vQIDAQABoy8wLTAJBgNVHRMEAjAAMAsGA1UdDwQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0BAQsFAAOCAQEAQLl1Gg8wx866mlOuZJWW+b9w16+1qBOZdrnLpA8ajrrJV8uJ6bjGud0TSyZhChdrTqes0/HizT9yAa017ouxCsLdOZEGfYq63DmrKfySmxe18RMy1nw6wC/FtRXXt0H4c0Fj2yassCaGCxeHsiPy9/l+kbwxb1c5ZRJXX3YOrmkBnvuiKAbfaFE677HK9EzDsJ/Kb/n/T1YalbhcA+rV3YMI/3LMvWAyxRN2vNIZSUVI3Oojir3BfayfAzkGaSnMsSmZvSd9nrtCx9+S9TXpcDc8JuvS1U8XUHvMNraBB24YDVsXp0VjoNYo8+Mkm+2qPTMQp06hXH7pVJIUncDkug==',
            certificateWithPrivateKey: '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',
            password: 'string',
            validFrom: '2025-10-23T21:37:21+00:00',
            validTo: '2027-10-23T21:37:21+00:00',
            thumbprint: '9EB5516F38D664C66DA7067C93F0886A7A9CC1EC',
            serialNumber: '121A74E7B5FECC5C'
        };
    }

    console.log('[Middleware] Certificate loaded from environment variables ✅');

    return {
        subjectName: subjectName!,
        certificate: certificate!,
        certificateWithPrivateKey: certificateWithPrivateKey!,
        password: password!,
        validFrom: validFrom!,
        validTo: validTo!,
        thumbprint: thumbprint!,
        serialNumber: serialNumber!
    };
}

/**
 * Certificate configuration (loaded from env or mock for development)
 */
const CERTIFICATE_CONFIG = loadCertificateConfig();

/**
 * Cache for parsed private key to avoid re-parsing on every signature
 */
let cachedPrivateKey: forge.pki.PrivateKey | null = null;

/**
 * Load and parse the PKCS#12 certificate to extract the private key
 */
function loadPrivateKey(certificateConfig: ResearchNodeCertificateConfig): forge.pki.rsa.PrivateKey {
    if (cachedPrivateKey) {
        return cachedPrivateKey as forge.pki.rsa.PrivateKey;
    }

    try {
        // Decode Base64 PKCS#12 certificate
        const p12Der = forge.util.decode64(certificateConfig.certificateWithPrivateKey);

        // Parse PKCS#12
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certificateConfig.password);

        // Extract private key from PKCS#12
        const bags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const keyBag = bags[forge.pki.oids.pkcs8ShroudedKeyBag];

        if (!keyBag || keyBag.length === 0) {
            throw new Error('No private key found in PKCS#12 certificate');
        }

        const privateKey = keyBag[0].key as forge.pki.rsa.PrivateKey;

        if (!privateKey) {
            throw new Error('Failed to extract private key from certificate');
        }

        cachedPrivateKey = privateKey;
        console.log('[Middleware] ✅ Private key loaded from certificate');

        return privateKey;
    } catch (error) {
        console.error('[Middleware] ❌ Failed to load private key:', error);
        throw new Error(`Certificate parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Real RSA-SHA256 signature function using certificate private key
 *
 * CRITICAL: Data format MUST match backend exactly:
 * Format: {challengeData}{channelId}{nodeId}{timestamp}
 * NO SEPARATORS, NO SPACES - direct concatenation only
 *
 * Backend reference: InteroperableResearchNode/docs/workflows/PHASE3_AUTHENTICATION_FLOW.md:426-443
 */
async function signChallenge(context: ChallengeSignatureContext): Promise<string> {
    try {
        // Load private key from certificate
        const privateKey = loadPrivateKey(context.certificate);

        // Construct data to sign (EXACT format as backend - lines 280-286)
        // Format: {challengeData}{channelId}{nodeId}{timestamp}
        // NO SEPARATORS - direct concatenation
        const dataToSign = context.challengeData + context.channelId + context.nodeId + context.timestamp;

        // Create SHA-256 hash
        const md = forge.md.sha256.create();
        md.update(dataToSign, 'utf8');

        // Sign with RSA private key (PKCS#1 v1.5 padding)
        const signature = privateKey.sign(md);

        // Return Base64 encoded signature
        const signatureBase64 = forge.util.encode64(signature);

        console.log('[Middleware] 🔐 RSA-SHA256 signature generated');
        console.log('[Middleware]    Data format: {challengeData}{channelId}{nodeId}{timestamp}');
        console.log('[Middleware]    Data length:', dataToSign.length);
        console.log('[Middleware]    Data (first 80 chars):', dataToSign.substring(0, 80) + '...');
        console.log('[Middleware]    Signature:', signatureBase64.substring(0, 40) + '...');

        return signatureBase64;
    } catch (error) {
        console.error('[Middleware] ❌ Signature generation failed:', error);
        throw new Error(`Failed to sign challenge: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Initialize middleware services (synchronous)
 * Persisted state will be loaded later in initializeAndHydrate()
 */
function initializeMiddleware() {
    // Create secure storage
    const storage = createElectronSecureStorage('iris-desktop');

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

    // Set JWT token provider for Authorization header
    // This retrieves the JWT token from secure storage for [Authorize] endpoints
    sessionManager.setJwtTokenProvider(async () => {
        console.log('[Middleware] JWT Token Provider called - fetching from storage...');

        try {
            // Check if there's anything in localStorage first
            const rawValue = localStorage.getItem('iris:userauth:state');
            console.log('[Middleware] Raw localStorage value:', rawValue ? `Found (${rawValue.length} chars)` : 'null');

            // UserAuthService stores auth state with key 'userauth:state'
            // Format: { token: string, expiresAt: string, user: User }
            const authState = await storage.getItem('userauth:state') as any;
            console.log('[Middleware] Storage result after decryption:', authState ? 'Auth state found' : 'null/undefined');

            if (authState && authState.token) {
                console.log('[Middleware] ✅ JWT Token extracted:', `${authState.token.substring(0, 20)}...`);
                return authState.token;
            }

            console.log('[Middleware] ⚠️ No token found in decrypted state');
            return null;
        } catch (error) {
            console.error('[Middleware] ❌ DECRYPTION ERROR:', error);
            console.error('[Middleware]    Error message:', error instanceof Error ? error.message : String(error));
            console.error('[Middleware]    Error stack:', error instanceof Error ? error.stack : 'No stack trace');

            // Check if encryption is available
            const isEncryptionAvailable = (storage as any).isEncryptionAvailable?.();
            console.log('[Middleware]    Encryption available:', isEncryptionAvailable);

            return null;
        }
    });

    // Create middleware instance without persisted state initially
    // State will be loaded and hydrated in initializeAndHydrate()
    const middleware = new ResearchNodeMiddleware({
        channelManager,
        sessionManager,
        certificate: CERTIFICATE_CONFIG,
        nodeId: CERTIFICATE_CONFIG.subjectName,
        initialChannel: null,
        initialSession: null,
        signChallenge: signChallenge,

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
    const userAuthService = new UserAuthService(
        httpClient,
        storage,
        middleware,
        {
            refreshBeforeExpiration: 5 * 60 * 1000, // 5 minutes
            storagePrefix: 'userauth'
        }
    );

    // Create middleware services container for BaseService pattern
    const middlewareServices = {
        middleware,
        httpClient,
        cryptoDriver,
        channelManager,
        sessionManager,
        storage
    };

    // Create real auth service (adapter for AuthContext)
    // Now using BaseService pattern with middleware services container
    const authService = new RealAuthService(middlewareServices, userAuthService);

    // Create user service
    const userService = new UserService(middlewareServices);

    // Create researcher service
    const researcherService = new ResearcherService(middlewareServices);

    const snomedService = new SnomedService(middlewareServices);

    return {
        middleware,
        userAuthService,
        authService,
        userService,
        researcherService,
        storage,
        httpClient,
        snomedService,
        cryptoDriver,
        channelManager,
        sessionManager,
        middlewareServices // Export for use by other services
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
 * This loads persisted channel/session state and initializes auth service
 */
export async function initializeAndHydrate() {
    console.log('[Middleware] 🔧 Initialization starting...');
    const { middleware, userAuthService, storage } = getMiddlewareServices();

    try {
        // Note: Middleware was created with null initial state
        // If we had persisted state, we would need to recreate the middleware
        // For now, hydrate() will just initialize with empty state
        console.log('[Middleware]    Hydrating middleware...');
        await middleware.hydrate();
        console.log(`[Middleware]    ✅ Middleware hydrated (status: ${middleware.currentStatus})`);

        // Initialize auth service (loads stored auth state)
        console.log('[Middleware]    Initializing UserAuthService...');
        await userAuthService.initialize();
        console.log('[Middleware]    ✅ UserAuthService initialized');

        console.log('[Middleware] ✅ Successfully initialized and hydrated');
        console.log('[Middleware]    Status:', middleware.currentStatus);
        console.log('[Middleware]    Authenticated:', userAuthService.isAuthenticated());

        if (userAuthService.isAuthenticated()) {
            const user = await userAuthService.getCurrentUser();
            console.log('[Middleware]    Current user:', user.username, `(${user.email})`);
        }
    } catch (error) {
        console.error('[Middleware] ❌ Failed to initialize:', error);
    }
}

// Export commonly used services directly for synchronous imports
export const { middleware, authService, userAuthService, userService, researcherService, snomedService } = getMiddlewareServices();

/**
 * Cleanup middleware resources
 */
export async function cleanupMiddleware() {
    const { userAuthService } = getMiddlewareServices();
    await userAuthService.dispose();
}
