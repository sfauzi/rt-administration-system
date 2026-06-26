'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, CreditCard, TrendingDown,
  BarChart3, LogOut, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { AuthGuard } from '../components/AuthGuard';
import { useAuth } from '../lib/auth-context';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3  },
  { href: '/houses',    label: 'Houses',    icon: Home       },
  { href: '/residents', label: 'Residents', icon: Users      },
  { href: '/payments',  label: 'Payments',  icon: CreditCard },
  { href: '/expenses',  label: 'Expenses',  icon: TrendingDown },
  { href: '/reports',   label: 'Reports',   icon: BarChart3  },
];

function Sidebar() {
  const pathname    = usePathname();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">RT Admin</h1>
            <p className="text-xs text-gray-400">Perumahan System</p>
          </div>
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-300
                      px-3 pb-2 pt-1">
          Menu
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                          font-medium transition-colors
                          ${isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-500 hover:bg-slate-50 hover:text-gray-800'
                          }`}
            >
              <Icon
                size={16}
                className={isActive ? 'text-blue-600' : 'text-gray-400'}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight size={13} className="text-blue-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User + Logout ─────────────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-1">

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-600">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm
                     font-medium text-gray-500 hover:bg-red-50 hover:text-red-600
                     transition-colors disabled:opacity-50"
        >
          <LogOut size={15} className="shrink-0" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}