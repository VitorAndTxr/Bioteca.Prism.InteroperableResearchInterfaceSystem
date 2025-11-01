import { ChannelManager } from '../channel/ChannelManager';
import { SessionManager } from '../session/SessionManager';
import type {
    ChannelRuntimeState,
    MiddlewareStatus,
    PersistedChannelState,
    PersistedSessionState,
    ResearchNodeCertificateConfig,
    SessionRuntimeState,
    NodeIdentifyPayload
} from '../types';
import { AuthorizationStatus } from '../types';

function isExpired(date: Date, skewMs = 5_000): boolean {
    return Date.now() >= date.getTime() - skewMs;
}

export interface IdentifyPayloadFactoryContext {
    channelId: string;
    nodeId: string;
    certificate: ResearchNodeCertificateConfig;
    timestamp: string;
}

export interface ChallengeSignatureContext {
    channelId: string;
    nodeId: string;
    challengeData: string;
    timestamp: string;
    certificate: ResearchNodeCertificateConfig;
}

export interface ResearchNodeMiddlewareOptions {
    channelManager: ChannelManager;
    sessionManager: SessionManager;
    certificate: ResearchNodeCertificateConfig;
    nodeId?: string;
    initialChannel?: PersistedChannelState | null;
    initialSession?: PersistedSessionState | null;
    onChannelPersist?: (next: PersistedChannelState | null) => Promise<void> | void;
    onSessionPersist?: (next: PersistedSessionState | null) => Promise<void> | void;
    prepareIdentifyPayload?: (context: IdentifyPayloadFactoryContext) => Promise<Partial<NodeIdentifyPayload>>;
    signChallenge: (context: ChallengeSignatureContext) => Promise<string>;
}

export interface InvokeOptions<TPayload extends Record<string, unknown> = Record<string, unknown>> {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload: TPayload;
}

export class ResearchNodeMiddleware {
    private channelRuntime: ChannelRuntimeState | null = null;
    private sessionRuntime: SessionRuntimeState | null = null;
    private status: MiddlewareStatus = 'idle';

    constructor(private readonly options: ResearchNodeMiddlewareOptions) {
        if (!options.signChallenge) {
            throw new Error('ResearchNodeMiddleware requires a signChallenge implementation.');
        }
    }

    get currentStatus(): MiddlewareStatus {
        return this.status;
    }

    get channel(): ChannelRuntimeState | null {
        return this.channelRuntime;
    }

    get session(): SessionRuntimeState | null {
        return this.sessionRuntime;
    }

    async hydrate(): Promise<void> {
        const { initialChannel, initialSession, channelManager, sessionManager } = this.options;

        if (initialChannel) {
            try {
                this.channelRuntime = await channelManager.restoreFromPersisted(initialChannel);
            } catch (error) {
                console.warn('[ResearchNodeMiddleware] Failed to restore channel from persisted state:', error);
                this.channelRuntime = null;
                await this.options.onChannelPersist?.(null);
            }
        }

        if (initialSession) {
            try {
                this.sessionRuntime = sessionManager.restoreFromPersisted(initialSession);
            } catch (error) {
                console.warn('[ResearchNodeMiddleware] Failed to restore session from persisted state:', error);
                this.sessionRuntime = null;
                await this.options.onSessionPersist?.(null);
            }
        }

        if (!this.channelRuntime && this.sessionRuntime) {
            this.sessionRuntime = null;
            await this.options.onSessionPersist?.(null);
        }

        if (this.sessionRuntime && !isExpired(this.sessionRuntime.expiresAt)) {
            this.status = 'session-ready';
        } else if (this.channelRuntime && !isExpired(this.channelRuntime.expiresAt)) {
            this.status = 'channel-ready';
        } else {
            this.status = 'idle';
        }
    }

