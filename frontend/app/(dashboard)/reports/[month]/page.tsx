// app/(dashboard)/reports/[month]/page.tsx
// Route: /reports/:month  (e.g. /reports/2025-01)

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, CheckCircle2, Clock, MinusCircle } from 'lucide-react';
import { useMonthlyDetail, usePaymentStatus } from '@/app/hooks/useReports';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface FeeStatus {
  fee_type_id: string;
  fee_type_name: string;
  status: 'paid' | 'partial' | 'unpaid';
  paid_amount: number;
}

interface HouseStatus {
  house_id: string;
  house_number: string;
  resident_name: string;
  fee_statuses: FeeStatus[];
  all_paid: boolean;
}

interface IncomeItem {
  id: string;
  house_number: string;
  resident_name: string;
  fee_type: string;
  amount: number;
  status: 'paid' | 'unpaid';
  paid_at: string | null;
}

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

// ── Shared table head cell ────────────────────────────────────────────────────
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </th>
  );
}

// ── Fee status badge ──────────────────────────────────────────────────────────
function FeeBadge({ fee }: { fee: FeeStatus }) {
  if (fee.status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                       rounded-full font-semibold bg-blue-50 text-blue-700">
        <CheckCircle2 size={10} />
        {formatRupiah(fee.paid_amount)}
      </span>
    );
  }
  if (fee.status === 'partial') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                       rounded-full font-semibold bg-amber-50 text-amber-700">
        <MinusCircle size={10} />
        {formatRupiah(fee.paid_amount)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                     rounded-full font-semibold bg-slate-100 text-slate-500">
      <Clock size={10} />
      Unpaid
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MonthlyDetailPage() {
  const { month } = useParams<{ month: string }>();
  const { data: detail, isLoading } = useMonthlyDetail(month);
  const { data: statusData } = usePaymentStatus(month);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="space-y-4 max-w-5xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <p className="text-sm text-gray-400">No data available for {month}</p>
      </div>
    );
  }

  const isPositive = detail.balance >= 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold
                     text-blue-500 hover:text-blue-700 transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Back to Reports
        </Link>
        <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
          Monthly Report
        </p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {month}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Income, expenses, and payment status overview
        </p>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Income */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Total Income
            </p>
            <span className="p-2 rounded-xl bg-blue-50">
              <TrendingUp size={16} className="text-blue-500" />
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatRupiah(detail.income.total)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {detail.income.paid_count} paid &middot; {detail.income.unpaid_count} unpaid
            </p>
          </div>
          <div className="h-1 w-full bg-blue-50 rounded-full overflow-hidden">
            <div className="h-full w-full bg-blue-400 rounded-full" />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Total Expenses
            </p>
            <span className="p-2 rounded-xl bg-red-50">
              <TrendingDown size={16} className="text-red-400" />
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatRupiah(detail.expenses.total)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Recorded this month</p>
          </div>
          <div className="h-1 w-full bg-red-50 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-red-300 rounded-full" />
          </div>
        </div>

        {/* Net Balance */}
        <div className={`rounded-2xl shadow-sm p-6 flex flex-col gap-4
          ${isPositive
            ? 'bg-gradient-to-br from-blue-600 to-blue-500'
            : 'bg-gradient-to-br from-red-500 to-red-400'}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Net Balance
            </p>
            <span className="p-2 rounded-xl bg-white/15">
              <Wallet size={16} className="text-white" />
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {formatRupiah(detail.balance)}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {isPositive ? 'Surplus' : 'Deficit'} for {month}
            </p>
          </div>
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-white/60 rounded-full" />
          </div>
        </div>

      </div>

      {/* ── Payment Status per House ────────────────────────────────────────── */}
      {statusData && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Payment Status per House
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fee collection breakdown by household
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <Th>House</Th>
                  <Th>Resident</Th>
                  {statusData.houses[0]?.fee_statuses.map((f: FeeStatus) => (
                    <Th key={f.fee_type_id}>{f.fee_type_name}</Th>
                  ))}
                  <Th>Overall</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {statusData.houses.map((house: HouseStatus) => (
                  <tr key={house.house_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/houses/${house.house_id}`}
                        className="font-bold text-blue-600 hover:text-blue-800
                                   hover:underline transition-colors"
                      >
                        {house.house_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm">
                      {house.resident_name}
                    </td>
                    {house.fee_statuses.map((fee: FeeStatus) => (
                      <td key={fee.fee_type_id} className="px-5 py-3.5">
                        <FeeBadge fee={fee} />
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      {house.all_paid ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                                         rounded-full font-semibold bg-blue-50 text-blue-700">
                          <CheckCircle2 size={10} />
                          All Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                                         rounded-full font-semibold bg-amber-50 text-amber-700">
                          <Clock size={10} />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Income Details ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <span className="p-1.5 rounded-lg bg-blue-50">
            <TrendingUp size={14} className="text-blue-500" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Income Details
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">All incoming payments this month</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <Th>House</Th>
                <Th>Resident</Th>
                <Th>Fee Type</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Paid At</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {detail.income.items.map((item: IncomeItem) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-gray-800">
                    {item.house_number}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{item.resident_name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.fee_type}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">
                    {formatRupiah(item.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    {item.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                                       rounded-full font-semibold bg-blue-50 text-blue-700">
                        <CheckCircle2 size={10} />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                                       rounded-full font-semibold bg-slate-100 text-slate-500">
                        <Clock size={10} />
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                    {item.paid_at ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Expense Details ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <span className="p-1.5 rounded-lg bg-red-50">
            <TrendingDown size={14} className="text-red-400" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Expense Details
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">All outgoing expenses this month</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {detail.expenses.items.map((item: ExpenseItem) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{item.title}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold
                                     bg-slate-100 text-slate-600 capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-red-500">
                    {formatRupiah(item.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                    {item.expense_date}
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
                  {formatRupiah(detail.expenses.total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}