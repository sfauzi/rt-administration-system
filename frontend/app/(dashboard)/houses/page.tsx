// app/(dashboard)/houses/page.tsx
// Route: /houses

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, User, Plus } from 'lucide-react';
import { useHouses } from '@/app/hooks/useHouses';

// Define the House interface
interface House {
  id: string;
  house_number: string;
  address: string;
  house_type: 'permanent' | 'non_permanent';
  occupancy_status: 'occupied' | 'vacant';
  current_resident: {
    id: string;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function HousesPage() {
  const [filter, setFilter] = useState<string>('');
  const { data, isLoading } = useHouses();

  const houses = data?.data ?? [];
  const filtered = filter
    ? houses.filter((h: House) => h.occupancy_status === filter)
    : houses;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Houses</h1>
          <p className="text-gray-500">{houses.length} total houses</p>
        </div>
        {/* Note: house creation is done via Filament admin panel */}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['', 'occupied', 'vacant'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Houses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((house: House) => (
            <Link key={house.id} href={`/houses/${house.id}`}>
              <div className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer ${
                house.occupancy_status === 'occupied'
                  ? 'border-green-200'
                  : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    house.occupancy_status === 'occupied' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Home size={18} className={
                      house.occupancy_status === 'occupied' ? 'text-green-600' : 'text-gray-400'
                    } />
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    house.house_type === 'permanent'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {house.house_type}
                  </span>
                </div>
                <p className="font-bold text-lg text-black">{house.house_number}</p>
                <p className="text-xs text-gray-500 truncate">{house.address}</p>
                {house.current_resident && (
                  <div className="flex items-center gap-1 mt-2">
                    <User size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-600 truncate">
                      {house.current_resident.full_name}
                    </p>
                  </div>
                )}
                {!house.current_resident && (
                  <p className="text-xs text-gray-400 mt-2 italic">Vacant</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}