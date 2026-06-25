// app/(dashboard)/residents/new/page.tsx
// Route: /residents/new

'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResidentForm } from '@/app/components/residents/ResidentForm';
import { useCreateResident } from '@/app/hooks/useResidents';

export default function CreateResidentPage() {
  const router          = useRouter();
  const createResident  = useCreateResident();

  const handleSubmit = async (formData: FormData) => {
    await createResident.mutateAsync(formData);
    router.push('/residents');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <Link
            href="/residents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold
                       text-blue-500 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to Residents
          </Link>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add Resident</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Register a new resident to the housing complex
          </p>
        </div>

        <ResidentForm
          onSubmit={handleSubmit}
          isSubmitting={createResident.isPending}
          submitLabel="Add Resident"
        />

      </div>
    </div>
  );
}