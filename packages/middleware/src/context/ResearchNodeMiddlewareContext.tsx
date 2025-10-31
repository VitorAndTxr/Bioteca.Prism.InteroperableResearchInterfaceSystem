import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { ChannelManager } from '../channel/ChannelManager';
import { SessionManager } from '../session/SessionManager';
import { FetchHttpClient } from '../http/HttpClient';
import type { HttpClient } from '../http/HttpClient';
import { WebCryptoDriver } from '../crypto/CryptoDriver';
import type { CryptoDriver } from '../crypto/CryptoDriver';
import { ResearchNodeMiddleware } from '../service/ResearchNodeMiddleware';
import type { InvokeOptions, ResearchNodeMiddlewareOptions } from '../service/ResearchNodeMiddleware';
import type {
    ChannelRuntimeState,
    MiddlewareStatus,
    PersistedChannelState,
    PersistedSessionState,
    ResearchNodeCertificateConfig,
    ResearchNodeMiddlewareState,
    SessionRuntimeState
} from '../types';
import type { SecureStorage } from '../storage/SecureStorage';
import { withKeyPrefix } from '../storage/SecureStorage';

interface StorageKeyOptions {
    channel?: string;
    session?: string;
}

export interface ResearchNodeMiddlewareProviderProps {
    children: React.ReactNode;
    storage: SecureStorage;
    storageKeyPrefix?: string;
    storageKeys?: StorageKeyOptions;
    baseUrl?: string;
    defaultHeaders?: Record<string, string>;
    httpClient?: HttpClient;
    cryptoDriver?: CryptoDriver;
    channelManager?: ChannelManager;
    sessionManager?: SessionManager;
    certificateConfig?: ResearchNodeCertificateConfig;
    nodeId?: string;
    prepareIdentifyPayload?: ResearchNodeMiddlewareOptions['prepareIdentifyPayload'];
    signChallenge?: ResearchNodeMiddlewareOptions['signChallenge'];
    middlewareFactory?: (options: ResearchNodeMiddlewareOptions) => ResearchNodeMiddleware;
    autoHydrate?: boolean;
}

export interface ResearchNodeMiddlewareContextValue {
    state: ResearchNodeMiddlewareState;
    status: MiddlewareStatus;
    hydrated: boolean;
    isReady: boolean;
    missingDependencies: string[];
    ensureChannel: () => Promise<ChannelRuntimeState>;
    ensureSession: () => Promise<SessionRuntimeState>;
    ensureSessionValid: () => Promise<SessionRuntimeState>;
    invoke: <TPayload extends Record<string, unknown>, TResponse>(options: InvokeOptions<TPayload>) => Promise<TResponse>;
    hydrate: () => Promise<void>;
    resetRuntime: () => Promise<void>;
    clearPersistedState: () => Promise<void>;
    revokeSession: () => Promise<void>;
    middleware: ResearchNodeMiddleware | null;
}

const DEFAULT_STORAGE_KEYS: Required<StorageKeyOptions> = {
    channel: 'research-node:channel',
    session: 'research-node:session'
};

const ResearchNodeMiddlewareContext = createContext<ResearchNodeMiddlewareContextValue | undefined>(undefined);

type MutablePersistedState = {
    channel: PersistedChannelState | null;
    session: PersistedSessionState | null;
};

function asError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error(typeof error === 'string' ? error : JSON.stringify(error));
}

function resolveBaseUrl(explicit?: string): string | undefined {
    if (explicit) {
        return explicit;
    }

    const processEnv = typeof process !== 'undefined' ? process.env : undefined;
    if (processEnv) {
        const candidate =
            processEnv.IRN_MIDDLEWARE_BASE_URL ??
            processEnv.IRN_API_BASE_URL ??
            processEnv.EXPO_PUBLIC_IRN_MIDDLEWARE_BASE_URL ??
            processEnv.EXPO_PUBLIC_IRN_API_URL ??
            processEnv.EXPO_PUBLIC_API_URL ??
            processEnv.API_URL ??
            processEnv.VITE_IRN_MIDDLEWARE_BASE_URL ??
            processEnv.VITE_IRN_API_URL ??
            processEnv.VITE_API_URL;

        if (candidate) {
            return candidate;
        }
    }

    const globalEnv = typeof globalThis !== 'undefined' ? (globalThis as Record<string, unknown>) : undefined;
    if (globalEnv) {
        const candidate =
            (globalEnv.IRN_MIDDLEWARE_BASE_URL as string | undefined) ??
            (globalEnv.IRN_API_BASE_URL as string | undefined) ??
            (globalEnv.__IRN_MIDDLEWARE_BASE_URL as string | undefined) ??
            (globalEnv.__IRN_API_BASE_URL as string | undefined) ??
            (globalEnv.__IRIS_API_BASE_URL as string | undefined);

        if (candidate) {
            return candidate;
        }
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }

    return undefined;
}

