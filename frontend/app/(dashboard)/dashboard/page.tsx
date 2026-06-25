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
import { TrendingUp, TrendingDown, Wallet, CheckCircle2, Clock } from 'lucide-react';

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

function formatRupiahShort(amount: number) {
  if (Math.abs(amount) >= 1_000_000)
    return `${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000)
    return `${(amount / 1_000).toFixed(0)}K`;
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

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthLabel = format(new Date(), 'MMMM yyyy');

  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(year);
  const { data: paymentStatus } = usePaymentStatus(currentMonth);

  const paidCount   = paymentStatus?.houses.filter(h => h.all_paid).length ?? 0;
  const unpaidCount = (paymentStatus?.houses.length ?? 0) - paidCount;
  const totalHouses = paymentStatus?.houses.length ?? 0;
  const paidPct     = totalHouses > 0 ? Math.round((paidCount / totalHouses) * 100) : 0;

  const netBalance  = summary?.summary.net_balance ?? 0;
  const isPositive  = netBalance >= 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Overview for {year}
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6
                        flex flex-col gap-4">
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6
                        flex flex-col gap-4">
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

        {/* Bar Chart — Income vs Expenses */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Income vs Expenses
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly comparison — {year}</p>
          </div>
          {summaryLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="space-y-2 w-full px-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary?.data ?? []} barGap={4} barCategoryGap="30%">
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
                <Bar dataKey="income"   fill="#3b82f6" name="Income"   radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#bfdbfe" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line Chart — Balance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Balance Trend
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly net — {year}</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={summary?.data ?? []}>
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
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#1d4ed8' }}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── Payment Status ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

        {/* Section header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-800 tracking-tight">
              Payment Status
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{currentMonthLabel}</p>
          </div>

          {/* Pill stats */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5
                             bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
              <CheckCircle2 size={12} />
              {paidCount} Paid
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5
                             bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
              <Clock size={12} />
              {unpaidCount} Pending
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {totalHouses > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Collection progress</span>
              <span className="font-semibold text-blue-600">{paidPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
          </div>
        )}

        {/* House grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {paymentStatus?.houses.map(h => (
            <div
              key={h.house_id}
              className={`rounded-xl border p-3 transition-colors ${
                h.all_paid
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <p className="font-bold text-sm text-gray-800 tracking-tight">
                {h.house_number}
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {h.resident_name}
              </p>
              <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold ${
                h.all_paid ? 'text-blue-600' : 'text-amber-600'
              }`}>
                {h.all_paid
                  ? <><CheckCircle2 size={11} /> Paid</>
                  : <><Clock size={11} /> Pending</>
                }
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}