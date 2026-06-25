// app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export default function LoginPage() {
  const { isAuthenticated, isLoading, initiateLogin } = useAuth();
  const router = useRouter();

  // Kalau sudah login, langsung ke dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RT Admin</h1>
          <p className="text-gray-500 mt-1 text-sm">Perumahan Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-gray-600 text-sm mb-6">
            Klik tombol di bawah untuk masuk menggunakan akun admin RT.
            Kamu akan diarahkan ke halaman login utama.
          </p>

          <button
            onClick={initiateLogin}
            className="w-full flex items-center justify-center gap-2 bg-blue-600
                       hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl
                       text-sm transition-colors"
          >
            <ExternalLink size={16} />
            Login dengan Akun RT Admin
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Login sekali — berlaku untuk dashboard dan panel admin
          </p>
        </div>
      </div>
    </div>
  );
}