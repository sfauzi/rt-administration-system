// app/(dashboard)/expenses/new/page.tsx
// Route: /expenses/new

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateExpense } from '@/app/hooks/useExpenses';

export default function NewExpensePage() {
  const router = useRouter();
  const createExpense = useCreateExpense();

  const [form, setForm] = useState({
    title: '',
    category: 'salary' as string,
    amount: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    expense_month: format(new Date(), 'yyyy-MM'),
    description: '',
    is_recurring: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Auto-sync expense_month when expense_date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setForm(f => ({
      ...f,
      expense_date: date,
      expense_month: date.substring(0, 7), // "YYYY-MM"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpense.mutateAsync({
      ...form,
      amount: Number(form.amount),
    });
    router.push('/expenses');
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <Link href="/expenses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Expenses
        </Link>
        <h1 className="text-2xl font-bold text-black">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700">Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Gaji Satpam Januari 2025"
            className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
            required
          />
        </div>

        {/* Category + Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
              required
            >
              <option value="salary">Salary (Gaji Satpam)</option>
              <option value="electricity">Electricity (Token Listrik)</option>
              <option value="maintenance">Maintenance (Perbaikan)</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Amount (Rp) *</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="500000"
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
              required
            />
          </div>
        </div>

        {/* Date + Month */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Expense Date *</label>
            <input
              type="date"
              name="expense_date"
              value={form.expense_date}
              onChange={handleDateChange}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">
              Billing Month
              <span className="text-gray-400 font-normal ml-1">(auto-filled)</span>
            </label>
            <input
              type="month"
              name="expense_month"
              value={form.expense_month}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
            />
          </div>
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center gap-3 text-neutral-500">
          <input
            type="checkbox"
            id="is_recurring"
            name="is_recurring"
            checked={form.is_recurring}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label htmlFor="is_recurring" className="text-sm font-medium cursor-pointer">
            Recurring Monthly Expense
            <span className="text-gray-400 font-normal ml-1">
              (e.g. gaji satpam yang selalu ada tiap bulan)
            </span>
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Optional notes..."
            className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
          />
        </div>

        <button
          type="submit"
          disabled={createExpense.isPending}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {createExpense.isPending ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </div>
  );
}