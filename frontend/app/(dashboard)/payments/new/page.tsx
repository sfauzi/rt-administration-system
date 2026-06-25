// app/(dashboard)/payments/new/page.tsx
// Route: /payments/new

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, TrendingUp, Save, User, Receipt } from 'lucide-react';
import Link from 'next/link';
import { useHouses } from '@/app/hooks/useHouses';
import { useFeeTypes } from '@/app/hooks/useFeetypes';
import { useCreatePayment } from '@/app/hooks/usePayments';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface House {
  id: string;
  house_number: string;
  address?: string;
  house_type?: string;
  occupancy_status: string;
  current_resident?: {
    id: string;
    full_name: string;
    resident_type: string;
  } | null;
}

interface FeeType {
  id: string;
  name: string;
  amount: number;
  description: string | null;
  is_active: boolean;
}

type PaymentStatus = 'paid' | 'unpaid' | 'partial';

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = `w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
  transition-colors`;

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

// ── Section divider ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-blue-500">
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export default function NewPaymentPage() {
  const router = useRouter();
  const { data: housesData } = useHouses({ occupancy_status: 'occupied' });
  const { data: feeTypesData } = useFeeTypes();
  const createPayment = useCreatePayment();

  const houses   = housesData?.data  ?? [];
  const feeTypes = feeTypesData?.data ?? [];

  const [form, setForm] = useState({
    house_id:       '',
    resident_id:    '',
    fee_type_id:    '',
    amount:         '',
    billing_month:  format(new Date(), 'yyyy-MM'),
    months_covered: '1',
    status:         'paid' as PaymentStatus,
    paid_at:        format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'cash',
    receipt_number: '',
    notes:          '',
  });

  const selectedHouse   = houses.find((h: House) => h.id === form.house_id);
  const selectedFeeType = feeTypes.find((f: FeeType) => f.id === form.fee_type_id);

  const handleHouseChange = (houseId: string) => {
    const house = houses.find((h: House) => h.id === houseId);
    setForm(f => ({
      ...f,
      house_id:    houseId,
      resident_id: house?.current_resident?.id ?? '',
    }));
  };

  const handleFeeTypeChange = (feeTypeId: string) => {
    const feeType = feeTypes.find((f: FeeType) => f.id === feeTypeId);
    setForm(f => ({
      ...f,
      fee_type_id: feeTypeId,
      amount: String((feeType?.amount ?? 0) * Number(f.months_covered)),
    }));
  };

  const handleMonthsChange = (months: string) => {
    setForm(f => ({
      ...f,
      months_covered: months,
      amount: String((selectedFeeType?.amount ?? 0) * Number(months)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment.mutateAsync({
      ...form,
      amount:         Number(form.amount),
      months_covered: Number(form.months_covered),
      status:         form.status as PaymentStatus,
    });
    router.push('/payments');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <Link
            href="/payments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold
                       text-blue-500 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to Payments
          </Link>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            RT Administration
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Record Payment</h1>
          <p className="text-sm text-gray-400 mt-0.5">Register an incoming payment from a resident</p>
        </div>

        {/* ── Form Card ──────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50">
              <TrendingUp size={16} className="text-blue-500" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800 tracking-tight">Payment Details</p>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the information below</p>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* ── House & Resident ───────────────────────────────────────── */}
            <SectionLabel>House & Resident</SectionLabel>

            {/* House */}
            <div>
              <label className={labelCls}>
                House <span className="text-red-400">*</span>
              </label>
              <select
                value={form.house_id}
                onChange={e => handleHouseChange(e.target.value)}
                className={inputCls}
                required
              >
                <option value="">Select house...</option>
                {houses.map((h: House) => (
                  <option key={h.id} value={h.id}>
                    {h.house_number} — {h.current_resident?.full_name ?? 'Vacant'}
                  </option>
                ))}
              </select>
            </div>

            {/* Resident info pill */}
            {selectedHouse?.current_resident && (
              <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100
                              rounded-xl px-4 py-3">
                <span className="p-1.5 rounded-lg bg-blue-100">
                  <User size={13} className="text-blue-600" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-blue-800">
                    {selectedHouse.current_resident.full_name}
                  </p>
                  <p className="text-xs text-blue-500 capitalize mt-0.5">
                    {selectedHouse.current_resident.resident_type}
                  </p>
                </div>
              </div>
            )}

            {/* ── Fee & Amount ───────────────────────────────────────────── */}
            <SectionLabel>Fee & Amount</SectionLabel>

            {/* Fee Type */}
            <div>
              <label className={labelCls}>
                Fee Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.fee_type_id}
                onChange={e => handleFeeTypeChange(e.target.value)}
                className={inputCls}
                required
              >
                <option value="">Select fee type...</option>
                {feeTypes.map((f: FeeType) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — Rp {f.amount.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            {/* Months Covered + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Months Covered</label>
                <select
                  value={form.months_covered}
                  onChange={e => handleMonthsChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months (1 year)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Amount (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* ── Billing & Status ───────────────────────────────────────── */}
            <SectionLabel>Billing & Status</SectionLabel>

            {/* Billing Month + Payment Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Billing Month <span className="text-red-400">*</span>
                </label>
                <input
                  type="month"
                  value={form.billing_month}
                  onChange={e => setForm(f => ({ ...f, billing_month: e.target.value }))}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Payment Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as PaymentStatus }))}
                  className={inputCls}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>

            {/* Payment Date + Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Payment Date</label>
                <input
                  type="date"
                  value={form.paid_at}
                  onChange={e => setForm(f => ({ ...f, paid_at: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                  className={inputCls}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="qris">QRIS</option>
                </select>
              </div>
            </div>

            {/* ── Optional Info ──────────────────────────────────────────── */}
            <SectionLabel>Optional Info</SectionLabel>

            {/* Receipt Number */}
            <div>
              <label className={labelCls}>
                Receipt Number
              </label>
              <div className="relative">
                <Receipt size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                              text-gray-300 pointer-events-none" />
                <input
                  type="text"
                  value={form.receipt_number}
                  onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value }))}
                  placeholder="Optional"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Optional notes..."
                className={inputCls}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Submit */}
            <button
              type="submit"
              disabled={createPayment.isPending}
              className="w-full inline-flex items-center justify-center gap-2
                         bg-blue-600 hover:bg-blue-700 text-white
                         py-2.5 rounded-xl font-semibold text-sm
                         transition-colors shadow-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={15} />
              {createPayment.isPending ? 'Saving...' : 'Save Payment'}
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}