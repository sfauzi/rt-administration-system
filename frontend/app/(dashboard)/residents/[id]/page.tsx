// app/(dashboard)/residents/[id]/page.tsx
// Route: /residents/:id

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Phone, CreditCard, Calendar, User } from 'lucide-react';
import { useResident } from '@/app/hooks/useResidents';
import { usePayments } from '@/app/hooks/usePayments';
import { format } from 'date-fns';

// Define interfaces matching the global types
interface Payment {
  id: string;
  amount: number;
  billing_month: string;
  months_covered: number;
  status: 'paid' | 'partial' | 'unpaid';
  fee_type_name?: string;  // Made optional
  paid_at: string | null;
  payment_method: string | null;
  receipt_number?: string | null;
  notes?: string | null;
  created_at?: string;  // Made optional
  updated_at?: string;  // Made optional
}

interface HouseResident {
  id: string;
  move_in_date: string;
  move_out_date: string | null;
  is_current: boolean;
  house: {
    id: string;
    house_number: string;
  };
}

interface Resident {
  id: string;
  full_name: string;
  resident_type: 'permanent' | 'contract';
  phone_number: string | null;
  is_married: boolean;
  is_active: boolean;
  contract_start_date: string | null;
  contract_end_date: string | null;
  id_card_photo_url: string | null;
  house_residents: HouseResident[];
  created_at?: string;
  updated_at?: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: residentData, isLoading } = useResident(id);
  const { data: paymentsData } = usePayments({ resident_id: id });

  const resident = residentData?.data as Resident | undefined;
  const payments = paymentsData?.data ?? [];
  const houseHistory = resident?.house_residents ?? [];

  if (isLoading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!resident) return <div className="p-8 text-gray-400">Resident not found</div>;

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <Link href="/residents" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Residents
        </Link>
        <h1 className="text-2xl font-bold text-neutral-700">{resident.full_name}</h1>
        <p className="text-gray-500 capitalize">{resident.resident_type} resident</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border p-6 flex gap-6">
        {/* KTP Photo */}
        <div className="shrink-0">
          {resident.id_card_photo_url ? (
            <img
              src={resident.id_card_photo_url}
              alt="KTP Photo"
              className="w-28 h-28 rounded-xl object-cover border"
            />
          ) : (
            <div className="w-28 h-28 rounded-xl bg-gray-100 flex items-center justify-center">
              <User size={40} className="text-gray-300" />
            </div>
          )}
          <p className="text-xs text-center text-gray-400 mt-1">KTP Photo</p>
        </div>

        {/* Details */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone size={13} className="text-gray-400" />
              <p className="text-sm text-neutral-700">{resident.phone_number ?? '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <p className="text-sm mt-0.5 text-neutral-700">
              {resident.is_married ? '💍 Married' : 'Single'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Resident Type</p>
            <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${
              resident.resident_type === 'permanent'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {resident.resident_type}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
            <p className="text-sm mt-0.5 text-neutral-700">{resident.is_active ? '✅ Yes' : '❌ No'}</p>
          </div>
          {resident.resident_type === 'contract' && (
            <>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contract Start</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar size={13} className="text-gray-400" />
                  <p className="text-sm">{resident.contract_start_date ?? '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contract End</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar size={13} className="text-gray-400" />
                  <p className="text-sm">{resident.contract_end_date ?? '—'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* House History */}
      {houseHistory.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="p-5 border-b flex items-center gap-2">
            <Home size={16} className="text-gray-500" />
            <h2 className="font-semibold">House History</h2>
          </div>
          <div className="divide-y">
            {houseHistory.map((record: HouseResident) => (
              <div key={record.id} className="p-5 flex items-center justify-between">
                <div>
                  <Link
                    href={`/houses/${record.house?.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    House {record.house?.house_number}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {record.move_in_date
                      ? format(new Date(record.move_in_date), 'dd MMM yyyy')
                      : '?'}
                    {' → '}
                    {record.move_out_date
                      ? format(new Date(record.move_out_date), 'dd MMM yyyy')
                      : 'Present'}
                  </p>
                </div>
                {record.is_current && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b flex items-center gap-2">
          <CreditCard size={16} className="text-gray-500" />
          <h2 className="font-semibold text-neutral-700">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No payment records found.</p>
        ) : (
          <div className="divide-y">
            {payments.map((payment: Payment) => (
              <div key={payment.id} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-neutral-700">{payment.fee_type_name || '—'}</p>
                  <p className="text-xs text-gray-500">
                    {payment.billing_month}
                    {payment.months_covered > 1 && ` (${payment.months_covered} months)`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-neutral-600">{formatRupiah(payment.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    payment.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : payment.status === 'partial'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}