export function useResearchNodeMiddleware(): ResearchNodeMiddlewareContextValue {
    const context = useContext(ResearchNodeMiddlewareContext);
    if (!context) {
        throw new Error('useResearchNodeMiddleware must be used within a ResearchNodeMiddlewareProvider.');
    }

    return context;
}

export function ResearchNodeMiddlewareProvider({
    children,
    storage,
    storageKeyPrefix,
    storageKeys,
    baseUrl,
    defaultHeaders,
    httpClient,
    cryptoDriver,
    channelManager,
    sessionManager,
    certificateConfig,
    nodeId,
    prepareIdentifyPayload,
    signChallenge,
    middlewareFactory,
    autoHydrate = true
}: ResearchNodeMiddlewareProviderProps): JSX.Element {
    const scopedStorage = useMemo(
        () => (storageKeyPrefix ? withKeyPrefix(storage, storageKeyPrefix) : storage),
        [storage, storageKeyPrefix]
    );

    const channelStorageKey = storageKeys?.channel ?? DEFAULT_STORAGE_KEYS.channel;
    const sessionStorageKey = storageKeys?.session ?? DEFAULT_STORAGE_KEYS.session;

    const [state, setState] = useState<ResearchNodeMiddlewareState>({
        hydrated: false,
        channel: null,
        session: null,
        status: 'idle',
        channelRuntime: null,
        sessionRuntime: null,
        lastError: undefined
    });

    const [persistedLoaded, setPersistedLoaded] = useState(false);

    const isMountedRef = useRef(true);
    useEffect(() => () => {
        isMountedRef.current = false;
    }, []);

    const safeSetState = useCallback((updater: (prev: ResearchNodeMiddlewareState) => ResearchNodeMiddlewareState) => {
        if (!isMountedRef.current) {
            return;
        }
        setState(updater);
    }, []);

    const persistedRef = useRef<MutablePersistedState>({ channel: null, session: null });
    const middlewareRef = useRef<ResearchNodeMiddleware | null>(null);
    const missingDependenciesRef = useRef<string[]>([]);
    const signChallengeRef = useRef<ResearchNodeMiddlewareOptions['signChallenge'] | undefined>(signChallenge);

    useEffect(() => {
        signChallengeRef.current = signChallenge;
    }, [signChallenge]);

    const signChallengeWrapper = useCallback<ResearchNodeMiddlewareOptions['signChallenge']>(async (context) => {
        const implementation = signChallengeRef.current;
        if (!implementation) {
            throw new Error('ResearchNodeMiddlewareProvider requires a signChallenge implementation.');
        }

        return implementation(context);
    }, []);

    const resolvedBaseUrl = useMemo(() => resolveBaseUrl(baseUrl), [baseUrl]);

    const resolvedHttpClient = useMemo<HttpClient | null>(() => {
        if (httpClient) {
            return httpClient;
        }

        const candidate = resolvedBaseUrl ?? '';
        return new FetchHttpClient(candidate, defaultHeaders);
    }, [defaultHeaders, httpClient, resolvedBaseUrl]);

    const resolvedCryptoDriver = useMemo<CryptoDriver | null>(() => {
        if (cryptoDriver) {
            return cryptoDriver;
        }

        try {
            return new WebCryptoDriver();
        } catch (error) {
            console.warn('[ResearchNodeMiddlewareProvider] Failed to create WebCryptoDriver.', error);
            return null;
        }
    }, [cryptoDriver]);

    const resolvedChannelManager = useMemo<ChannelManager | null>(() => {
        if (channelManager) {
            return channelManager;
        }

        if (!resolvedHttpClient || !resolvedCryptoDriver) {
            return null;
        }

        return new ChannelManager(resolvedHttpClient, resolvedCryptoDriver);
    }, [channelManager, resolvedHttpClient, resolvedCryptoDriver]);

    const resolvedSessionManager = useMemo<SessionManager | null>(() => {
        if (sessionManager) {
            return sessionManager;
        }

        if (!resolvedHttpClient || !resolvedCryptoDriver) {
            return null;
        }

        return new SessionManager(resolvedHttpClient, resolvedCryptoDriver);
    }, [resolvedHttpClient, resolvedCryptoDriver, sessionManager]);

    const missingDependencies = useMemo(() => {
        const missing: string[] = [];

        if (!resolvedChannelManager) {
            missing.push('channelManager');
            if (!channelManager && !resolvedHttpClient) {
                missing.push('httpClient');
            }
            if (!channelManager && !resolvedCryptoDriver) {
                missing.push('cryptoDriver');
            }
        }

        if (!resolvedSessionManager) {
            missing.push('sessionManager');
            if (!sessionManager && !resolvedHttpClient) {
                missing.push('httpClient');
            }
            if (!sessionManager && !resolvedCryptoDriver) {
                missing.push('cryptoDriver');
            }
        }

        if (!certificateConfig) {
            missing.push('certificateConfig');
        }

        if (!signChallengeRef.current) {
            missing.push('signChallenge');
        }

        return Array.from(new Set(missing));
    }, [certificateConfig, channelManager, resolvedChannelManager, resolvedCryptoDriver, resolvedHttpClient, resolvedSessionManager, sessionManager, signChallenge]);

    useEffect(() => {
        missingDependenciesRef.current = missingDependencies;
    }, [missingDependencies]);

    useEffect(() => {
        let cancelled = false;

        async function loadPersistedState(): Promise<void> {
            try {
                const [storedChannel, storedSession] = await Promise.all([
                    scopedStorage.getItem<PersistedChannelState>(channelStorageKey),
                    scopedStorage.getItem<PersistedSessionState>(sessionStorageKey)
                ]);

                if (cancelled) {
                    return;
                }

                persistedRef.current = {
                    channel: storedChannel ?? null,
                    session: storedSession ?? null
                };

                safeSetState((prev) => ({
                    ...prev,
                    channel: storedChannel ?? null,
                    session: storedSession ?? null
                }));
            } catch (error) {
                if (cancelled) {
                    return;
                }

                const err = asError(error);
                console.warn('[ResearchNodeMiddlewareProvider] Failed to load persisted state.', err);
                safeSetState((prev) => ({
                    ...prev,
                    lastError: err
                }));
            } finally {
                if (!cancelled) {
                    setPersistedLoaded(true);
                }
            }
        }

        loadPersistedState();

        return () => {
            cancelled = true;
        };
    }, [channelStorageKey, safeSetState, scopedStorage, sessionStorageKey]);

    const applyRuntimeSnapshot = useCallback(() => {
        const instance = middlewareRef.current;
        safeSetState((prev) => ({
            ...prev,
            status: instance ? instance.currentStatus : 'idle',
            channelRuntime: instance?.channel ?? null,
            sessionRuntime: instance?.session ?? null
        }));
    }, [safeSetState]);

    const persistChannel = useCallback(async (next: PersistedChannelState | null) => {
        try {
            if (next) {
                await scopedStorage.setItem(channelStorageKey, next);
            } else {
                await scopedStorage.removeItem(channelStorageKey);
            }

            persistedRef.current.channel = next;
            safeSetState((prev) => ({
                ...prev,
                channel: next
            }));
            applyRuntimeSnapshot();
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            throw err;
        }
    }, [applyRuntimeSnapshot, channelStorageKey, safeSetState, scopedStorage]);

    const persistSession = useCallback(async (next: PersistedSessionState | null) => {
        try {
            if (next) {
                await scopedStorage.setItem(sessionStorageKey, next);
            } else {
                await scopedStorage.removeItem(sessionStorageKey);
            }

            persistedRef.current.session = next;
            safeSetState((prev) => ({
                ...prev,
                session: next
            }));
            applyRuntimeSnapshot();
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            throw err;
        }
    }, [applyRuntimeSnapshot, safeSetState, scopedStorage, sessionStorageKey]);

    const runHydration = useCallback(async (instance: ResearchNodeMiddleware) => {
        try {
            await instance.hydrate();
            applyRuntimeSnapshot();
            safeSetState((prev) => ({
                ...prev,
                hydrated: true,
                lastError: undefined
            }));
        } catch (error) {
            const err = asError(error);
            console.warn('[ResearchNodeMiddlewareProvider] Hydration failed.', err);
            applyRuntimeSnapshot();
            safeSetState((prev) => ({
                ...prev,
                hydrated: true,
                lastError: err
            }));
            throw err;
        }
    }, [applyRuntimeSnapshot, safeSetState]);

    useEffect(() => {
        if (!persistedLoaded) {
            return;
        }

        if (!resolvedChannelManager || !resolvedSessionManager || !certificateConfig) {
            middlewareRef.current = null;
            safeSetState((prev) => ({
                ...prev,
                hydrated: false
            }));
            applyRuntimeSnapshot();
            return;
        }

        const options: ResearchNodeMiddlewareOptions = {
            channelManager: resolvedChannelManager,
            sessionManager: resolvedSessionManager,
            certificate: certificateConfig,
            nodeId,
            prepareIdentifyPayload,
            initialChannel: persistedRef.current.channel,
            initialSession: persistedRef.current.session,
            onChannelPersist: persistChannel,
            onSessionPersist: persistSession,
            signChallenge: signChallengeWrapper
        };

        let instance: ResearchNodeMiddleware;

        try {
            instance = middlewareFactory ? middlewareFactory(options) : new ResearchNodeMiddleware(options);
        } catch (error) {
            const err = asError(error);
            middlewareRef.current = null;
            safeSetState((prev) => ({
                ...prev,
                hydrated: false,
                lastError: err,
                status: 'error'
            }));
            return;
        }

        middlewareRef.current = instance;
        safeSetState((prev) => ({
            ...prev,
            hydrated: false,
            lastError: undefined
        }));
        applyRuntimeSnapshot();

        if (!autoHydrate) {
            return () => {
                if (middlewareRef.current === instance) {
                    middlewareRef.current = null;
                }
            };
        }

        runHydration(instance).catch(() => {
            // Error already handled inside runHydration
        });

        return () => {
            if (middlewareRef.current === instance) {
                middlewareRef.current = null;
            }
        };
    }, [
        applyRuntimeSnapshot,
        autoHydrate,
        certificateConfig,
        middlewareFactory,
        nodeId,
        persistChannel,
        persistSession,
        persistedLoaded,
        prepareIdentifyPayload,
        resolvedChannelManager,
        resolvedSessionManager,
        runHydration,
        safeSetState,
        signChallengeWrapper
    ]);

    const requireMiddleware = useCallback(() => {
        const instance = middlewareRef.current;
        if (!instance) {
            const missing = missingDependenciesRef.current;
            const details = missing.length > 0 ? ` Missing dependencies: ${missing.join(', ')}.` : '';
            throw new Error(`ResearchNodeMiddleware is not ready.${details}`);
        }

        return instance;
    }, []);

    const hydrate = useCallback(async () => {
        const instance = requireMiddleware();
        await runHydration(instance);
    }, [requireMiddleware, runHydration]);

    const ensureChannel = useCallback(async () => {
        const instance = requireMiddleware();
        safeSetState((prev) => ({
            ...prev,
            lastError: undefined
        }));
        try {
            const runtime = await instance.ensureChannel();
            applyRuntimeSnapshot();
            return runtime;
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            applyRuntimeSnapshot();
            throw err;
        }
    }, [applyRuntimeSnapshot, requireMiddleware, safeSetState]);

    const ensureSession = useCallback(async () => {
        if (!signChallengeRef.current) {
            const err = new Error('ResearchNodeMiddlewareProvider requires signChallenge to ensure a session.');
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            throw err;
        }

        const instance = requireMiddleware();
        safeSetState((prev) => ({
            ...prev,
            lastError: undefined
        }));
        try {
            const runtime = await instance.ensureSession();
            applyRuntimeSnapshot();
            return runtime;
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            applyRuntimeSnapshot();
            throw err;
        }
    }, [applyRuntimeSnapshot, requireMiddleware, safeSetState]);

    const ensureSessionValid = useCallback(async () => {
        if (!signChallengeRef.current) {
            const err = new Error('ResearchNodeMiddlewareProvider requires signChallenge to validate a session.');
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            throw err;
        }

        const instance = requireMiddleware();
        safeSetState((prev) => ({
            ...prev,
            lastError: undefined
        }));
        try {
            const runtime = await instance.ensureSessionValid();
            applyRuntimeSnapshot();
            return runtime;
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            applyRuntimeSnapshot();
            throw err;
        }
    }, [applyRuntimeSnapshot, requireMiddleware, safeSetState]);

    const invoke = useCallback(async <TPayload extends Record<string, unknown>, TResponse>(options: InvokeOptions<TPayload>): Promise<TResponse> => {
        if (!signChallengeRef.current) {
            const err = new Error('ResearchNodeMiddlewareProvider requires signChallenge to invoke requests.');
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            throw err;
        }

        const instance = requireMiddleware();
        safeSetState((prev) => ({
            ...prev,
            lastError: undefined
        }));
        try {
            const response = await instance.invoke<TPayload, TResponse>(options);
            applyRuntimeSnapshot();
            return response;
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            applyRuntimeSnapshot();
            throw err;
        }
    }, [applyRuntimeSnapshot, requireMiddleware, safeSetState]);

    const revokeSession = useCallback(async () => {
        const instance = requireMiddleware();
        safeSetState((prev) => ({
            ...prev,
            lastError: undefined
        }));
        try {
            await instance.revokeSession();
            applyRuntimeSnapshot();
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            applyRuntimeSnapshot();
            throw err;
        }
    }, [applyRuntimeSnapshot, requireMiddleware, safeSetState]);

    const resetRuntime = useCallback(async () => {
        const instance = requireMiddleware();
        safeSetState((prev) => ({
            ...prev,
            lastError: undefined
        }));
        try {
            await instance.reset();
            persistedRef.current = { channel: null, session: null };
            safeSetState((prev) => ({
                ...prev,
                channel: null,
                session: null,
                hydrated: false
            }));
            applyRuntimeSnapshot();
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            applyRuntimeSnapshot();
            throw err;
        }
    }, [applyRuntimeSnapshot, requireMiddleware, safeSetState]);

    const clearPersistedState = useCallback(async () => {
        safeSetState((prev) => ({
            ...prev,
            lastError: undefined
        }));
        try {
            await scopedStorage.removeItem(channelStorageKey);
            await scopedStorage.removeItem(sessionStorageKey);
            persistedRef.current = { channel: null, session: null };
            safeSetState((prev) => ({
                ...prev,
                channel: null,
                session: null
            }));
            applyRuntimeSnapshot();
        } catch (error) {
            const err = asError(error);
            safeSetState((prev) => ({
                ...prev,
                lastError: err
            }));
            throw err;
        }
    }, [applyRuntimeSnapshot, channelStorageKey, safeSetState, scopedStorage, sessionStorageKey]);

    const contextValue = useMemo<ResearchNodeMiddlewareContextValue>(() => ({
        state,
        status: state.status,
        hydrated: state.hydrated,
        isReady: Boolean(middlewareRef.current),
        missingDependencies: missingDependenciesRef.current.slice(),
        ensureChannel,
        ensureSession,
        ensureSessionValid,
        invoke,
        hydrate,
        resetRuntime,
        clearPersistedState,
        revokeSession,
        middleware: middlewareRef.current
    }), [
        clearPersistedState,
        ensureChannel,
        ensureSession,
        ensureSessionValid,
        hydrate,
        invoke,
        resetRuntime,
        revokeSession,
        state
    ]);

    return (
        <ResearchNodeMiddlewareContext.Provider value={contextValue}>
            {children}
        </ResearchNodeMiddlewareContext.Provider>
    );
}
