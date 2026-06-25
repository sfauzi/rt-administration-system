// components/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Tunggu sampai auth state selesai di-check (cek token di localStorage)
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Tampilkan loading spinner selama cek token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent
                          rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Belum authenticated — jangan render children, biarkan useEffect redirect
  if (!isAuthenticated) return null;

  return <>{children}</>;
}