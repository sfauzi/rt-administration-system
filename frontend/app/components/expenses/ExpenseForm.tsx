// app/(dashboard)/expenses/_components/ExpenseForm.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingDown, Repeat2, Save } from 'lucide-react';
import { format } from 'date-fns';
import type { Expense, ExpenseCategory } from '@/app/types';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ExpenseFormData {
  title: string;
  category: ExpenseCategory;
  amount: string;
  expense_date: string;
  expense_month: string;
  description: string;
  is_recurring: boolean;
}

interface ExpenseFormProps {
  /** Pass existing expense data to pre-fill the form (edit mode) */
  initialData?: Partial<Expense>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildInitialState(initialData?: Partial<Expense>): ExpenseFormData {
  if (initialData) {
    return {
      title:         initialData.title        ?? '',
      category:      (initialData.category    ?? 'other') as ExpenseCategory,
      amount:        initialData.amount != null ? String(initialData.amount) : '',
      expense_date:  initialData.expense_date  ?? format(new Date(), 'yyyy-MM-dd'),
      expense_month: initialData.expense_month ?? format(new Date(), 'yyyy-MM'),
      description:   initialData.description  ?? '',
      is_recurring:  initialData.is_recurring  ?? false,
    };
  }
  return {
    title: '',
    category: 'salary',
    amount: '',
    expense_date:  format(new Date(), 'yyyy-MM-dd'),
    expense_month: format(new Date(), 'yyyy-MM'),
    description: '',
    is_recurring: false,
  };
}

// ── Shared class names ────────────────────────────────────────────────────────
const inputCls = `w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
  transition-colors`;

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

// ── Component ─────────────────────────────────────────────────────────────────
export function ExpenseForm({ initialData, onSubmit, isSubmitting, mode }: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseFormData>(() => buildInitialState(initialData));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Keep expense_month in sync with expense_date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setForm(f => ({
      ...f,
      expense_date:  date,
      expense_month: date.substring(0, 7),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isEdit = mode === 'edit';

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl space-y-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div>
          <Link
            href="/expenses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold
                       text-blue-500 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to Expenses
          </Link>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit ? 'Update expense information' : 'Record a new expense entry'}
          </p>
        </div>

        {/* ── Form Card ────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-50">
              <TrendingDown size={16} className="text-red-400" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800 tracking-tight">Expense Details</p>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the information below</p>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Title */}
            <div>
              <label className={labelCls}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Gaji Satpam Januari 2025"
                className={inputCls}
                required
              />
            </div>

            {/* Category + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputCls}
                  required
                >
                  <option value="salary">Salary (Gaji Satpam)</option>
                  <option value="electricity">Electricity (Token Listrik)</option>
                  <option value="maintenance">Maintenance (Perbaikan)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Amount (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="500000"
                  min="0"
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* Expense Date + Billing Month */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Expense Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="expense_date"
                  value={form.expense_date}
                  onChange={handleDateChange}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  Billing Month
                  <span className="text-gray-300 font-normal normal-case tracking-normal ml-1">
                    (auto-filled)
                  </span>
                </label>
                <input
                  type="month"
                  name="expense_month"
                  value={form.expense_month}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Recurring toggle */}
            <div
              className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer
                transition-colors ${
                  form.is_recurring
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring }))}
            >
              {/* Custom checkbox */}
              <div
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center
                  shrink-0 border transition-colors ${
                    form.is_recurring
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-slate-300'
                  }`}
              >
                {form.is_recurring && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                id="is_recurring"
                name="is_recurring"
                checked={form.is_recurring}
                onChange={handleChange}
                className="sr-only"
              />
              <div>
                <label
                  htmlFor="is_recurring"
                  className={`text-sm font-semibold cursor-pointer flex items-center gap-1.5
                    ${form.is_recurring ? 'text-blue-700' : 'text-gray-700'}`}
                  onClick={e => e.stopPropagation()}
                >
                  <Repeat2 size={13} />
                  Recurring Monthly Expense
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tandai jika pengeluaran ini muncul setiap bulan (e.g. gaji satpam)
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Optional notes..."
                className={inputCls}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2
                         bg-blue-600 hover:bg-blue-700 text-white
                         py-2.5 rounded-xl font-semibold text-sm
                         transition-colors shadow-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={15} />
              {isSubmitting
                ? (isEdit ? 'Saving...' : 'Saving...')
                : (isEdit ? 'Save Changes' : 'Save Expense')}
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}