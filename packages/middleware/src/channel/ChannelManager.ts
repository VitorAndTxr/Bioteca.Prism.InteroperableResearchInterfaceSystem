import type { CryptoDriver } from '../crypto/CryptoDriver';
import type { HttpClient } from '../http/HttpClient';
import type { ChannelOpenResponse, ChannelRuntimeState, PersistedChannelState } from '../types';

const DEFAULT_CHANNEL_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class ChannelManager {
    constructor(private readonly httpClient: HttpClient, private readonly cryptoDriver: CryptoDriver) {}

    async openChannel(): Promise<{ runtime: ChannelRuntimeState; persisted: PersistedChannelState; response: ChannelOpenResponse }>
    {
        const ephemeral = await this.cryptoDriver.generateEphemeralKeyPair();

        // Generate nonce for replay attack prevention
        const nonceArray = new Uint8Array(32);
        crypto.getRandomValues(nonceArray);
        const nonce = btoa(String.fromCharCode(...nonceArray));

        const response = await this.httpClient.request<{ ephemeralPublicKey: string; nonce: string }>({
            url: '/api/channel/open',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                protocolVersion: '1.0',
                ephemeralPublicKey: ephemeral.publicKey,
                keyExchangeAlgorithm: 'ECDH-P384',
                supportedCiphers: ['AES-256-GCM', 'ChaCha20-Poly1305'],
                timestamp: new Date().toISOString(),
                nonce: nonce
            }
        });

        const channelId = response.headers['x-channel-id'];
        if (!channelId) {
            throw new Error('ChannelManager: missing X-Channel-Id header in channel open response.');
        }

        const serverPublicKey = response.data.ephemeralPublicKey;
        if (!serverPublicKey) {
            throw new Error('ChannelManager: server public key missing in channel open response.');
        }

        const serverNonce = response.data.nonce;
        if (!serverNonce) {
            throw new Error('ChannelManager: server nonce missing in channel open response.');
        }

        const symmetricKey = await this.cryptoDriver.deriveSymmetricKey({
            privateKey: ephemeral.privateKey,
            peerPublicKey: serverPublicKey,
            clientNonce: nonce,
            serverNonce: serverNonce
        });
        const symmetricKeyExport = await this.cryptoDriver.exportSymmetricKey(symmetricKey);

        const expiresAt = new Date(Date.now() + DEFAULT_CHANNEL_TTL_MS);

        const runtime: ChannelRuntimeState = {
            channelId,
            cryptoKey: symmetricKey,
            symmetricKey: symmetricKeyExport,
            expiresAt,
            metadata: {
                serverPublicKey
            }
        };

        const persisted: PersistedChannelState = {
            channelId,
            symmetricKey: symmetricKeyExport,
            expiresAt: expiresAt.toISOString(),
            metadata: {
                serverPublicKey
            }
        };

        const openResponse: ChannelOpenResponse = {
            channelId,
            serverPublicKey,
            expiresAt
        };

        return {
            runtime,
            persisted,
            response: openResponse
        };
    }

    async restoreFromPersisted(state: PersistedChannelState): Promise<ChannelRuntimeState> {
        if (!state.symmetricKey) {
            throw new Error('ChannelManager: persisted channel state is missing symmetric key metadata.');
        }

        const cryptoKey = await this.cryptoDriver.importSymmetricKey(state.symmetricKey);
        return {
            channelId: state.channelId,
            symmetricKey: state.symmetricKey,
            cryptoKey,
            expiresAt: new Date(state.expiresAt),
            metadata: state.metadata
        };
    }
}
