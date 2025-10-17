/**
 * Authentication Context
 *
 * Provides global authentication state and methods for IRIS Desktop.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
    User,
    LoginCredentials,
    RegistrationData,
    PasswordResetRequest,
    PasswordResetConfirmation,
    SessionInfo,
    AuthState,
    AuthError
} from '@iris/domain';
import { authService } from '../services/auth/AuthService';

// ==================== Types ====================

interface AuthContextValue {
    // State
    user: User | null;
    authState: AuthState;
    error: AuthError | null;
    sessionInfo: SessionInfo | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegistrationData) => Promise<void>;
    requestPasswordReset: (request: PasswordResetRequest) => Promise<void>;
    confirmPasswordReset: (confirmation: PasswordResetConfirmation) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    refreshSession: () => Promise<void>;
    clearError: () => void;

    // Utilities
    isAuthenticated: boolean;
    hasPermission: (requiredRole: string) => boolean;
}

// ==================== Context ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
    SESSION_INFO: 'iris_session_info',
    REMEMBER_ME: 'iris_remember_me'
} as const;

// ==================== Provider ====================

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [authState, setAuthState] = useState<AuthState>('loading' as AuthState);
    const [error, setError] = useState<AuthError | null>(null);
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

    /**
     * Initialize authentication state from storage
     */
    useEffect(() => {
        initializeAuth();
    }, []);

    /**
     * Initialize authentication
     */
    const initializeAuth = useCallback(async () => {
        try {
            setAuthState('loading' as AuthState);

            // Check for stored session
            const storedSession = localStorage.getItem(STORAGE_KEYS.SESSION_INFO);
            if (!storedSession) {
                setAuthState('unauthenticated' as AuthState);
                return;
            }

            const session: SessionInfo = JSON.parse(storedSession);

            // Validate session
            const isValid = await authService.validateSession(session);
            if (!isValid) {
                // Session expired, clear storage
                clearStoredSession();
                setAuthState('unauthenticated' as AuthState);
                return;
            }

            // Restore user from session
            const currentUser = await authService.getCurrentUser(session.token);
            setUser(currentUser);
            setSessionInfo(session);
            setAuthState('authenticated' as AuthState);
        } catch (err) {
            console.error('[AuthContext] Failed to initialize auth:', err);
            clearStoredSession();
            setAuthState('unauthenticated' as AuthState);
        }
    }, []);

    /**
     * Login
     */
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setAuthState('loading' as AuthState);
            setError(null);

            const response = await authService.login(credentials);

            // Create session info
            const session: SessionInfo = {
                token: response.token,
                expiresAt: response.expiresAt,
                issuedAt: new Date(),
                rememberMe: credentials.rememberMe || false
            };

            // Store session
            localStorage.setItem(STORAGE_KEYS.SESSION_INFO, JSON.stringify(session));
            if (credentials.rememberMe) {
                localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
            }

            // Update state
            setUser(response.user);
            setSessionInfo(session);
            setAuthState('authenticated' as AuthState);
        } catch (err) {
            const authError = err as AuthError;
            setError(authError);
            setAuthState('error' as AuthState);
            throw authError;
        }
    }, []);

    /**
     * Logout
     */
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error('[AuthContext] Logout error:', err);
        } finally {
            // Clear state
            setUser(null);
            setSessionInfo(null);
            setAuthState('unauthenticated' as AuthState);
            clearStoredSession();
        }
    }, []);

    /**
     * Register
     */
    const register = useCallback(async (data: RegistrationData) => {
        try {
            setAuthState('loading' as AuthState);
            setError(null);

            const response = await authService.register(data);

            // Create session info
            const session: SessionInfo = {
                token: response.token,
                expiresAt: response.expiresAt,
                issuedAt: new Date(),
                rememberMe: false
            };

            // Store session
            localStorage.setItem(STORAGE_KEYS.SESSION_INFO, JSON.stringify(session));

            // Update state
            setUser(response.user);
            setSessionInfo(session);
            setAuthState('authenticated' as AuthState);
        } catch (err) {
            const authError = err as AuthError;
            setError(authError);
            setAuthState('error' as AuthState);
            throw authError;
        }
    }, []);

    /**
     * Request password reset
     */
    const requestPasswordReset = useCallback(async (request: PasswordResetRequest) => {
        try {
            setError(null);
            await authService.requestPasswordReset(request);
        } catch (err) {
            const authError = err as AuthError;
            setError(authError);
            throw authError;
        }
    }, []);

    /**
     * Confirm password reset
     */
    const confirmPasswordReset = useCallback(async (confirmation: PasswordResetConfirmation) => {
        try {
            setError(null);
            await authService.confirmPasswordReset(confirmation);
        } catch (err) {
            const authError = err as AuthError;
            setError(authError);
            throw authError;
        }
    }, []);

    /**
     * Update profile
     */
    const updateProfile = useCallback(async (updates: Partial<User>) => {
        if (!user) {
            throw new Error('No authenticated user');
        }

        try {
            setError(null);
            const updatedUser = await authService.updateProfile(user.id, updates);
            setUser(updatedUser);
        } catch (err) {
            const authError = err as AuthError;
            setError(authError);
            throw authError;
        }
    }, [user]);

    /**
     * Refresh session
     */
    const refreshSession = useCallback(async () => {
        if (!sessionInfo) {
            throw new Error('No active session');
        }

        try {
            const response = await authService.refreshToken(sessionInfo.token);

            // Update session info
            const newSession: SessionInfo = {
                token: response.token,
                expiresAt: response.expiresAt,
                issuedAt: new Date(),
                rememberMe: sessionInfo.rememberMe
            };

            // Store new session
            localStorage.setItem(STORAGE_KEYS.SESSION_INFO, JSON.stringify(newSession));

            // Update state
            setUser(response.user);
            setSessionInfo(newSession);
        } catch (err) {
            console.error('[AuthContext] Failed to refresh session:', err);
            await logout();
            throw err;
        }
    }, [sessionInfo, logout]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
        if (authState === 'error' as AuthState) {
            setAuthState(user ? 'authenticated' as AuthState : 'unauthenticated' as AuthState);
        }
    }, [authState, user]);

    /**
     * Check if user has permission
     */
    const hasPermission = useCallback((requiredRole: string) => {
        if (!user) return false;
        return authService.hasPermission(user, requiredRole as any);
    }, [user]);

    /**
     * Clear stored session
     */
    const clearStoredSession = () => {
        localStorage.removeItem(STORAGE_KEYS.SESSION_INFO);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    };

    // ==================== Context Value ====================

    const value: AuthContextValue = {
        // State
        user,
        authState,
        error,
        sessionInfo,

        // Actions
        login,
        logout,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        updateProfile,
        refreshSession,
        clearError,

        // Utilities
        isAuthenticated: authState === 'authenticated' as AuthState && user !== null,
        hasPermission
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==================== Hook ====================

/**
 * Use Auth Context Hook
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ==================== Export ====================

export type { AuthContextValue };
