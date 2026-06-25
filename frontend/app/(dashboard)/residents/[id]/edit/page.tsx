'use client';

// app/(dashboard)/residents/[id]/edit/page.tsx
// Route: /residents/:id/edit

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResidentForm } from '@/app/components/residents/ResidentForm';
import { useResident, useUpdateResident } from '@/app/hooks/useResidents';

export default function EditResidentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useResident(id);
  const updateResident = useUpdateResident(id);

  const resident = data?.data;

  const handleSubmit = async (formData: FormData) => {
    await updateResident.mutateAsync(formData);
    router.push(`/residents/${id}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        {/* Skeleton sections */}
        {[140, 100, 180, 80].map((h, i) => (
          <div key={i} className={`bg-gray-100 rounded-2xl animate-pulse`} style={{ height: h }} />
        ))}
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-400">Resident not found.</p>
        <Link href="/residents" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
          Back to Residents
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/residents/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500
                     hover:text-gray-700 transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          Back to {resident.full_name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Resident</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update information for <strong>{resident.full_name}</strong>
        </p>
      </div>

      <ResidentForm
        initialData={resident}
        onSubmit={handleSubmit}
        isSubmitting={updateResident.isPending}
        submitLabel="Save Changes"
      />
    </div>
  );
}