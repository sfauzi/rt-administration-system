// app/(dashboard)/expenses/new/page.tsx
// Route: /expenses/new

'use client';

import { useRouter } from 'next/navigation';
import { useCreateExpense } from '@/app/hooks/useExpenses';
import { ExpenseForm, type ExpenseFormData } from '@/app/components/expenses/ExpenseForm';

export default function NewExpensePage() {
  const router        = useRouter();
  const createExpense = useCreateExpense();

  const handleSubmit = async (formData: ExpenseFormData) => {
    await createExpense.mutateAsync({
      ...formData,
      amount: Number(formData.amount),
    });
    router.push('/expenses');
  };

  return (
    <ExpenseForm
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={createExpense.isPending}
    />
  );
}