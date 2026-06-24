// app/(dashboard)/reports/[month]/page.tsx
// Route: /reports/:month  (e.g. /reports/2025-01)

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useMonthlyDetail, usePaymentStatus } from '@/app/hooks/useReports';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

export default function MonthlyDetailPage() {
  const { month } = useParams<{ month: string }>();
  const { data: detail, isLoading } = useMonthlyDetail(month);
  const { data: statusData } = usePaymentStatus(month);

  if (isLoading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!detail) return <div className="p-8 text-gray-400">No data for {month}</div>;

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <Link href="/reports" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Reports
        </Link>
        <h1 className="text-2xl font-bold text-black">Report — {month}</h1>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-600" />
            <p className="text-sm text-green-700 font-medium">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {formatRupiah(detail.income.total)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {detail.income.paid_count} paid · {detail.income.unpaid_count} unpaid
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-red-600" />
            <p className="text-sm text-red-700 font-medium">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {formatRupiah(detail.expenses.total)}
          </p>
        </div>
        <div className={`rounded-xl p-5 border ${
          detail.balance >= 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-sm font-medium mb-1 ${
            detail.balance >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>
            Net Balance
          </p>
          <p className={`text-2xl font-bold ${
            detail.balance >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>
            {formatRupiah(detail.balance)}
          </p>
        </div>
      </div>

      {/* Payment Status per House */}
      {statusData && (
        <div className="bg-white rounded-xl border">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-neutral-700">Payment Status per House</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">House</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Resident</th>
                  {statusData.houses[0]?.fee_statuses.map(f => (
                    <th key={f.fee_type_id} className="px-5 py-3 text-left font-medium text-gray-500">
                      {f.fee_type_name}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {statusData.houses.map(house => (
                  <tr key={house.house_id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/houses/${house.house_id}`} className="text-blue-600 hover:underline">
                        {house.house_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{house.resident_name}</td>
                    {house.fee_statuses.map(fee => (
                      <td key={fee.fee_type_id} className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          fee.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : fee.status === 'partial'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {fee.status === 'paid'
                            ? `✓ ${formatRupiah(fee.paid_amount)}`
                            : fee.status === 'partial'
                            ? `~ ${formatRupiah(fee.paid_amount)}`
                            : '✗ Unpaid'}
                        </span>
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      {house.all_paid ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ All Paid
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
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

      {/* Income Detail */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-green-700">Income Details</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-500">House</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Resident</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Fee Type</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Paid At</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {detail.income.items.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-neutral-700">{item.house_number}</td>
                <td className="px-5 py-3 text-neutral-700">{item.resident_name}</td>
                <td className="px-5 py-3 text-neutral-700">{item.fee_type}</td>
                <td className="px-5 py-3 text-neutral-700">{formatRupiah(item.amount)}</td>
                <td className="px-5 py-3 text-neutral-700">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{item.paid_at ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expense Detail */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-red-600">Expense Details</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {detail.expenses.items.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-neutral-700">{item.title}</td>
                <td className="px-5 py-3 capitalize text-neutral-700">{item.category}</td>
                <td className="px-5 py-3 text-red-600 font-medium">
                  {formatRupiah(item.amount)}
                </td>
                <td className="px-5 py-3 text-gray-500">{item.expense_date}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-gray-50">
            <tr>
              <td colSpan={2} className="px-5 py-3 text-right font-medium text-gray-600">
                Total
              </td>
              <td className="px-5 py-3 font-bold text-red-600">
                {formatRupiah(detail.expenses.total)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}