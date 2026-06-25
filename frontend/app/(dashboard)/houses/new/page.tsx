'use client';

// app/(dashboard)/houses/new/page.tsx
// Route: /houses/new

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HouseForm, type HouseFormData } from '@/app/components/houses/HouseForm';
import { useCreateHouse } from '@/app/hooks/useHouses';

export default function CreateHousePage() {
  const router = useRouter();
  const createHouse = useCreateHouse();

  const handleSubmit = async (data: HouseFormData) => {
    await createHouse.mutateAsync(data);
    router.push('/houses');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl space-y-6">
 
        {/* ── Header — identik dengan residents/new ──────────────────────── */}
        <div>
          <Link
            href="/houses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold
                       text-blue-500 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to Houses
          </Link>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add House</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Register a new house unit to the complex
          </p>
        </div>
 
        <HouseForm
          onSubmit={handleSubmit}
          isSubmitting={createHouse.isPending}
          submitLabel="Add House"
        />
 
      </div>
    </div>
  );
}