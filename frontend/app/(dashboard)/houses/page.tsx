'use client';

// app/(dashboard)/houses/page.tsx
// Route: /houses

import { useState } from 'react';
import Link from 'next/link';
import { Home, Plus } from 'lucide-react';
import { useHouses } from '@/app/hooks/useHouses';
import { HouseCard } from '@/app/components/houses/HouseCard';

export default function HousesPage() {
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useHouses();

  const houses        = data?.data ?? [];
  const occupiedCount = houses.filter(h => h.occupancy_status === 'occupied').length;
  const vacantCount   = houses.filter(h => h.occupancy_status === 'vacant').length;

  const filtered = filter
    ? houses.filter(h => h.occupancy_status === filter)
    : houses;

  const filters = [
    { value: '',         label: 'All',      count: houses.length  },
    { value: 'occupied', label: 'Occupied', count: occupiedCount  },
    { value: 'vacant',   label: 'Vacant',   count: vacantCount    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Houses</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {houses.length} total &middot;{' '}
            <span className="text-blue-500 font-medium">{occupiedCount} occupied</span>
            {' · '}
            <span className="text-gray-400">{vacantCount} vacant</span>
          </p>
        </div>
        <Link
          href="/houses/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-lg text-sm font-medium
                     transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add House
        </Link>
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {filters.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              filter === value
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-44 border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="p-4 rounded-2xl bg-slate-100">
            <Home size={28} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No houses found</p>
          <p className="text-xs text-gray-400">
            {filter
              ? `No ${filter} houses at this time`
              : 'Start by adding your first house'
            }
          </p>
          {!filter && (
            <Link
              href="/houses/new"
              className="mt-1 inline-flex items-center gap-1.5 text-sm
                         text-blue-600 hover:underline font-medium"
            >
              <Plus size={14} /> Add the first house
            </Link>
          )}
        </div>
      ) : (
        <div
          key={filter}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {filtered.map(house => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      )}

    </div>
  );
}