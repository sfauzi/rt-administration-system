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
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/houses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-gray-700 transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back to Houses
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add House</h1>
        <p className="text-gray-500 text-sm mt-1">
          Register a new house unit to the complex
        </p>
      </div>

      <HouseForm
        onSubmit={handleSubmit}
        isSubmitting={createHouse.isPending}
        submitLabel="Add House"
      />
    </div>
  );
}