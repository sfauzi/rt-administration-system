// app/(dashboard)/payments/page.tsx
// Route: /payments

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePayments } from '@/app/hooks/usePayments';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

const statusConfig = {
  paid: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  unpaid: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  partial: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

export default function PaymentsPage() {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { data, isLoading } = usePayments({ month });

  const payments = data?.data ?? [];
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Payments</h1>
          <p className="text-gray-500">Monthly dues tracking</p>
        </div>
        <Link
          href="/payments/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> Record Payment
        </Link>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-neutral-700">Month:</label>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-neutral-500"
        />
        <span className="text-sm text-gray-500">
          Total collected: <strong className="text-green-600">{formatRupiah(totalPaid)}</strong>
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-500">House</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Resident</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Fee Type</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Months</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Paid At</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
            )}
            {!isLoading && payments.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No payments found for {month}</td></tr>
            )}
            {payments.map(payment => {
              const Status = statusConfig[payment.status];
              const StatusIcon = Status.icon;
              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-neutral-700">{payment.house_number}</td>
                  <td className="px-5 py-3 text-neutral-700">{payment.resident_name}</td>
                  <td className="px-5 py-3 text-neutral-700">{payment.fee_type_name}</td>
                  <td className="px-5 py-3 text-neutral-700">{formatRupiah(payment.amount)}</td>
                  <td className="px-5 py-3 text-neutral-700">{payment.months_covered} mo.</td>
                  <td className="px-5 py-3 text-neutral-700">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${Status.bg} ${Status.color}`}>
                      <StatusIcon size={12} />
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {payment.paid_at ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}