import type { CryptoDriver } from '../crypto/CryptoDriver';
import type { HttpClient, HttpMethod } from '../http/HttpClient';
import type {
    AuthenticationPayload,
    AuthenticationResult,
    ChallengeRequestPayload,
    ChallengeResponseResult,
    ChannelRuntimeState,
    EncryptedPayload,
    NodeIdentifyPayload,
    NodeIdentifyResult,
    PersistedSessionState,
    SessionRenewResult,
    SessionRuntimeState,
    SessionWhoAmIResult
} from '../types';

export class SessionManager {
    constructor(private readonly httpClient: HttpClient, private readonly cryptoDriver: CryptoDriver) {}

    private async encrypt(channel: ChannelRuntimeState, payload: unknown): Promise<EncryptedPayload> {
        return this.cryptoDriver.encrypt(payload, channel.cryptoKey);
    }

    private async decrypt<T>(channel: ChannelRuntimeState, payload: EncryptedPayload): Promise<T> {
        return this.cryptoDriver.decrypt<T>(payload, channel.cryptoKey);
    }

    private buildHeaders(channel: ChannelRuntimeState, session?: SessionRuntimeState): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Channel-Id': channel.channelId
        };

        // Add session token header if session is provided
        if (session) {
            headers['X-Session-Id'] = session.sessionToken;
        }

        return headers;
    }

    async identifyNode(channel: ChannelRuntimeState, payload: NodeIdentifyPayload): Promise<NodeIdentifyResult> {
        const encrypted = await this.encrypt(channel, payload);
        const response = await this.httpClient.request<EncryptedPayload>({
            url: '/api/node/identify',
            method: 'POST',
            headers: this.buildHeaders(channel),
            body: encrypted
        });

        return this.decrypt<NodeIdentifyResult>(channel, response.data);
    }

    async requestChallenge(channel: ChannelRuntimeState, payload: ChallengeRequestPayload): Promise<ChallengeResponseResult> {
        const encrypted = await this.encrypt(channel, payload);
        const response = await this.httpClient.request<EncryptedPayload>({
            url: '/api/node/challenge',
            method: 'POST',
            headers: this.buildHeaders(channel),
            body: encrypted
        });

        return this.decrypt<ChallengeResponseResult>(channel, response.data);
    }

    async authenticate(channel: ChannelRuntimeState, payload: AuthenticationPayload): Promise<AuthenticationResult> {
        const encrypted = await this.encrypt(channel, payload);
        const response = await this.httpClient.request<EncryptedPayload>({
            url: '/api/node/authenticate',
            method: 'POST',
            headers: this.buildHeaders(channel),
            body: encrypted
        });

        return this.decrypt<AuthenticationResult>(channel, response.data);
    }

    async whoAmI(channel: ChannelRuntimeState, session: SessionRuntimeState): Promise<SessionWhoAmIResult> {
        const encrypted = await this.encrypt(channel, {
            channelId: channel.channelId,
            sessionToken: session.sessionToken,
            timestamp: new Date().toISOString()
        });

        const response = await this.httpClient.request<EncryptedPayload>({
            url: '/api/session/whoami',
            method: 'POST',
            headers: this.buildHeaders(channel),
            body: encrypted
        });

        return this.decrypt<SessionWhoAmIResult>(channel, response.data);
    }

    async renewSession(channel: ChannelRuntimeState, session: SessionRuntimeState, additionalSeconds: number): Promise<SessionRenewResult> {
        const encrypted = await this.encrypt(channel, {
            channelId: channel.channelId,
            sessionToken: session.sessionToken,
            additionalSeconds,
            timestamp: new Date().toISOString()
        });

        const response = await this.httpClient.request<EncryptedPayload>({
            url: '/api/session/renew',
            method: 'POST',
            headers: this.buildHeaders(channel),
            body: encrypted
        });

        return this.decrypt<SessionRenewResult>(channel, response.data);
    }

    async revokeSession(channel: ChannelRuntimeState, session: SessionRuntimeState): Promise<void> {
        const encrypted = await this.encrypt(channel, {
            channelId: channel.channelId,
            sessionToken: session.sessionToken,
            timestamp: new Date().toISOString()
        });

        await this.httpClient.request<EncryptedPayload>({
            url: '/api/session/revoke',
            method: 'POST',
            headers: this.buildHeaders(channel),
            body: encrypted
        });
    }

    async submitEncryptedPayload<TPayload, TResponse>(
        channel: ChannelRuntimeState,
        session: SessionRuntimeState,
        path: string,
        method: HttpMethod,
        payload: TPayload
    ): Promise<TResponse> {
        const envelope = await this.encrypt(channel, {
            ...payload,
            channelId: channel.channelId,
            sessionToken: session.sessionToken,
            timestamp: new Date().toISOString()
        });

        const response = await this.httpClient.request<EncryptedPayload>({
            url: path,
            method,
            headers: this.buildHeaders(channel, session),
            body: envelope
        });

        return this.decrypt<TResponse>(channel, response.data);
    }

    restoreFromPersisted(state: PersistedSessionState): SessionRuntimeState {
        return {
            sessionToken: state.sessionToken,
            registrationId: state.registrationId,
            capabilities: state.capabilities,
            expiresAt: new Date(state.expiresAt),
            nodeId: state.nodeId,
            requestWindowCount: state.requestWindowCount
        };
    }

    toPersisted(session: SessionRuntimeState): PersistedSessionState {
        return {
            sessionToken: session.sessionToken,
            registrationId: session.registrationId,
            capabilities: session.capabilities,
            expiresAt: session.expiresAt.toISOString(),
            nodeId: session.nodeId,
            requestWindowCount: session.requestWindowCount
        };
    }
}
