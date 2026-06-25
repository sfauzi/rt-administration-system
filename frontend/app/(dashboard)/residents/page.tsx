'use client';

// app/(dashboard)/residents/page.tsx
// Route: /residents
// UPDATE dari Part 2 — tambah tombol Add + Edit button di card

import { useState } from 'react';
import Link from 'next/link';
import { User, Phone, Calendar, BadgeCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { useResidents, useDeleteResident } from '@/app/hooks/useResidents';
import type { Resident } from '@/app/types';

function ResidentCard({ resident, onDelete }: { resident: Resident; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md
                    transition-shadow group relative">
      {/* Edit / Delete quick actions — appear on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/residents/${resident.id}/edit`}
          className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-blue-50
                     hover:border-blue-300 transition-colors"
        >
          <Pencil size={13} className="text-gray-500 hover:text-blue-600" />
        </Link>
        <button
          onClick={() => onDelete(resident.id)}
          className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-red-50
                     hover:border-red-300 transition-colors"
        >
          <Trash2 size={13} className="text-gray-500 hover:text-red-500" />
        </button>
      </div>

      <Link href={`/residents/${resident.id}`} className="block">
        {/* Avatar / KTP photo */}
        <div className="flex items-start gap-4 mb-3">
          {resident.id_card_photo_url ? (
            <img
              src={resident.id_card_photo_url}
              alt="KTP"
              className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <User size={22} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0 pr-12">
            <p className="font-semibold text-gray-900 truncate">{resident.full_name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                resident.resident_type === 'permanent'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {resident.resident_type}
              </span>
              {resident.is_married && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  Married
                </span>
              )}
            </div>
          </div>
        </div>

        {resident.phone_number && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <Phone size={13} />
            <span>{resident.phone_number}</span>
          </div>
        )}

        {resident.resident_type === 'contract' && resident.contract_end_date && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
            <Calendar size={13} />
            <span>Until {resident.contract_end_date}</span>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1">
          <BadgeCheck size={14} className={resident.is_active ? 'text-green-500' : 'text-gray-300'} />
          <span className={`text-xs ${resident.is_active ? 'text-green-600' : 'text-gray-400'}`}>
            {resident.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function ResidentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useResidents({ is_active: undefined });
  const deleteResident = useDeleteResident();

  const residents = data?.data ?? [];
  const filtered = residents.filter(r => {
    const matchType = !typeFilter || r.resident_type === typeFilter;
    const matchSearch =
      !search ||
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone_number?.includes(search);
    return matchType && matchSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resident? This action cannot be undone.')) return;
    await deleteResident.mutateAsync(id);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
          <p className="text-gray-500 text-sm">{residents.length} total residents</p>
        </div>
        <Link
          href="/residents/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Resident
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-neutral-500"
        />
        <div className="flex gap-2">
          {['', 'permanent', 'contract'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                typeFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type === '' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <User size={40} className="mx-auto mb-2 opacity-30" />
          <p className="font-medium">No residents found</p>
          {!search && !typeFilter && (
            <Link
              href="/residents/new"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
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