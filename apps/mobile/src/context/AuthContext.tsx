/**
 * Authentication Context
 *
 * Provides authentication state and operations for the mobile app.
 * Uses the pre-configured middleware service from services/middleware.ts
 *
 * Features:
 * - Login with username/password
 * - Automatic token refresh
 * - Secure token storage
 * - Session validation on mount
 * - Logout with session revocation
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, FC } from 'react';
import type { LoginCredentials, User, AuthToken } from '@iris/middleware';
import type { Researcher, PaginatedResponse } from '@iris/domain';
import { authService, middleware, initializeAndHydrate } from '@/services/middleware';

interface AuthContextValue {
  user: User | null;
  researcher: Researcher | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// ── Researcher DTO (internal — not exported) ────────────────

interface ResearcherDTO {
  ResearcherId: string;
  ResearchNodeId: string;
  Name: string;
  Email: string;
  Institution: string;
  Role: string;
  Orcid: string;
}

function convertToResearcher(dto: ResearcherDTO): Researcher {
  return {
    researcherId: dto.ResearcherId,
    researchNodeId: dto.ResearchNodeId,
    name: dto.Name,
    email: dto.Email,
    institution: dto.Institution,
    role: dto.Role.toLowerCase().includes('chief') ? 'chief_researcher' : 'researcher',
    orcid: dto.Orcid,
  } as Researcher;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth service on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[AuthContext] Initializing authentication...');

        // Initialize and hydrate middleware from storage
        await initializeAndHydrate();

        // Check if already authenticated
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          console.log('[AuthContext] User already authenticated:', currentUser.username);
        }

        console.log('[AuthContext] Authentication initialized successfully');
      } catch (err) {
        console.error('[AuthContext] Failed to initialize auth:', err);
        setError('Failed to initialize authentication system');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthContext] Attempting login for:', email);

      const credentials: LoginCredentials = {
        username: email,
        password,
      };

      const token: AuthToken = await authService.login(credentials);

      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      console.log('[AuthContext] Login successful:', currentUser.username);
      console.log('[AuthContext] Token expires at:', token.expiresAt);

      // Fetch researcher profile (silent — don't block login flow)
      try {
        const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<ResearcherDTO>>({
          path: '/api/Researcher/GetResearchers?page=1&pageSize=100',
          method: 'GET',
          payload: {},
        });
        const researchers = response.data ?? [];
        const match = researchers.find((r) => r.Email === email);
        if (match) {
          setResearcher(convertToResearcher(match));
          console.log('[AuthContext] Researcher profile loaded:', match.Name);
        } else {
          console.log('[AuthContext] No researcher profile found for:', email);
        }
      } catch (profileErr) {
        console.warn('[AuthContext] Failed to fetch researcher profile:', profileErr);
      }
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);

      const errorMessage = err instanceof Error ? err.message : 'Login failed';

      // Provide user-friendly error messages
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        setError('Invalid email or password');
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[AuthContext] Logging out...');
      await authService.logout();
      setUser(null);
      setResearcher(null);
      console.log('[AuthContext] Logout successful');
    } catch (err) {
      console.error('[AuthContext] Logout failed:', err);
      // Even if logout fails on server, clear local state
      setUser(null);
      setResearcher(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    researcher,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
