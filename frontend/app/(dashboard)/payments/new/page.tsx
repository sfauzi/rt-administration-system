// app/(dashboard)/payments/new/page.tsx
// Route: /payments/new

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useHouses } from '@/app/hooks/useHouses';
import { useFeeTypes } from '@/app/hooks/useFeetypes';
import { useCreatePayment } from '@/app/hooks/usePayments';

// Define interfaces matching the global types
interface House {
  id: string;
  house_number: string;
  address?: string;
  house_type?: string;
  occupancy_status: string;
  current_resident?: {  // Made optional with '?'
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

export default function NewPaymentPage() {
  const router = useRouter();
  const { data: housesData } = useHouses({ occupancy_status: 'occupied' });
  const { data: feeTypesData } = useFeeTypes();
  const createPayment = useCreatePayment();

  const houses = housesData?.data ?? [];
  const feeTypes = feeTypesData?.data ?? [];

  const [form, setForm] = useState({
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
  });

  const selectedHouse = houses.find((h: House) => h.id === form.house_id);
  const selectedFeeType = feeTypes.find((f: FeeType) => f.id === form.fee_type_id);

  const handleHouseChange = (houseId: string) => {
    const house = houses.find((h: House) => h.id === houseId);
    setForm(f => ({
      ...f,
      house_id: houseId,
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
      amount: Number(form.amount),
      months_covered: Number(form.months_covered),
    });
    router.push('/payments');
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <Link href="/payments" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Payments
        </Link>
        <h1 className="text-2xl font-bold text-black">Record Payment</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
        {/* House */}
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700">House *</label>
          <select
            value={form.house_id}
            onChange={e => handleHouseChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
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

        {selectedHouse?.current_resident && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-neutral-600">
            <strong>Resident:</strong> {selectedHouse.current_resident.full_name}
            {' · '}
            <span className="capitalize">{selectedHouse.current_resident.resident_type}</span>
          </div>
        )}

        {/* Fee Type */}
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700">Fee Type *</label>
          <select
            value={form.fee_type_id}
            onChange={e => handleFeeTypeChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
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

        {/* Months + Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Months Covered</label>
            <select
              value={form.months_covered}
              onChange={e => handleMonthsChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months (1 year)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Amount (Rp)</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
              required
            />
          </div>
        </div>

        {/* Billing Month + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Billing Month *</label>
            <input
              type="month"
              value={form.billing_month}
              onChange={e => setForm(f => ({ ...f, billing_month: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Payment Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Paid At + Method */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Payment Date</label>
            <input
              type="date"
              value={form.paid_at}
              onChange={e => setForm(f => ({ ...f, paid_at: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700">Payment Method</label>
            <select
              value={form.payment_method}
              onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700">Receipt Number</label>
          <input
            type="text"
            value={form.receipt_number}
            onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value }))}
            placeholder="Optional"
            className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-700">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={createPayment.isPending}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {createPayment.isPending ? 'Saving...' : 'Save Payment'}
        </button>
      </form>
    </div>
  );
}