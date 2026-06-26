// app/(dashboard)/expenses/[id]/edit/page.tsx
// Route: /expenses/[id]/edit

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useExpense, useUpdateExpense } from '@/app/hooks/useExpenses';
import { ExpenseForm, type ExpenseFormData } from '@/app/components/expenses/ExpenseForm';

export default function EditExpensePage() {
  const params        = useParams<{ id: string }>();
  const router        = useRouter();
  const id            = params.id;

  const { data, isLoading, isError } = useExpense(id);
  const updateExpense = useUpdateExpense(id);

  const handleSubmit = async (formData: ExpenseFormData) => {
    await updateExpense.mutateAsync({
      ...formData,
      amount: Number(formData.amount),
    });
    router.push('/expenses');
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found state ─────────────────────────────────────────────
  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-gray-800">Expense not found</p>
          <p className="text-sm text-gray-400">
            The expense you&apos;re trying to edit doesn&apos;t exist or was deleted.
          </p>
          <a
            href="/expenses"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline font-medium"
          >
            ← Back to Expenses
          </a>
        </div>
      </div>
    );
  }

  return (
    <ExpenseForm
      mode="edit"
      initialData={data.data}
      onSubmit={handleSubmit}
      isSubmitting={updateExpense.isPending}
    />
  );
}