// app/(dashboard)/expenses/page.tsx
// Route: /expenses

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingDown, Repeat2, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useExpenses, useDeleteExpense } from '@/app/hooks/useExpenses';
import { DeleteExpenseModal } from '@/app/components/expenses/DeleteExpenseModal';
import type { Expense } from '@/app/types';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

const categoryStyles: Record<string, string> = {
  salary:      'bg-blue-50 text-blue-700',
  electricity: 'bg-amber-50 text-amber-700',
  maintenance: 'bg-orange-50 text-orange-700',
  other:       'bg-slate-100 text-slate-600',
};

const categories = ['', 'salary', 'electricity', 'maintenance', 'other'];

// ── Shared table head cell ────────────────────────────────────────────────────
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider
                    text-gray-400 ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const [month, setMonth]               = useState(format(new Date(), 'yyyy-MM'));
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data, isLoading } = useExpenses({
    month,
    category: categoryFilter || undefined,
  });
  const deleteExpense = useDeleteExpense();

  const expenses      = data?.data ?? [];
  const totalExpenses = expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;
    try {
      await deleteExpense.mutateAsync(selectedExpense.id);
      setDeleteModalOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleDeleteClose = () => {
    if (deleteExpense.isPending) return; // prevent close while deleting
    setDeleteModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expenses</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Total for {month}:{' '}
            <span className="font-semibold text-red-500">{formatRupiah(totalExpenses)}</span>
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-lg text-sm font-medium
                     transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Expense
        </Link>
      </div>

      {/* ── Summary Card ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-sm p-6
                      flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
            Total Expenses
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {formatRupiah(totalExpenses)}
          </p>
          <p className="text-xs text-white/60 mt-1">{month}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/15">
          <TrendingDown size={28} className="text-white" />
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border border-blue-100 bg-white text-blue-700 font-medium
                     rounded-lg px-3 py-2 text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-300 cursor-pointer shadow-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
              }`}
            >
              {cat === '' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Expense Table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-100">
              <TrendingDown size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No expenses recorded</p>
            <p className="text-xs text-gray-400">
              {categoryFilter
                ? `No "${categoryFilter}" expenses for ${month}`
                : `No expenses found for ${month}`}
            </p>
            <Link
              href="/expenses/new"
              className="mt-1 inline-flex items-center gap-1.5 text-sm
                         text-blue-600 hover:underline font-medium"
            >
              <Plus size={14} /> Add first expense
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th>Recurring</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((expense: Expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">

                  {/* Title */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{expense.title}</p>
                    {expense.description && (
                      <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                        {expense.description}
                      </p>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                      categoryStyles[expense.category] ?? 'bg-slate-100 text-slate-600'
                    }`}>
                      {expense.category}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 font-bold text-gray-900">
                    {formatRupiah(expense.amount)}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">
                    {format(new Date(expense.expense_date), 'dd MMM yyyy')}
                  </td>

                  {/* Recurring */}
                  <td className="px-5 py-4">
                    {expense.is_recurring ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                                       rounded-full font-semibold bg-blue-50 text-blue-700">
                        <Repeat2 size={10} />
                        Monthly
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/expenses/${expense.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400
                                   hover:text-blue-600 transition-colors"
                        title="Edit expense"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(expense)}
                        disabled={deleteExpense.isPending}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400
                                   hover:text-red-600 transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-100 bg-slate-50/60">
                <td colSpan={2} className="px-5 py-4 text-right text-xs font-semibold
                                            uppercase tracking-wider text-gray-400">
                  Total Expenses
                </td>
                <td className="px-5 py-4 font-bold text-red-500 text-base">
                  {formatRupiah(totalExpenses)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* ── Delete Modal ────────────────────────────────────────────────────── */}
      <DeleteExpenseModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        expenseTitle={selectedExpense?.title ?? null}
        isPending={deleteExpense.isPending}
      />

    </div>
  );
}