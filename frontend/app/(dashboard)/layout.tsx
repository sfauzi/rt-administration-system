// app/(dashboard)/layout.tsx

import Link from 'next/link';
import {
  Home, Users, CreditCard, TrendingDown, BarChart3, Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/houses', label: 'Houses', icon: Home },
  { href: '/residents', label: 'Residents', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/expenses', label: 'Expenses', icon: TrendingDown },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">RT Admin</h1>
          <p className="text-sm text-gray-500">Perumahan Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600
                         hover:bg-gray-100 hover:text-gray-900 transition-colors
                         [&.active]:bg-blue-50 [&.active]:text-blue-700"
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}