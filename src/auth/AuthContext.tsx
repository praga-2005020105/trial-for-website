/**
 * @license
 * MY STICKERZ ENSEIGNE — Global Authentication Context & Provider
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AuthResponse, AuthSession, LoginData, OAuthProvider, SignUpData, User } from '../types/auth';
import { authService } from './authService';

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  login: (data: LoginData) => Promise<AuthResponse>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    try {
      const stored = authService.getStoredSession();
      if (stored && stored.user) {
        setSession(stored);
        setUser(stored.user);
      }
    } catch (err) {
      console.error('[AuthContext] Failed to restore session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(data);
      if (result.success && result.session) {
        setSession(result.session);
        setUser(result.session.user);
      } else if (!result.success) {
        setError(result.error || 'Failed to register account.');
      }
      return result;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'An unexpected registration error occurred.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(data);
      if (result.success && result.session) {
        setSession(result.session);
        setUser(result.session.user);
      } else if (!result.success) {
        setError(result.error || 'Invalid email or password.');
      }
      return result;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Login failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithOAuth = useCallback(async (provider: OAuthProvider): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.loginWithOAuth(provider);
      if (result.success && result.session) {
        setSession(result.session);
        setUser(result.session.user);
      } else if (!result.success) {
        setError(result.error || `Social login with ${provider} failed.`);
      }
      return result;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'OAuth error.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setSession(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResponse> => {
    setError(null);
    return await authService.requestPasswordReset(email);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAuthenticated: Boolean(user && session),
      isLoading,
      error,
      signUp,
      login,
      loginWithOAuth,
      logout,
      requestPasswordReset,
      clearError
    }),
    [user, session, isLoading, error, signUp, login, loginWithOAuth, logout, requestPasswordReset, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
