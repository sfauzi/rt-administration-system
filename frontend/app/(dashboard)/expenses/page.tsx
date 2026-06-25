// app/(dashboard)/expenses/page.tsx
// Route: /expenses

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingDown, Repeat2 } from 'lucide-react';
import { format } from 'date-fns';
import { useExpenses, useDeleteExpense } from '@/app/hooks/useExpenses';

// Define the Expense interface
interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  expense_month: string;
  description: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

const categoryColors: Record<string, string> = {
  salary:      'bg-blue-100 text-blue-700',
  electricity: 'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-orange-100 text-orange-700',
  other:       'bg-gray-100 text-gray-600',
};

export default function ExpensesPage() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useExpenses({
    month,
    category: categoryFilter || undefined,
  });
  const deleteExpense = useDeleteExpense();

  const expenses = data?.data ?? [];
  const totalExpenses = expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await deleteExpense.mutateAsync(id);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Expenses</h1>
          <p className="text-gray-500">
            Total for {month}:{' '}
            <strong className="text-red-600">{formatRupiah(totalExpenses)}</strong>
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-neutral-500"
        />
        <div className="flex gap-2">
          {['', 'salary', 'electricity', 'maintenance', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat === '' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <TrendingDown size={36} className="mx-auto mb-2 opacity-30" />
            <p>No expenses for {month}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Title</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Recurring</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map((expense: Expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-neutral-500">{expense.title}</p>
                    {expense.description && (
                      <p className="text-xs text-gray-400 truncate max-w-xs">
                        {expense.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      categoryColors[expense.category] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-neutral-500">
                    {formatRupiah(expense.amount)}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {format(new Date(expense.expense_date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-5 py-3">
                    {expense.is_recurring && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Repeat2 size={14} />
                        <span className="text-xs">Monthly</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer: Total */}
            <tfoot className="border-t bg-gray-50">
              <tr>
                <td colSpan={2} className="px-5 py-3 text-right font-medium text-gray-600">
                  Total
                </td>
                <td className="px-5 py-3 font-bold text-red-600">
                  {formatRupiah(totalExpenses)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}