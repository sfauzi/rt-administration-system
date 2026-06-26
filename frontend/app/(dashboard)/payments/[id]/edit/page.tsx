// app/(dashboard)/payments/[id]/edit/page.tsx
// Route: /payments/:id/edit

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';
import { usePayment, useUpdatePayment } from '@/app/hooks/usePayments';
import { PaymentForm, PaymentFormData } from '@/app/components/payments/PaymentForm';

interface EditPaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPaymentPage({ params }: EditPaymentPageProps) {
  const router = useRouter();
  // Unwrap params Promise dengan React.use()
  const { id } = React.use(params);
  const [error, setError] = useState<string | null>(null);
  
  const { data: paymentData, isLoading } = usePayment(id);
  const updatePayment = useUpdatePayment(id);

  const payment = paymentData?.data;

  const handleSubmit = async (formData: PaymentFormData) => {
    try {
      setError(null);
      await updatePayment.mutateAsync({
        ...formData,
        amount: Number(formData.amount),
        months_covered: Number(formData.months_covered),
      });
      router.push('/payments');
    } catch (err: any) {
      // Handle the error
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update payment';
      setError(errorMessage);
      
      // Re-throw to let the form know about the error
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="h-64 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <p className="text-gray-500">Payment not found</p>
            <Link
              href="/payments"
              className="inline-block mt-4 text-sm text-blue-600 hover:underline"
            >
              ← Back to Payments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prepare initial data for form
  const initialData = {
    house_id: payment.house_id,
    resident_id: payment.resident_id,
    fee_type_id: payment.fee_type_id,
    amount: String(payment.amount),
    billing_month: payment.billing_month,
    months_covered: String(payment.months_covered),
    status: payment.status,
    paid_at: payment.paid_at || '',
    payment_method: payment.payment_method || 'cash',
    receipt_number: payment.receipt_number || '',
    notes: payment.notes || '',
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Payment</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Update payment record for {payment.house_number || 'house'}
          </p>
        </div>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <PaymentForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isPending={updatePayment.isPending}
          submitLabel="Update Payment"
          error={error}
        />
      </div>
    </div>
  );
}