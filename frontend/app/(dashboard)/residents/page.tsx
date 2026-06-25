// app/(dashboard)/residents/page.tsx
// Route: /residents

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Phone, Calendar, BadgeCheck } from 'lucide-react';
import { useResidents } from '@/app/hooks/useResidents';
import type { Resident } from '@/app/types';

function ResidentCard({ resident }: { resident: Resident }) {
  return (
    <Link href={`/residents/${resident.id}`}>
      <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer">
        {/* Avatar / KTP Photo */}
        <div className="flex items-start gap-4 mb-3">
          {resident.id_card_photo_url ? (
            <img
              src={resident.id_card_photo_url}
              alt="KTP"
              className="w-12 h-12 rounded-lg object-cover border"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <User size={22} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-neutral-700">{resident.full_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
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

        {/* Contact */}
        {resident.phone_number && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Phone size={13} />
            <span>{resident.phone_number}</span>
          </div>
        )}

        {/* Contract dates */}
        {resident.resident_type === 'contract' && resident.contract_end_date && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <Calendar size={13} />
            <span>Until {resident.contract_end_date}</span>
          </div>
        )}

        {/* Status */}
        <div className="mt-3 flex items-center gap-1">
          <BadgeCheck
            size={14}
            className={resident.is_active ? 'text-green-500' : 'text-gray-300'}
          />
          <span className={`text-xs ${resident.is_active ? 'text-green-600' : 'text-gray-400'}`}>
            {resident.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ResidentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useResidents({
    resident_type: typeFilter || undefined,
    is_active: true,
  });

  const residents = data?.data ?? [];

  // Client-side search filter
  const filtered = search
    ? residents.filter((r: Resident) =>
        r.full_name.toLowerCase().includes(search.toLowerCase()) ||
        r.phone_number?.includes(search)
      )
    : residents;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Residents</h1>
          <p className="text-gray-500">{residents.length} active residents</p>
        </div>
        {/* Resident creation is handled via Filament admin panel */}
        <a
          href={`${process.env.NEXT_PUBLIC_ADMIN_URL}/residents/create`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          + Add via Admin Panel
        </a>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 max-w-xs text-neutral-500"
        />
        <div className="flex gap-2">
          {['', 'permanent', 'contract'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
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
        <div className="text-center py-16 text-gray-400">
          <User size={40} className="mx-auto mb-2 opacity-30" />
          <p>No residents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((resident: Resident) => (
            <ResidentCard key={resident.id} resident={resident} />
          ))}
        </div>
      )}
    </div>
  );
}