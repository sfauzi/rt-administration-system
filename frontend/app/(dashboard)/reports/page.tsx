// app/(dashboard)/reports/page.tsx
// Route: /reports

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { useMonthlySummary } from '@/app/hooks/useReports';
import { format } from 'date-fns';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

function SummaryCard({
  label, value, color,
}: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{formatRupiah(value)}</p>
    </div>
  );
}

// Define the chart data interface
interface ChartData {
  month: string;
  month_label: string;
  income: number;
  expenses: number;
  balance: number;
}

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: summary, isLoading } = useMonthlySummary(year);

  const chartData = summary?.data ?? [];
  const currentMonth = format(new Date(), 'yyyy-MM');

  // Custom formatter for tooltips that handles any value and name types
  const formatTooltipValue = (value: any, name: any) => {
    const num = Number(value);
    return !isNaN(num) && value !== null && value !== ''
      ? [formatRupiah(num), name || '']
      : ['-', name || ''];
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Financial Reports</h1>
          <p className="text-gray-500">Annual income vs expense overview</p>
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

      {/* Annual Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-5">
          <SummaryCard
            label={`Total Income ${year}`}
            value={summary.summary.total_income}
            color="text-green-600"
          />
          <SummaryCard
            label={`Total Expenses ${year}`}
            value={summary.summary.total_expenses}
            color="text-red-600"
          />
          <SummaryCard
            label={`Net Balance ${year}`}
            value={summary.summary.net_balance}
            color={summary.summary.net_balance >= 0 ? 'text-blue-600' : 'text-red-600'}
          />
        </div>
      )}

      {/* Bar Chart: Income vs Expenses */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4 text-gray-800">Monthly Income vs Expenses — {year}</h2>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month_label" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={formatTooltipValue}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line Chart: Running Balance */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4 text-gray-800">Monthly Net Balance — {year}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month_label" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={formatTooltipValue}
              contentStyle={{ fontSize: 12 }}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
              name="Net Balance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Detail Links */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-neutral-500">Monthly Breakdown</h2>
          <p className="text-sm text-gray-500">Click a month to see detailed income & expense report</p>
        </div>
        <div className="divide-y">
          {chartData.map((row: ChartData) => (
            <Link
              key={row.month}
              href={`/reports/${row.month}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`text-sm font-semibold w-8 ${row.month === currentMonth ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                  {row.month_label}
                </span>
                {row.month === currentMonth && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-center gap-8 text-sm">
                <span className="text-green-600">+{formatRupiah(row.income)}</span>
                <span className="text-red-500">-{formatRupiah(row.expenses)}</span>
                <span className={`font-semibold w-28 text-right ${row.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                  {formatRupiah(row.balance)}
                </span>
                <span className="text-gray-300 text-xs">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}