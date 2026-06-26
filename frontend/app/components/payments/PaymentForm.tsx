// app/components/payments/PaymentForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TrendingUp, User, Receipt, Save, AlertCircle } from 'lucide-react';
import { useHouses } from '@/app/hooks/useHouses';
import { useFeeTypes } from '@/app/hooks/useFeetypes';

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

export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface PaymentFormData {
  house_id: string;
  resident_id: string;
  fee_type_id: string;
  amount: string;
  billing_month: string;
  months_covered: string;
  status: PaymentStatus;
  paid_at: string;
  payment_method: string;
  receipt_number: string;
  notes: string;
}

interface PaymentFormProps {
  initialData?: Partial<PaymentFormData>;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isPending?: boolean;
  submitLabel?: string;
  error?: string | null;
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = `w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
  transition-colors`;

const inputErrorCls = `w-full border border-red-300 bg-red-50 rounded-xl px-4 py-2.5
  text-sm text-red-700 placeholder-red-300
  focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400
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

export function PaymentForm({ 
  initialData, 
  onSubmit, 
  isPending = false,
  submitLabel = 'Save Payment',
  error = null
}: PaymentFormProps) {
  const { data: housesData } = useHouses({ occupancy_status: 'occupied' });
  const { data: feeTypesData } = useFeeTypes();

  const houses = housesData?.data ?? [];
  const feeTypes = feeTypesData?.data ?? [];

  const [form, setForm] = useState<PaymentFormData>({
    house_id: '',
    resident_id: '',
    fee_type_id: '',
    amount: '',
    billing_month: format(new Date(), 'yyyy-MM'),
    months_covered: '1',
    status: 'paid',
    paid_at: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'cash',
    receipt_number: '',
    notes: '',
    ...initialData,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedHouse = houses.find((h: House) => h.id === form.house_id);
  const selectedFeeType = feeTypes.find((f: FeeType) => f.id === form.fee_type_id);

  useEffect(() => {
    if (initialData) {
      setForm(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleHouseChange = (houseId: string) => {
    const house = houses.find((h: House) => h.id === houseId);
    setForm(f => ({
      ...f,
      house_id: houseId,
      resident_id: house?.current_resident?.id ?? '',
    }));
    // Clear field errors when changing house
    setFieldErrors({});
  };

  const handleFeeTypeChange = (feeTypeId: string) => {
    const feeType = feeTypes.find((f: FeeType) => f.id === feeTypeId);
    setForm(f => ({
      ...f,
      fee_type_id: feeTypeId,
      amount: String((feeType?.amount ?? 0) * Number(f.months_covered)),
    }));
    setFieldErrors({});
  };

  const handleMonthsChange = (months: string) => {
    setForm(f => ({
      ...f,
      months_covered: months,
      amount: String((selectedFeeType?.amount ?? 0) * Number(months)),
    }));
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    await onSubmit(form);
  };

  // Parse error message to show user-friendly error
  const getErrorMessage = (errorMsg: string | null): string => {
    if (!errorMsg) return '';
    
    // Check for duplicate payment error
    if (errorMsg.includes('already has a payment') || 
        errorMsg.includes('duplicate') ||
        errorMsg.includes('already exists')) {
      return 'This resident has already made a payment for this fee type in the selected billing month. Please check the payment records or choose a different month/fee type.';
    }
    
    // Check for validation errors
    if (errorMsg.includes('validation')) {
      return 'Please check all required fields and try again.';
    }
    
    // Check for network errors
    if (errorMsg.includes('network') || errorMsg.includes('connection')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Return generic error
    return errorMsg;
  };

  const displayError = getErrorMessage(error);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
        {/* ── Global Error Display ──────────────────────────────────────── */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Error</p>
              <p className="text-sm text-red-600">{displayError}</p>
            </div>
          </div>
        )}

        {/* ── Field-specific Error ──────────────────────────────────────── */}
        {fieldErrors.general && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">{fieldErrors.general}</p>
          </div>
        )}

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
            className={fieldErrors.house_id ? inputErrorCls : inputCls}
            required
          >
            <option value="">Select house...</option>
            {houses.map((h: House) => (
              <option key={h.id} value={h.id}>
                {h.house_number} — {h.current_resident?.full_name ?? 'Vacant'}
              </option>
            ))}
          </select>
          {fieldErrors.house_id && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.house_id}</p>
          )}
        </div>

        {/* Resident info pill */}
        {selectedHouse?.current_resident && (
          <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
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
            className={fieldErrors.fee_type_id ? inputErrorCls : inputCls}
            required
          >
            <option value="">Select fee type...</option>
            {feeTypes.map((f: FeeType) => (
              <option key={f.id} value={f.id}>
                {f.name} — Rp {f.amount.toLocaleString('id-ID')}
              </option>
            ))}
          </select>
          {fieldErrors.fee_type_id && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.fee_type_id}</p>
          )}
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
              className={fieldErrors.amount ? inputErrorCls : inputCls}
              required
            />
            {fieldErrors.amount && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.amount}</p>
            )}
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
              className={fieldErrors.billing_month ? inputErrorCls : inputCls}
              required
            />
            {fieldErrors.billing_month && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.billing_month}</p>
            )}
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
          <label className={labelCls}>Receipt Number</label>
          <div className="relative">
            <Receipt size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
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
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2
                     bg-blue-600 hover:bg-blue-700 text-white
                     py-2.5 rounded-xl font-semibold text-sm
                     transition-colors shadow-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={15} />
          {isPending ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}