    async ensureChannel(): Promise<ChannelRuntimeState> {
        if (this.channelRuntime && !isExpired(this.channelRuntime.expiresAt)) {
            console.log('[Middleware] ✅ Channel already exists and is valid');
            console.log('[Middleware]    Channel ID:', this.channelRuntime.channelId);
            console.log('[Middleware]    Expires at:', this.channelRuntime.expiresAt);
            this.status = this.status === 'idle' ? 'channel-ready' : this.status;
            return this.channelRuntime;
        }

        console.log('[Middleware] 🔄 PHASE 1: Opening encrypted channel...');
        this.status = 'negotiating-channel';
        const { runtime, persisted } = await this.options.channelManager.openChannel();
        this.channelRuntime = runtime;
        console.log('[Middleware] ✅ PHASE 1 COMPLETE: Channel established');
        console.log('[Middleware]    Channel ID:', runtime.channelId);
        console.log('[Middleware]    Expires at:', runtime.expiresAt);

        if (this.sessionRuntime) {
            console.log('[Middleware] ⚠️  Clearing old session due to new channel');
            this.sessionRuntime = null;
            await this.options.onSessionPersist?.(null);
        }
        await this.options.onChannelPersist?.(persisted);
        this.status = 'channel-ready';
        return runtime;
    }

    async ensureSession(): Promise<SessionRuntimeState> {
        const { sessionManager, certificate } = this.options;
        const channel = await this.ensureChannel();

        if (this.sessionRuntime && !isExpired(this.sessionRuntime.expiresAt)) {
            console.log('[Middleware] ✅ Session already exists and is valid');
            console.log('[Middleware]    Session token:', this.sessionRuntime.sessionToken.substring(0, 20) + '...');
            console.log('[Middleware]    Expires at:', this.sessionRuntime.expiresAt);
            this.status = 'session-ready';
            return this.sessionRuntime;
        }

        console.log('[Middleware] 🔄 PHASE 2: Identifying node with certificate...');
        this.status = 'identifying-node';
        const nodeId = this.options.nodeId ?? certificate.subjectName;
        const timestamp = new Date().toISOString();
        console.log('[Middleware]    Node ID:', nodeId);
        console.log('[Middleware]    Certificate Subject:', certificate.subjectName);

        const identifyPayload = await this.options.prepareIdentifyPayload?.({
            channelId: channel.channelId,
            nodeId,
            certificate,
            timestamp
        });

        const identifyResult = await sessionManager.identifyNode(channel, {
            channelId: channel.channelId,
            nodeId,
            certificate: certificate.certificate,
            timestamp,
            ...(identifyPayload ?? {})
        });

        console.log('[Middleware] ✅ PHASE 2 COMPLETE: Node identified');
        console.log('[Middleware]    Is Known:', identifyResult.isKnown);
        console.log('[Middleware]    Status:', identifyResult.status);
        console.log('[Middleware]    Registration ID:', identifyResult.registrationId);

        if (!identifyResult.isKnown || identifyResult.status !== AuthorizationStatus.Authorized || !identifyResult.registrationId) {
            this.status = 'error';
            console.error('[Middleware] ❌ PHASE 2 FAILED: Node identification rejected');
            console.error('[Middleware]    Status:', AuthorizationStatus[identifyResult.status] || identifyResult.status);
            console.error('[Middleware]    Message:', identifyResult.message);
            throw new Error(`Node identification failed: ${identifyResult.message ?? AuthorizationStatus[identifyResult.status]}`);
        }

        console.log('[Middleware] 🔄 PHASE 3: Authenticating with challenge-response...');
        this.status = 'authenticating-node';
        const challengeRequestTimestamp = new Date().toISOString();
        const challengeResponse = await sessionManager.requestChallenge(channel, {
            channelId: channel.channelId,
            nodeId,
            timestamp: challengeRequestTimestamp
        });

        console.log('[Middleware]    Challenge received:', challengeResponse.challengeData.substring(0, 20) + '...');

        // Determine which timestamp to use for authentication (ensure consistency)
        const authTimestamp = challengeResponse.challengeTimestamp ?? challengeRequestTimestamp;
        console.log('[Middleware]    Using timestamp for authentication:', authTimestamp);

        const signature = await this.options.signChallenge({
            channelId: channel.channelId,
            nodeId,
            challengeData: challengeResponse.challengeData,
            timestamp: authTimestamp,
            certificate
        });

        console.log('[Middleware]    Signature generated:', signature.substring(0, 20) + '...');

        const authResult = await sessionManager.authenticate(channel, {
            channelId: channel.channelId,
            nodeId,
            challengeData: challengeResponse.challengeData,
            signature,
            timestamp: authTimestamp
        });

        if (!authResult.authenticated) {
            this.status = 'error';
            console.error('[Middleware] ❌ PHASE 3 FAILED: Authentication rejected');
            throw new Error('Node authentication failed.');
        }

        console.log('[Middleware] ✅ PHASE 3 COMPLETE: Authentication successful');
        console.log('[Middleware]    Session token received');

        const runtime: SessionRuntimeState = {
            sessionToken: authResult.sessionToken,
            registrationId: authResult.registrationId,
            capabilities: authResult.capabilities,
            expiresAt: new Date(authResult.sessionExpiresAt),
            nodeId: authResult.nodeId,
            requestWindowCount: 0
        };

        this.sessionRuntime = runtime;
        await this.options.onSessionPersist?.(this.options.sessionManager.toPersisted(runtime));
        this.status = 'session-ready';

        console.log('[Middleware] ✅ SESSION ESTABLISHED - All 3 phases complete');
        console.log('[Middleware]    Status:', this.status);
        console.log('[Middleware]    Capabilities:', runtime.capabilities);

        return runtime;
    }

