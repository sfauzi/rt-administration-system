// app/(dashboard)/houses/[id]/payments/page.tsx
// Route: /houses/:id/payments

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, TrendingUp, CheckCircle2, MinusCircle, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { useHouse, useHousePayments } from '@/app/hooks/useHouses';

// ── Interface ─────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  house_id: string;
  resident_id: string;
  fee_type_id: string;
  amount: number;
  billing_month: string;
  months_covered: number;
  status: 'paid' | 'partial' | 'unpaid';
  paid_at: string | null;
  payment_method: string | null;
  resident_name?: string;
  fee_type_name?: string;
  created_at?: string;
  updated_at?: string;
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

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Payment['status'] }) {
  if (status === 'paid') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                     rounded-full font-semibold bg-blue-50 text-blue-700">
      <CheckCircle2 size={10} /> Paid
    </span>
  );
  if (status === 'partial') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                     rounded-full font-semibold bg-amber-50 text-amber-700">
      <MinusCircle size={10} /> Partial
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                     rounded-full font-semibold bg-slate-100 text-slate-500">
      <Clock size={10} /> Unpaid
    </span>
  );
}

export default function HousePaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const [month, setMonth] = useState('');

  const { data: houseData }                    = useHouse(id);
  const { data: paymentsData, isLoading }      = useHousePayments(id, {
    month: month || undefined,
  });

  const house      = houseData?.data;
  const payments   = paymentsData?.data ?? [];
  const totalPaid  = payments
    .filter((p: Payment) => p.status === 'paid')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <Link
          href={`/houses/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold
                     text-blue-500 hover:text-blue-700 transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Back to House {house?.house_number}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
              House {house?.house_number}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Payment Records
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {month ? `Month: ${month}` : 'All time'} &middot; Collected:{' '}
              <span className="font-semibold text-blue-600">{formatRupiah(totalPaid)}</span>
            </p>
          </div>
          <Link
            href="/payments/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                       text-white px-4 py-2 rounded-lg text-sm font-medium
                       transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Payment
          </Link>
        </div>
      </div>

      {/* ── Summary Card ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl shadow-sm p-6
                      flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
            Total Collected
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {formatRupiah(totalPaid)}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {month ? month : 'All periods'} &middot; paid payments only
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white/15">
          <TrendingUp size={28} className="text-white" />
        </div>
      </div>

      {/* ── Month filter ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Filter by month
        </p>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border border-blue-100 bg-white text-blue-700 font-medium
                     rounded-lg px-3 py-2 text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-300 cursor-pointer shadow-xs"
        />
        {month && (
          <button
            onClick={() => setMonth('')}
            className="inline-flex items-center gap-1 text-xs font-semibold
                       text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Payments Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-100">
              <TrendingUp size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No payment records found</p>
            <p className="text-xs text-gray-400">
              {month
                ? `No payments recorded for ${month}`
                : 'No payments recorded for this house yet'
              }
            </p>
            <Link
              href="/payments/new"
              className="mt-1 inline-flex items-center gap-1.5 text-sm
                         text-blue-600 hover:underline font-medium"
            >
              <Plus size={14} /> Record first payment
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <Th>Period</Th>
                <Th>Resident</Th>
                <Th>Fee Type</Th>
                <Th>Amount</Th>
                <Th>Months</Th>
                <Th>Status</Th>
                <Th>Paid At</Th>
                <Th>Method</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((payment: Payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">

                  {/* Period */}
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">
                    {payment.billing_month}
                  </td>

                  {/* Resident */}
                  <td className="px-5 py-4 font-semibold text-gray-800">
                    {payment.resident_name || '—'}
                  </td>

                  {/* Fee Type */}
                  <td className="px-5 py-4 text-gray-600">
                    {payment.fee_type_name || '—'}
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 font-bold text-gray-900">
                    {formatRupiah(payment.amount)}
                  </td>

                  {/* Months covered */}
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold
                                     bg-slate-100 text-slate-600">
                      {payment.months_covered} mo.
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={payment.status} />
                  </td>

                  {/* Paid At */}
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">
                    {payment.paid_at
                      ? format(new Date(payment.paid_at), 'dd MMM yyyy')
                      : '—'}
                  </td>

                  {/* Method */}
                  <td className="px-5 py-4">
                    {payment.payment_method ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold
                                       bg-slate-100 text-slate-600 capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}