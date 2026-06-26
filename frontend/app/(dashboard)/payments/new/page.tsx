// app/(dashboard)/payments/new/page.tsx
// Route: /payments/new

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreatePayment } from '@/app/hooks/usePayments';
import { PaymentForm, PaymentFormData } from '@/app/components/payments/PaymentForm';

export default function NewPaymentPage() {
  const router = useRouter();
  const createPayment = useCreatePayment();

  const handleSubmit = async (formData: PaymentFormData) => {
    await createPayment.mutateAsync({
      ...formData,
      amount: Number(formData.amount),
      months_covered: Number(formData.months_covered),
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

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <PaymentForm
          onSubmit={handleSubmit}
          isPending={createPayment.isPending}
          submitLabel="Save Payment"
        />
      </div>
    </div>
  );
}