    async ensureSessionValid(): Promise<SessionRuntimeState> {
        const session = await this.ensureSession();
        const channel = this.channelRuntime!;

        if (isExpired(new Date(session.expiresAt.getTime() - 5 * 60 * 1000))) {
            const renewResult = await this.options.sessionManager.renewSession(channel, session, 30 * 60);
            const renewed: SessionRuntimeState = {
                sessionToken: renewResult.sessionToken,
                registrationId: session.registrationId,
                capabilities: renewResult.capabilities ?? session.capabilities,
                expiresAt: new Date(renewResult.expiresAt),
                nodeId: session.nodeId,
                requestWindowCount: session.requestWindowCount
            };

            this.sessionRuntime = renewed;
            await this.options.onSessionPersist?.(this.options.sessionManager.toPersisted(renewed));
            this.status = 'session-ready';
            return renewed;
        }

        this.status = 'session-ready';
        return session;
    }

    async invoke<TPayload extends Record<string, unknown>, TResponse>(options: InvokeOptions<TPayload>): Promise<TResponse> {
        const channel = await this.ensureChannel();
        const session = await this.ensureSessionValid();

        const response = await this.options.sessionManager.submitEncryptedPayload<TPayload, TResponse>(
            channel,
            session,
            options.path,
            options.method,
            options.payload
        );

        session.requestWindowCount = (session.requestWindowCount ?? 0) + 1;
        await this.options.onSessionPersist?.(this.options.sessionManager.toPersisted(session));

        this.status = 'session-ready';

        return response;
    }

    async revokeSession(): Promise<void> {
        if (!this.channelRuntime || !this.sessionRuntime) {
            return;
        }

        await this.options.sessionManager.revokeSession(this.channelRuntime, this.sessionRuntime);
        this.sessionRuntime = null;
        await this.options.onSessionPersist?.(null);
    }

    async reset(): Promise<void> {
        this.channelRuntime = null;
        this.sessionRuntime = null;
        this.status = 'idle';
        await Promise.all([
            this.options.onChannelPersist?.(null),
            this.options.onSessionPersist?.(null)
        ]);
    }
}
