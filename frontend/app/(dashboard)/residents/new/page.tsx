'use client';

// app/(dashboard)/residents/new/page.tsx
// Route: /residents/new

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResidentForm } from '@/app/components/residents/ResidentForm';
import { useCreateResident } from '@/app/hooks/useResidents';

export default function CreateResidentPage() {
  const router = useRouter();
  const createResident = useCreateResident();

  const handleSubmit = async (formData: FormData) => {
    await createResident.mutateAsync(formData);
    router.push('/residents');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/residents"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-gray-700 transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back to Residents
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Resident</h1>
        <p className="text-gray-500 text-sm mt-1">
          Register a new resident to the housing complex
        </p>
      </div>

      <ResidentForm
        onSubmit={handleSubmit}
        isSubmitting={createResident.isPending}
        submitLabel="Add Resident"
      />
    </div>
  );
}