import type { HttpClient, HttpRequest, HttpResponse } from './HttpClient';
import type { ChannelManager } from '../channel/ChannelManager';
import type { CryptoDriver } from '../crypto/CryptoDriver';
import type { ChannelRuntimeState, EncryptedPayload } from '../types';

/**
 * List of public endpoints that should NOT be encrypted
 */
const PUBLIC_ENDPOINTS = [
    '/api/channel/open',
    '/api/channel/initiate'
];

/**
 * Check if an endpoint is public (no encryption needed)
 */
function isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

/**
 * EncryptedHttpClient wraps another HttpClient and automatically encrypts
 * requests/responses when a channel is available, except for public endpoints.
 *
 * Note: For most authenticated operations, use ResearchNodeMiddleware.invoke()
 * which handles channel, session, and encryption automatically.
 *
 * This client is useful for:
 * - Low-level channel operations
 * - Custom endpoints that need encryption but not session management
 */
export class EncryptedHttpClient implements HttpClient {
    private currentChannel: ChannelRuntimeState | null = null;

    constructor(
        private readonly baseClient: HttpClient,
        private readonly channelManager: ChannelManager,
        private readonly cryptoDriver: CryptoDriver
    ) {}

    /**
     * Set the current channel for encryption
     */
    setChannel(channel: ChannelRuntimeState | null): void {
        this.currentChannel = channel;
    }

    /**
     * Get the current channel
     */
    getChannel(): ChannelRuntimeState | null {
        return this.currentChannel;
    }

    /**
     * Make an HTTP request with automatic encryption when channel is available
     */
    async request<TResponse = unknown, TPayload = unknown>(
        request: HttpRequest<TPayload>
    ): Promise<HttpResponse<TResponse>> {
        // Check if this is a public endpoint
        if (isPublicEndpoint(request.url)) {
            return this.baseClient.request<TResponse, TPayload>(request);
        }

        // Check if we have an active channel
        const channel = this.currentChannel;
        if (!channel) {
            // No channel available, pass through without encryption
            return this.baseClient.request<TResponse, TPayload>(request);
        }

        // Check if channel is expired
        if (channel.expiresAt.getTime() <= Date.now()) {
            // Channel expired, pass through without encryption
            // (caller should renew channel)
            return this.baseClient.request<TResponse, TPayload>(request);
        }

        // Encrypt the request body if present
        let encryptedBody: EncryptedPayload | undefined;
        if (request.body !== undefined) {
            encryptedBody = await this.cryptoDriver.encrypt(request.body, channel.cryptoKey);
        }

        // Add channel header
        const headers = {
            ...(request.headers ?? {}),
            'X-Channel-Id': channel.channelId
        };

        // Make the request with encrypted payload
        const response = await this.baseClient.request<EncryptedPayload | TResponse, EncryptedPayload | TPayload>({
            ...request,
            headers,
            body: encryptedBody as TPayload
        });

        // Check if response is encrypted (has ciphertext field)
        const responseData = response.data as unknown;
        if (
            responseData &&
            typeof responseData === 'object' &&
            'encryptedData' in responseData &&
            'iv' in responseData &&
            'authTag' in responseData
        ) {
            // Decrypt the response
            const decrypted = await this.cryptoDriver.decrypt<TResponse>(
                responseData as EncryptedPayload,
                channel.cryptoKey
            );

            return {
                ...response,
                data: decrypted
            };
        }

        // Response is not encrypted, return as-is
        return response as HttpResponse<TResponse>;
    }

    /**
     * Ensure we have a valid channel, creating one if necessary
     */
    async ensureChannel(): Promise<ChannelRuntimeState> {
        // Check if current channel is valid
        if (this.currentChannel && this.currentChannel.expiresAt.getTime() > Date.now()) {
            return this.currentChannel;
        }

        // Open a new channel
        const { runtime } = await this.channelManager.openChannel();
        this.currentChannel = runtime;
        return runtime;
    }

    /**
     * Clear the current channel
     */
    clearChannel(): void {
        this.currentChannel = null;
    }
}
