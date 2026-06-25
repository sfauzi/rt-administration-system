// app/(dashboard)/payments/page.tsx
// Route: /payments

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { usePayments } from '@/app/hooks/usePayments';

// Define the Payment interface
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
  receipt_number: string | null;
  notes: string | null;
  resident_name: string;
  fee_type_name: string;
  house_number: string;
  created_at: string;
  updated_at: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentsPage() {
  const [month, setMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = usePayments({
    month: month || undefined,
    status: statusFilter || undefined,
  });

  const payments = data?.data ?? [];
  const totalPaid = payments
    .filter((p: Payment) => p.status === 'paid')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Payments</h1>
          <p className="text-gray-500">
            Total collected: <strong className="text-green-600">{formatRupiah(totalPaid)}</strong>
          </p>
        </div>
        <Link
          href="/payments/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> Record Payment
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
          {['', 'paid', 'unpaid', 'partial'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === '' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <TrendingUp size={36} className="mx-auto mb-2 opacity-30" />
            <p>No payment records found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">House</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Resident</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Fee Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Period</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Method</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment: Payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-neutral-500">{payment.house_number}</td>
                  <td className="px-5 py-3 text-neutral-500">{payment.resident_name}</td>
                  <td className="px-5 py-3 text-neutral-500">{payment.fee_type_name}</td>
                  <td className="px-5 py-3 font-semibold text-neutral-500">{formatRupiah(payment.amount)}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {payment.billing_month}
                    {payment.months_covered > 1 && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({payment.months_covered} mo.)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 capitalize">
                    {payment.payment_method?.replace('_', ' ') ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {payment.paid_at
                      ? format(new Date(payment.paid_at), 'dd MMM yyyy')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer: Total */}
            <tfoot className="border-t bg-gray-50">
              <tr>
                <td colSpan={3} className="px-5 py-3 text-right font-medium text-gray-600">
                  Total Paid
                </td>
                <td className="px-5 py-3 font-bold text-green-600">
                  {formatRupiah(totalPaid)}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}