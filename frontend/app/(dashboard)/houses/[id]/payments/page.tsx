// app/(dashboard)/houses/[id]/payments/page.tsx
// Route: /houses/:id/payments

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useHouse, useHousePayments } from '@/app/hooks/useHouses';

// Define the Payment interface with optional fields to match API response
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
  resident_name: string;
  fee_type_name: string;
  created_at?: string;
  updated_at?: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

export default function HousePaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const [month, setMonth] = useState(''); // empty = all months
  const { data: houseData } = useHouse(id);
  const { data: paymentsData, isLoading } = useHousePayments(id, {
    month: month || undefined,
  });

  const house = houseData?.data;
  const payments = paymentsData?.data ?? [];
  const totalPaid = payments
    .filter((p: Payment) => p.status === 'paid')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href={`/houses/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to House {house?.house_number}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Payments — House {house?.house_number}
            </h1>
            <p className="text-gray-500">
              {month ? `Month: ${month}` : 'All time'} ·{' '}
              Collected: <strong className="text-green-600">{formatRupiah(totalPaid)}</strong>
            </p>
          </div>
          <Link
            href={`/payments/new`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Plus size={16} /> Add Payment
          </Link>
        </div>
      </div>

      {/* Month filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Filter by month:</label>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        {month && (
          <button
            onClick={() => setMonth('')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p>No payment records found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Period</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Resident</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Fee Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Months</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Paid At</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment: Payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{payment.billing_month}</td>
                  <td className="px-5 py-3">{payment.resident_name}</td>
                  <td className="px-5 py-3">{payment.fee_type_name}</td>
                  <td className="px-5 py-3">{formatRupiah(payment.amount)}</td>
                  <td className="px-5 py-3">{payment.months_covered} mo.</td>
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
                  <td className="px-5 py-3 text-gray-500">
                    {payment.paid_at
                      ? format(new Date(payment.paid_at), 'dd MMM yyyy')
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-500 capitalize">
                    {payment.payment_method?.replace('_', ' ') ?? '—'}
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