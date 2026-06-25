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
import { TrendingUp, TrendingDown, Wallet, ArrowRight, ChevronRight } from 'lucide-react';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

function formatRupiahShort(amount: number) {
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return String(amount);
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-blue-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-medium text-gray-800">{formatRupiah(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

// ── Chart Data Interface ───────────────────────────────────────────────────────
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
  const netBalance = summary?.summary.net_balance ?? 0;
  const isPositive = netBalance >= 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Financial Reports
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Annual income vs expense overview — {year}
          </p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border border-blue-100 bg-white text-blue-700 font-medium
                     rounded-lg px-3 py-2 text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-300 cursor-pointer shadow-xs"
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
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
              {summary ? formatRupiah(summary.summary.total_income) : (
                <span className="block h-7 w-36 bg-slate-100 rounded animate-pulse" />
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">Collected in {year}</p>
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
              {summary ? formatRupiah(summary.summary.total_expenses) : (
                <span className="block h-7 w-36 bg-slate-100 rounded animate-pulse" />
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">Spent in {year}</p>
          </div>
          <div className="h-1 w-full bg-red-50 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-red-300 rounded-full" />
          </div>
        </div>

        {/* Net Balance */}
        <div className={`rounded-2xl shadow-sm p-6 flex flex-col gap-4
          ${isPositive
            ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white'
            : 'bg-gradient-to-br from-red-500 to-red-400 text-white'}`}
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
            <p className="text-2xl font-bold tracking-tight">
              {summary ? formatRupiah(netBalance) : (
                <span className="block h-7 w-36 bg-white/20 rounded animate-pulse" />
              )}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {isPositive ? 'Surplus' : 'Deficit'} for {year}
            </p>
          </div>
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-white/60 rounded-full" />
          </div>
        </div>

      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Income vs Expenses
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly comparison — {year}</p>
          </div>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="space-y-2 w-full px-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month_label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatRupiahShort}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 12 }}
                />
                <Bar dataKey="income" fill="#3b82f6" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#bfdbfe" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Balance Trend
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly net — {year}</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month_label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatRupiahShort}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e2e8f0' }} />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#1d4ed8' }}
                name="Net Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── Monthly Breakdown ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-gray-800 tracking-tight">
            Monthly Breakdown
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Select a month to view detailed income and expense records
          </p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {chartData.map((row: ChartData, idx: number) => {
            const isCurrent = row.month === currentMonth;
            const rowBalance = row.balance;
            const rowPositive = rowBalance >= 0;

            return (
              <Link
                key={row.month}
                href={`/reports/${row.month}`}
                className={`flex items-center justify-between px-6 py-4
                  transition-colors group
                  ${isCurrent
                    ? 'bg-blue-50/60 hover:bg-blue-50'
                    : 'hover:bg-slate-50'
                  }`}
              >
                {/* Left: index + month label */}
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-slate-300 w-5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                    {row.month_label}
                  </span>
                  {isCurrent && (
                    <span className="text-xs bg-blue-100 text-blue-600
                                     px-2 py-0.5 rounded-full font-semibold shrink-0">
                      Current
                    </span>
                  )}
                </div>

                {/* Right: figures + arrow */}
                <div className="flex items-center gap-6 text-sm shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400 mb-0.5">Income</p>
                    <p className="font-semibold text-blue-600">
                      +{formatRupiah(row.income)}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400 mb-0.5">Expenses</p>
                    <p className="font-semibold text-slate-400">
                      -{formatRupiah(row.expenses)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                    <p className={`font-bold ${rowPositive ? 'text-gray-900' : 'text-red-500'}`}>
                      {formatRupiah(rowBalance)}
                    </p>
                  </div>
                  <ChevronRight
                    size={15}
                    className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0"
                  />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}