'use client';

// app/components/houses/HouseCard.tsx

import { useRouter } from 'next/navigation';
import { Home, User, Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteHouse } from '@/app/hooks/useHouses';
import type { House } from '@/app/types';

export function HouseCard({ house }: { house: House }) {
  const isOccupied  = house.occupancy_status === 'occupied';
  const deleteHouse = useDeleteHouse();
  const router      = useRouter();
  const queryClient = useQueryClient();

  const handleCardClick = () => {
    if (deleteHouse.isPending) return;
    router.push(`/houses/${house.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/houses/${house.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete House ${house.house_number}?`)) return;
    try {
      await deleteHouse.mutateAsync(house.id);
      await queryClient.invalidateQueries({ queryKey: ['houses'] });
    } catch (error) {
      console.error('Failed to delete house:', error);
      alert('Failed to delete house. Please try again.');
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={e => e.key === 'Enter' && handleCardClick()}
      className={`relative group bg-white rounded-2xl border p-5
        hover:shadow-md transition-shadow cursor-pointer
        ${isOccupied ? 'border-blue-100' : 'border-slate-100'}
        ${deleteHouse.isPending ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Action buttons visible on hover */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        <button
          onClick={handleEdit}
          className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hover:bg-blue-50 hover:border-blue-300"
          aria-label={`Edit house ${house.house_number}`}
        >
          <Pencil size={13} className="text-gray-400 hover:text-blue-600 transition-colors" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteHouse.isPending}
          className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hover:bg-red-50 hover:border-red-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Delete house ${house.house_number}`}
        >
          <Trash2
            size={13}
            className={`transition-colors ${
              deleteHouse.isPending ? 'text-gray-300' : 'text-gray-400 hover:text-red-500'
            }`}
          />
        </button>
      </div>

      {/* Top row: icon + type badge */}
      <div className="flex items-start justify-between mb-3 pr-8">
        <div className={`p-2 rounded-xl ${isOccupied ? 'bg-blue-50' : 'bg-slate-100'}`}>
          <Home size={18} className={isOccupied ? 'text-blue-500' : 'text-slate-400'} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          house.house_type === 'permanent'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {house.house_type}
        </span>
      </div>

      {/* House number */}
      <p className="font-bold text-lg font-mono tracking-wide text-gray-800">
        {house.house_number}
      </p>

      {/* Address */}
      <p className="text-xs text-gray-400 truncate mt-0.5">{house.address}</p>

      {/* Current resident */}
      <div className="mt-2 min-h-[20px]">
        {house.current_resident ? (
          <div className="flex items-center gap-1">
            <User size={12} className="text-gray-400 shrink-0" />
            <p className="text-xs text-gray-600 truncate">
              {house.current_resident.full_name}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Vacant</p>
        )}
      </div>

      {/* Occupancy indicator */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
        <div className={`w-1.5 h-1.5 rounded-full ${
          isOccupied ? 'bg-blue-500' : 'bg-slate-300'
        }`} />
        <span className={`text-xs font-semibold capitalize ${
          isOccupied ? 'text-blue-600' : 'text-slate-400'
        }`}>
          {house.occupancy_status}
        </span>
      </div>
    </div>
  );
}