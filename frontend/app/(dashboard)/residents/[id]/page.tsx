// app/(dashboard)/residents/[id]/page.tsx
// Route: /residents/:id

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Home, Phone, CreditCard, Calendar,
  User, BadgeCheck, XCircle, CheckCircle2, MinusCircle, Clock,
} from 'lucide-react';
import { useResident } from '@/app/hooks/useResidents';
import { usePayments } from '@/app/hooks/usePayments';
import { format } from 'date-fns';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  amount: number;
  billing_month: string;
  months_covered: number;
  status: 'paid' | 'partial' | 'unpaid';
  fee_type_name?: string;
  paid_at: string | null;
  payment_method: string | null;
  receipt_number?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
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

// ── Detail field ──────────────────────────────────────────────────────────────
function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Payment['status'] }) {
  if (status === 'paid') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                     rounded-full font-semibold bg-blue-50 text-blue-700">
      <CheckCircle2 size={10} /> Paid
    </span>
  );
  if (status === 'partial') return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                     rounded-full font-semibold bg-amber-50 text-amber-700">
      <MinusCircle size={10} /> Partial
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                     rounded-full font-semibold bg-slate-100 text-slate-500">
      <Clock size={10} /> Unpaid
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: residentData, isLoading } = useResident(id);
  const { data: paymentsData } = usePayments({ resident_id: id });

  const resident    = residentData?.data as Resident | undefined;
  const payments    = paymentsData?.data ?? [];
  const houseHistory = resident?.house_residents ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-3xl space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <p className="text-sm text-gray-400">Resident not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl space-y-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div>
          <Link
            href="/residents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold
                       text-blue-500 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to Residents
          </Link>
          <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
            Resident Profile
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {resident.full_name}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">
            {resident.resident_type} resident
          </p>
        </div>

        {/* ── Profile Card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50">
              <User size={16} className="text-blue-500" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800 tracking-tight">Personal Information</p>
              <p className="text-xs text-gray-400 mt-0.5">Identity and contact details</p>
            </div>
          </div>

          <div className="p-6 flex gap-6">
            {/* KTP Photo */}
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              {resident.id_card_photo_url ? (
                <img
                  src={resident.id_card_photo_url}
                  alt="KTP Photo"
                  className="w-28 h-28 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-blue-50 border border-blue-100
                                flex items-center justify-center">
                  <User size={36} className="text-blue-300" />
                </div>
              )}
              <p className="text-xs text-gray-400 font-medium">KTP Photo</p>
            </div>

            {/* Detail fields grid */}
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-5">

              <DetailField label="Phone">
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-gray-400 shrink-0" />
                  <span className="font-mono">{resident.phone_number ?? '—'}</span>
                </div>
              </DetailField>

              <DetailField label="Marital Status">
                <div className="flex items-center gap-1.5">
                  {resident.is_married ? (
                    <>
                      <BadgeCheck size={13} className="text-blue-500" />
                      <span>Married</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Single</span>
                  )}
                </div>
              </DetailField>

              <DetailField label="Resident Type">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                  resident.resident_type === 'permanent'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {resident.resident_type}
                </span>
              </DetailField>

              <DetailField label="Account Status">
                <div className="flex items-center gap-1.5">
                  {resident.is_active ? (
                    <>
                      <CheckCircle2 size={13} className="text-blue-500" />
                      <span className="text-blue-600 font-semibold">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={13} className="text-slate-400" />
                      <span className="text-slate-400">Inactive</span>
                    </>
                  )}
                </div>
              </DetailField>

              {resident.resident_type === 'contract' && (
                <>
                  <DetailField label="Contract Start">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400 shrink-0" />
                      <span className="font-mono text-xs">
                        {resident.contract_start_date ?? '—'}
                      </span>
                    </div>
                  </DetailField>

                  <DetailField label="Contract End">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400 shrink-0" />
                      <span className="font-mono text-xs">
                        {resident.contract_end_date ?? '—'}
                      </span>
                    </div>
                  </DetailField>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ── House History ─────────────────────────────────────────────────── */}
        {houseHistory.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-blue-50">
                <Home size={16} className="text-blue-500" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">House History</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {houseHistory.length} record{houseHistory.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {houseHistory.map((record: HouseResident) => (
                <div key={record.id} className="px-6 py-4 flex items-center justify-between
                                                 hover:bg-slate-50 transition-colors">
                  <div>
                    <Link
                      href={`/houses/${record.house?.id}`}
                      className="font-bold text-blue-600 hover:text-blue-800
                                 hover:underline transition-colors text-sm"
                    >
                      House {record.house?.house_number}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
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
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5
                                     rounded-full font-semibold bg-blue-50 text-blue-700">
                      <CheckCircle2 size={10} />
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Payment History ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50">
              <CreditCard size={16} className="text-blue-500" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800 tracking-tight">Payment History</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {payments.length > 0
                  ? `${payments.length} record${payments.length > 1 ? 's' : ''}`
                  : 'No records yet'}
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl bg-slate-100">
                <CreditCard size={22} className="text-slate-300" />
              </div>
              <p className="text-sm text-gray-400">No payment records found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {payments.map((payment: Payment) => (
                <div key={payment.id}
                     className="px-6 py-4 flex items-center justify-between
                                hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {payment.fee_type_name || '—'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 font-mono">
                        {payment.billing_month}
                      </span>
                      {payment.months_covered > 1 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold
                                         bg-slate-100 text-slate-500">
                          {payment.months_covered} mo.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="font-bold text-sm text-gray-900">
                      {formatRupiah(payment.amount)}
                    </p>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}