// app/(dashboard)/payments/page.tsx
// Route: /payments

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MinusCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { usePayments, useDeletePayment } from '@/app/hooks/usePayments';

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
  receipt_number?: string | null;
  notes?: string | null;
  resident_name?: string;
  fee_type_name?: string;
  house_number?: string;
  created_at?: string;
  updated_at?: string;
}

// ── Components ────────────────────────────────────────────────────────────────
import { DeletePaymentModal } from '@/app/components/payments/DeletePaymentModal';

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

const statuses = ['', 'paid', 'unpaid', 'partial'];

export default function PaymentsPage() {
  const [month, setMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const queryClient = useQueryClient();

  // Gunakan params untuk query
  const queryParams = {
    ...(month && { month }),
    ...(statusFilter && { status: statusFilter }),
  };

  // ✅ FIX: Force refetch when the page mounts or becomes visible
  const { data, isLoading, refetch } = usePayments(queryParams);
  const deletePayment = useDeletePayment();

  // ✅ FIX: Refetch data when the page becomes visible (user returns from another page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  // ✅ FIX: Refetch when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // ✅ FIX: Refetch when filters change
  useEffect(() => {
    refetch();
  }, [month, statusFilter, refetch]);

  const payments = data?.data ?? [];
  const totalPaid = payments
    .filter((p: Payment) => p.status === 'paid')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPayment) {
      try {
        await deletePayment.mutateAsync(selectedPayment.id);
        setDeleteModalOpen(false);
        setSelectedPayment(null);
        // ✅ FIX: Invalidate and refetch after successful deletion
        await queryClient.invalidateQueries({ queryKey: ['payments'] });
        await refetch();
      } catch (error) {
        console.error('Failed to delete payment:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Total collected:{' '}
            <span className="font-semibold text-blue-600">{formatRupiah(totalPaid)}</span>
            {/* <span className="ml-2 text-xs text-gray-400">
              ({payments.length} records)
            </span> */}
          </p>
        </div>
        <Link
          href="/payments/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-lg text-sm font-medium
                     transition-colors shadow-sm"
        >
          <Plus size={16} />
          Record Payment
        </Link>
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
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
              }`}
            >
              {status === '' ? 'All' : status}
              {status !== '' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === status
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {payments.filter(p => p.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Payments Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-100">
              <TrendingUp size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No payment records found</p>
            <p className="text-xs text-gray-400">
              {statusFilter
                ? `No "${statusFilter}" payments${month ? ` for ${month}` : ''}`
                : month ? `No payments recorded for ${month}` : 'No payments recorded yet'
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
                <Th>House</Th>
                <Th>Resident</Th>
                <Th>Fee Type</Th>
                <Th>Amount</Th>
                <Th>Period</Th>
                <Th>Status</Th>
                <Th>Method</Th>
                <Th>Date</Th>
                <Th className="text-center">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((payment: Payment) => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">

                  {/* House */}
                  <td className="px-5 py-4 font-bold text-gray-800">
                    {payment.house_number || '—'}
                  </td>

                  {/* Resident */}
                  <td className="px-5 py-4 text-gray-600">
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

                  {/* Period */}
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-gray-500">
                      {payment.billing_month}
                    </span>
                    {payment.months_covered > 1 && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                                       bg-slate-100 text-slate-500 font-semibold">
                        {payment.months_covered} mo.
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={payment.status} />
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

                  {/* Date */}
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">
                    {payment.paid_at
                      ? format(new Date(payment.paid_at), 'dd MMM yyyy')
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/payments/${payment.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400
                                   hover:text-blue-600 transition-colors"
                        title="Edit payment"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(payment)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400
                                   hover:text-red-600 transition-colors"
                        title="Delete payment"
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
                <td colSpan={3} className="px-5 py-4 text-right text-xs font-semibold
                                            uppercase tracking-wider text-gray-400">
                  Total Collected
                </td>
                <td className="px-5 py-4 font-bold text-blue-600 text-base">
                  {formatRupiah(totalPaid)}
                </td>
                <td colSpan={5} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      <DeletePaymentModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedPayment(null);
        }}
        onConfirm={handleDeleteConfirm}
        payment={selectedPayment}
        isPending={deletePayment.isPending}
      />
    </div>
  );
}