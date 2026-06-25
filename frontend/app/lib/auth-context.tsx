'use client';

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from 'react';
import { authApi, tokenStorage } from './api';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initiateLogin: () => void;
  logout: () => Promise<void>;
  // Dipakai oleh /auth/callback setelah token disimpan
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function generateState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cek token saat pertama mount
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        // Token tidak valid — bersihkan
        tokenStorage.remove();
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Dipanggil oleh /auth/callback setelah token disimpan ke localStorage
  const refreshUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) return;
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      tokenStorage.remove();
      setUser(null);
    }
  }, []);

  const initiateLogin = useCallback(() => {
    const state = generateState();
    sessionStorage.setItem('sso_state', state);

    const backendUrl  = process.env.NEXT_PUBLIC_BACKEND_URL;
    const callbackUrl = `${window.location.origin}/auth/callback`;

    const params = new URLSearchParams({
      redirect_uri: callbackUrl,
      state,
    });

    window.location.href = `${backendUrl}/admin/sso/authorize?${params}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.remove();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      initiateLogin,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}