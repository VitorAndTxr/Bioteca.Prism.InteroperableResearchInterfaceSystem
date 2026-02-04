/**
 * Research Node Middleware Configuration for IRIS Mobile
 *
 * This file configures the middleware to communicate with the InteroperableResearchNode backend.
 * It sets up:
 * - HTTP client (Fetch)
 * - Cryptographic operations (ReactNativeCryptoDriver — native OpenSSL via JSI)
 * - Secure storage (Expo SecureStore)
 * - Channel and Session management
 * - User authentication service
 * - Real certificate loading and RSA-SHA256 signing (via node-forge)
 */

import {
    ResearchNodeMiddleware,
    ChannelManager,
    SessionManager,
    FetchHttpClient,
    UserAuthService,
    type ResearchNodeCertificateConfig,
    type ChallengeSignatureContext
} from '@iris/middleware';
import { createReactNativeSecureStorage } from '../storage/ReactNativeSecureStorage';
import { ReactNativeCryptoDriver } from '../crypto/ReactNativeCryptoDriver';
import * as forge from 'node-forge';

/**
 * Backend configuration
 *
 * For Android emulator: use 10.0.2.2 to reach host machine's localhost.
 * For physical device: set EXPO_PUBLIC_API_URL to your machine's LAN IP.
 */
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

/**
 * Load certificate configuration
 *
 * Uses the same node_a development certificate as the desktop app.
 * In production, certificates should come from secure configuration.
 */
function loadCertificateConfig(): ResearchNodeCertificateConfig {
    const envCert = process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE;
    const envCertKey = process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE_WITH_PRIVATE_KEY;
    const envPassword = process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_CERTIFICATE_PASSWORD;

    if (envCert && envCertKey && envPassword) {
        console.log('[Middleware] Certificate loaded from environment variables');
        return {
            subjectName: process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_SUBJECT_NAME || 'mobile-node',
            certificate: envCert,
            certificateWithPrivateKey: envCertKey,
            password: envPassword,
            validFrom: process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_VALID_FROM || new Date().toISOString(),
            validTo: process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_VALID_TO || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            thumbprint: process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_THUMBPRINT || '',
            serialNumber: process.env.EXPO_PUBLIC_IRN_MIDDLEWARE_SERIAL_NUMBER || ''
        };
    }

    // Development fallback: node_a certificate from InteroperableResearchNode
    console.warn('[Middleware] Using node_a development certificate — NOT secure for production');
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

const CERTIFICATE_CONFIG = loadCertificateConfig();

// ── RSA-SHA256 Signing (via node-forge) ──────────────────────────────────────

let cachedPrivateKey: forge.pki.PrivateKey | null = null;

function loadPrivateKey(certificateConfig: ResearchNodeCertificateConfig): forge.pki.rsa.PrivateKey {
    if (cachedPrivateKey) {
        return cachedPrivateKey as forge.pki.rsa.PrivateKey;
    }

    try {
        const p12Der = forge.util.decode64(certificateConfig.certificateWithPrivateKey);
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certificateConfig.password);

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
        console.log('[Middleware] Private key loaded from certificate');
        return privateKey;
    } catch (error) {
        console.error('[Middleware] Failed to load private key:', error);
        throw new Error(`Certificate parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Real RSA-SHA256 signature function using certificate private key.
 *
 * Data format MUST match backend exactly:
 * Format: {challengeData}{channelId}{nodeId}{timestamp}
 * NO SEPARATORS — direct concatenation only.
 */
async function signChallenge(context: ChallengeSignatureContext): Promise<string> {
    try {
        const privateKey = loadPrivateKey(context.certificate);

        // Exact format matching backend (no separators)
        const dataToSign = context.challengeData + context.channelId + context.nodeId + context.timestamp;

        const md = forge.md.sha256.create();
        md.update(dataToSign, 'utf8');

        const signature = privateKey.sign(md);
        const signatureBase64 = forge.util.encode64(signature);

        console.log('[Middleware] RSA-SHA256 signature generated');
        console.log('[Middleware]   Data length:', dataToSign.length);
        console.log('[Middleware]   Signature:', signatureBase64.substring(0, 40) + '...');

        return signatureBase64;
    } catch (error) {
        console.error('[Middleware] Signature generation failed:', error);
        throw new Error(`Failed to sign challenge: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ── Middleware initialization ─────────────────────────────────────────────────

function initializeMiddleware() {
    const storage = createReactNativeSecureStorage('iris-mobile');

    const httpClient = new FetchHttpClient(BACKEND_URL, {
        'Content-Type': 'application/json'
    });

    // Use native crypto driver instead of WebCryptoDriver
    const cryptoDriver = new ReactNativeCryptoDriver();

    const channelManager = new ChannelManager(httpClient, cryptoDriver);
    const sessionManager = new SessionManager(httpClient, cryptoDriver);

    // Set JWT token provider for [Authorize] endpoints
    sessionManager.setJwtTokenProvider(async () => {
        try {
            const authState = await storage.getItem('userauth:state') as { token?: string } | null;
            return authState?.token ?? null;
        } catch (error) {
            console.error('[Middleware] Failed to get JWT token from storage:', error);
            return null;
        }
    });

    const middleware = new ResearchNodeMiddleware({
        channelManager,
        sessionManager,
        certificate: CERTIFICATE_CONFIG,
        nodeId: CERTIFICATE_CONFIG.subjectName,
        signChallenge,

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

// Singleton
let services: ReturnType<typeof initializeMiddleware> | null = null;

export function getMiddlewareServices() {
    if (!services) {
        services = initializeMiddleware();
    }
    return services;
}

export async function initializeAndHydrate() {
    const { middleware, authService, storage } = getMiddlewareServices();

    try {
        const channel = await storage.getItem('channel');
        const session = await storage.getItem('session');

        if (channel || session) {
            await middleware.hydrate();
        }

        await authService.initialize();

        console.log('[Middleware] Successfully initialized and hydrated');
        console.log('[Middleware] Backend:', BACKEND_URL);
        console.log('[Middleware] Authenticated:', authService.isAuthenticated());
    } catch (error) {
        console.error('[Middleware] Failed to initialize:', error);
    }
}

// Export commonly used services
export const { middleware, authService } = getMiddlewareServices();

export async function cleanupMiddleware() {
    const { authService } = getMiddlewareServices();
    await authService.dispose();
}
