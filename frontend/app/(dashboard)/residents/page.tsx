'use client';

// app/(dashboard)/residents/page.tsx
// Route: /residents

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Phone, Calendar, BadgeCheck, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useResidents, useDeleteResident } from '@/app/hooks/useResidents';
import { useQueryClient } from '@tanstack/react-query';
import type { Resident } from '@/app/types';

// ── Resident Card ─────────────────────────────────────────────────────────────
function ResidentCard({ resident, onDelete }: { resident: Resident; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5
                    hover:shadow-md transition-shadow group relative">

      {/* Edit / Delete — appear on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100
                      transition-opacity z-10">
        <Link
          href={`/residents/${resident.id}/edit`}
          onClick={e => e.stopPropagation()}
          className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm
                     hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <Pencil size={13} className="text-gray-400 hover:text-blue-600 transition-colors" />
        </Link>
        <button
          onClick={() => onDelete(resident.id)}
          className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm
                     hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          <Trash2 size={13} className="text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      <Link href={`/residents/${resident.id}`} className="block">

        {/* Avatar + name */}
        <div className="flex items-start gap-3 mb-4 pr-14">
          {resident.id_card_photo_url ? (
            <img
              src={resident.id_card_photo_url}
              alt="KTP"
              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center
                            justify-center shrink-0 border border-blue-100">
              <User size={20} className="text-blue-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 truncate text-sm tracking-tight">
              {resident.full_name}
            </p>
            {/* Type + married badges */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                resident.resident_type === 'permanent'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {resident.resident_type}
              </span>
              {resident.is_married && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold
                                 bg-slate-100 text-slate-600">
                  Married
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Phone */}
        {resident.phone_number && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Phone size={12} className="shrink-0" />
            <span className="font-mono">{resident.phone_number}</span>
          </div>
        )}

        {/* Contract end date */}
        {resident.resident_type === 'contract' && resident.contract_end_date && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Calendar size={12} className="shrink-0" />
            <span>Until {resident.contract_end_date}</span>
          </div>
        )}

        {/* Active status */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
          <BadgeCheck
            size={13}
            className={resident.is_active ? 'text-blue-500' : 'text-slate-300'}
          />
          <span className={`text-xs font-semibold ${
            resident.is_active ? 'text-blue-600' : 'text-slate-400'
          }`}>
            {resident.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResidentsPage() {
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const queryClient = useQueryClient();

  // ✅ FIX: Force refetch when the page mounts or becomes visible
  const { data, isLoading, refetch } = useResidents({ is_active: undefined });
  const deleteResident = useDeleteResident();

  // ✅ FIX: Refetch data when the page becomes visible (user returns from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  // ✅ FIX: Refetch when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  const residents = data?.data ?? [];
  const filtered  = residents.filter(r => {
    const matchType   = !typeFilter || r.resident_type === typeFilter;
    const matchSearch =
      !search ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone_number?.includes(search);
    return matchType && matchSearch;
  });

  const permanentCount = residents.filter(r => r.resident_type === 'permanent').length;
  const contractCount  = residents.filter(r => r.resident_type === 'contract').length;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resident? This action cannot be undone.')) return;
    try {
      await deleteResident.mutateAsync(id);
      // ✅ FIX: Invalidate and refetch after successful deletion
      await queryClient.invalidateQueries({ queryKey: ['residents'] });
      await refetch();
    } catch (error) {
      console.error('Failed to delete resident:', error);
    }
  };

  const types = [
    { value: '',          label: 'All',       count: residents.length },
    { value: 'permanent', label: 'Permanent', count: permanentCount   },
    { value: 'contract',  label: 'Contract',  count: contractCount    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Residents</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {residents.length} total &middot;{' '}
            <span className="text-blue-500 font-medium">{permanentCount} permanent</span>
            {' · '}
            <span className="text-amber-500 font-medium">{contractCount} contract</span>
          </p>
        </div>
        <Link
          href="/residents/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-lg text-sm font-medium
                     transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Resident
        </Link>
      </div>

      {/* ── Search + Filter ────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap items-center">
        {/* Search input with icon */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                       text-gray-300 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm
                       text-gray-700 placeholder-gray-300 w-64 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                       transition-colors"
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2">
          {types.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                typeFilter === value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                typeFilter === value
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-44 border border-slate-100
                                    animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="p-4 rounded-2xl bg-slate-100">
            <User size={28} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No residents found</p>
          <p className="text-xs text-gray-400">
            {search
              ? `No results for "${search}"`
              : typeFilter
              ? `No ${typeFilter} residents at this time`
              : 'Start by adding your first resident'
            }
          </p>
          {!search && !typeFilter && (
            <Link
              href="/residents/new"
              className="mt-1 inline-flex items-center gap-1.5 text-sm
                         text-blue-600 hover:underline font-medium"
            >
              <Plus size={14} /> Add the first resident
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(r => (
            <ResidentCard key={r.id} resident={r} onDelete={handleDelete} />
          ))}
        </div>
      )}

    </div>
  );
}