'use client';

// app/(dashboard)/houses/[id]/edit/page.tsx
// Route: /houses/:id/edit

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HouseForm, type HouseFormData } from '@/app/components/houses/HouseForm';
import { useHouse, useUpdateHouse } from '@/app/hooks/useHouses';

export default function EditHousePage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { data, isLoading } = useHouse(id);
  const updateHouse = useUpdateHouse(id);

  const house = data?.data;

  const handleSubmit = async (formData: HouseFormData) => {
    await updateHouse.mutateAsync(formData);
    router.push(`/houses/${id}`);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-52 bg-gray-200 rounded" />
        <div className="h-4 w-72 bg-gray-100 rounded" />
        {[130, 220, 220, 90].map((h, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl" style={{ height: h }} />
        ))}
      </div>
    );
  }

  if (!house) {
    return (
      <div className="p-8 text-center py-24 text-gray-400">
        <p className="font-medium">House not found.</p>
        <Link
          href="/houses"
          className="text-blue-600 text-sm mt-2 inline-block hover:underline"
        >
          ← Back to Houses
        </Link>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
   
  
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl space-y-6">
 
        {/* ── Header — identik dengan residents/new ──────────────────────── */}
        <div>
         <Link
          href={`/houses/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-gray-700 transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back to House {house.house_number}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit House</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update details for{' '}
          <span className="font-mono font-semibold text-gray-700">
            House {house.house_number}
          </span>
        </p>
        </div>
 
        <HouseForm
        initialData={house}
        onSubmit={handleSubmit}
        isSubmitting={updateHouse.isPending}
        submitLabel="Save Changes"
      />
 
      </div>
    </div>

  );
}