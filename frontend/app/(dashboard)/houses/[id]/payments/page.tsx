// app/(dashboard)/houses/[id]/payments/page.tsx
// Route: /houses/:id/payments

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, TrendingUp, CheckCircle2, MinusCircle, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useHouse, useHousePayments } from '@/app/hooks/useHouses';
import { useQueryClient } from '@tanstack/react-query';

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

// ── Pagination Component ──────────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, totalItems, perPage, onPageChange }: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItem   = Math.min(currentPage * perPage, totalItems);

  // Build page number array with ellipsis logic
  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-4
                    border-t border-slate-100 bg-slate-50/60">
      {/* Info */}
      <p className="text-xs text-gray-400">
        Showing{' '}
        <span className="font-semibold text-gray-600">{startItem}–{endItem}</span>
        {' '}of{' '}
        <span className="font-semibold text-gray-600">{totalItems}</span>
        {' '}records
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700
                     hover:bg-white border border-transparent hover:border-slate-200
                     transition-all disabled:opacity-30 disabled:cursor-not-allowed
                     disabled:hover:bg-transparent disabled:hover:border-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-xs text-gray-300 select-none"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-semibold
                         transition-all ${
                           currentPage === page
                             ? 'bg-blue-600 text-white shadow-sm'
                             : 'text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-slate-200'
                         }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700
                     hover:bg-white border border-transparent hover:border-slate-200
                     transition-all disabled:opacity-30 disabled:cursor-not-allowed
                     disabled:hover:bg-transparent disabled:hover:border-transparent"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PER_PAGE = 5;

export default function HousePaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const [month, setMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: houseData }                    = useHouse(id);
  const { data: paymentsData, isLoading, refetch } = useHousePayments(id, {
    month: month || undefined,
  });

  const house      = houseData?.data;
  const payments   = paymentsData?.data ?? [];
  
  // ── Reset to page 1 when month filter changes ──────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [month]);

  // ── Derived totals (from ALL records, not just current page) ──────────────
  const totalPaid  = payments
    .filter((p: Payment) => p.status === 'paid')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  // ── Pagination logic ──────────────────────────────────────────────────────
  const totalPages    = Math.ceil(payments.length / PER_PAGE);
  const paginatedPayments = useMemo(
    () => payments.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [payments, currentPage]
  );

  // ── Guard: if current page is out of range after data changes, go to last page ──
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    // Also reset to page 1 if no data and currentPage is not 1
    if (payments.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, payments.length]);

  // ── Auto-refetch when data changes ──────────────────────────────────────────
  useEffect(() => {
    // Refetch data when the component mounts or when the house ID changes
    refetch();
  }, [id, refetch]);

  // ── Listen for payment updates and refetch ─────────────────────────────────
  useEffect(() => {
    // Subscribe to query invalidation for payments
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'queryUpdated') {
        const queryKey = event.query.queryKey;
        // Check if any payment-related query was updated
        if (Array.isArray(queryKey) && 
            (queryKey.includes('payments') || 
             queryKey[0] === 'payments' ||
             queryKey.includes('house-payments'))) {
          refetch();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, refetch]);

  // ── Refetch when window gets focus (for updates from other tabs) ──────────
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

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
        {/* Manual refresh button */}
        {/* <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold
                     text-blue-600 hover:text-blue-700 transition-colors ml-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button> */}
      </div>

      {/* ── Payments Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
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
          <>
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
                {paginatedPayments.map((payment: Payment) => (
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
              <tfoot>
                <tr className="border-t-2 border-slate-100 bg-slate-50/60">
                  <td colSpan={3} className="px-5 py-4 text-right text-xs font-semibold
                                              uppercase tracking-wider text-gray-400">
                    Total Collected
                  </td>
                  <td className="px-5 py-4 font-bold text-blue-600 text-base">
                    {formatRupiah(totalPaid)}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>

            {/* ── Pagination ──────────────────────────────────────────────── */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={payments.length}
              perPage={PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

    </div>
  );
}