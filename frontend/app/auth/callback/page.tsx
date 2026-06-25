'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { tokenStorage } from '@/app/lib/api';
import { authApi } from '@/app/lib/api';
import { useAuth } from '@/app/lib/auth-context';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const state = searchParams.get('state');

    if (!token) {
      router.replace('/login?error=no_token');
      return;
    }

    // Validasi state DULU sebelum simpan token
    const savedState = sessionStorage.getItem('sso_state');
    sessionStorage.removeItem('sso_state');

    if (!savedState || savedState !== state) {
      console.error('SSO state mismatch', { savedState, state });
      router.replace('/login?error=state_mismatch');
      return;
    }

    // Simpan token ke localStorage
    tokenStorage.set(token);

    // KUNCI: refresh AuthContext agar user terisi SEBELUM navigate ke /dashboard
    // Tanpa ini, AuthProvider sudah mount dengan user=null → AuthGuard redirect balik ke /login
    refreshUser()
      .then(() => {
        router.replace('/dashboard');
      })
      .catch(() => {
        tokenStorage.remove();
        router.replace('/login?error=invalid_token');
      });

  }, [router, searchParams, refreshUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent
                        rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Verifying your session...</p>
        <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}