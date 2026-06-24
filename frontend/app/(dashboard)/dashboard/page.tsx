// app/(dashboard)/dashboard/page.tsx
// Route: /dashboard

'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useMonthlySummary } from '@/app/hooks/useReports';
import { usePaymentStatus } from '@/app/hooks/useReports';
import { format } from 'date-fns';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const currentMonth = format(new Date(), 'yyyy-MM');

  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(year);
  const { data: paymentStatus } = usePaymentStatus(currentMonth);

  const paidCount = paymentStatus?.houses.filter(h => h.all_paid).length ?? 0;
  const unpaidCount = (paymentStatus?.houses.length ?? 0) - paidCount;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Financial overview for RT Administration</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500">Total Income {year}</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatRupiah(summary.summary.total_income)}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500">Total Expenses {year}</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatRupiah(summary.summary.total_expenses)}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-gray-500">Net Balance {year}</p>
            <p className={`text-2xl font-bold mt-1 ${
              summary.summary.net_balance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              {formatRupiah(summary.summary.net_balance)}
            </p>
          </div>
        </div>
      )}

      {/* Monthly Chart */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 text-neutral-700">Monthly Income vs Expenses</h2>
        {summaryLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary?.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_label" />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Balance Line Chart */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 text-neutral-700">Monthly Balance Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={summary?.data ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month_label" />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatRupiah(v)} />
            <Line
              type="monotone" dataKey="balance" stroke="#3b82f6"
              strokeWidth={2} dot={{ r: 4 }} name="Balance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* This Month Payment Status */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-1 text-neutral-700">Payment Status — {currentMonth}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {paidCount} fully paid · {unpaidCount} pending
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {paymentStatus?.houses.map(h => (
            <div
              key={h.house_id}
              className={`rounded-lg border p-3 ${
                h.all_paid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <p className="font-semibold text-sm text-neutral-700">{h.house_number}</p>
              <p className="text-xs text-gray-500 truncate">{h.resident_name}</p>
              <p className={`text-xs font-medium mt-1 ${
                h.all_paid ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {h.all_paid ? '✓ Paid' : '⏳ Pending'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}