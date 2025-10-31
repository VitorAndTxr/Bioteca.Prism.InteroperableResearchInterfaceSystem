export interface PersistedChannelState {
    channelId: string;
    /** Base64 encoded representation of the symmetric key used to decrypt payloads */
    symmetricKey?: string;
    /** ISO8601 string representing expiration */
    expiresAt: string;
    /** Additional metadata captured during channel negotiation */
    metadata?: Record<string, unknown>;
}

export interface PersistedSessionState {
    sessionToken: string;
    registrationId: string;
    /** Optional protocol-level identifier returned by the IRN */
    nodeId?: string;
    /** Capability list returned by Phase 3/4 */
    capabilities: string[];
    /** ISO8601 string representing expiration */
    expiresAt: string;
    /** Optional metrics for rate limiting */
    requestWindowCount?: number;
}

export interface ResearchNodeMiddlewareState {
    hydrated: boolean;
    channel: PersistedChannelState | null;
    session: PersistedSessionState | null;
    status: MiddlewareStatus;
    channelRuntime?: ChannelRuntimeState | null;
    sessionRuntime?: SessionRuntimeState | null;
    lastError?: Error;
}

export interface ResearchNodeCertificateConfig {
    subjectName: string;
    certificate: string;
    certificateWithPrivateKey: string;
    password: string;
    validFrom: string;
    validTo: string;
    thumbprint: string;
    serialNumber: string;
}

export interface EncryptedPayload {
    encryptedData: string;
    iv: string;
    authTag: string;
}

export type MiddlewareStatus =
    | 'idle'
    | 'negotiating-channel'
    | 'channel-ready'
    | 'identifying-node'
    | 'authenticating-node'
    | 'session-ready'
    | 'error';

export interface ChannelRuntimeState {
    channelId: string;
    symmetricKey: string;
    expiresAt: Date;
    cryptoKey: CryptoKey;
    metadata?: Record<string, unknown>;
}

export interface SessionRuntimeState {
    sessionToken: string;
    registrationId: string;
    capabilities: string[];
    expiresAt: Date;
    nodeId?: string;
    requestWindowCount?: number;
}

export interface ChannelOpenResponse {
    channelId: string;
    serverPublicKey: string;
    expiresAt: Date;
}

export interface NodeIdentifyPayload {
    channelId: string;
    nodeId: string;
    certificate: string;
    timestamp: string;
    signature?: string;
}

export interface NodeIdentifyResult {
    isKnown: boolean;
    status: string;
    nodeId: string;
    registrationId?: string;
    message?: string;
}

export interface ChallengeRequestPayload {
    channelId: string;
    nodeId: string;
    timestamp: string;
}

export interface ChallengeResponsePayload {
    channelId: string;
    nodeId: string;
    challengeData: string;
    timestamp: string;
}

export interface AuthenticationPayload {
    channelId: string;
    nodeId: string;
    challengeData: string;
    signature: string;
    timestamp: string;
}

export interface AuthenticationResult {
    authenticated: boolean;
    sessionToken: string;
    sessionExpiresAt: string;
    capabilities: string[];
    registrationId: string;
    nodeId: string;
}

export interface ChallengeResponseResult {
    challengeData: string;
    challengeTimestamp: string;
    challengeTtlSeconds: number;
    expiresAt: string;
}

export interface SessionWhoAmIResult {
    sessionToken: string;
    nodeId: string;
    channelId: string;
    expiresAt: string;
    remainingSeconds: number;
    capabilities: string[];
    requestCount?: number;
}

export interface SessionRenewResult {
    sessionToken: string;
    nodeId: string;
    expiresAt: string;
    remainingSeconds: number;
    capabilities?: string[];
    message?: string;
}
