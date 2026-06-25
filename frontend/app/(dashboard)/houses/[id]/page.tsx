'use client';

// app/(dashboard)/houses/[id]/page.tsx
// Route: /houses/:id

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Home, User, UserPlus, LogOut,
  CheckCircle2, CreditCard, ChevronRight, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useHouse, useAssignResident, useMoveOut, useHouseResidents } from '@/app/hooks/useHouses';
import { useResidents } from '@/app/hooks/useResidents';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Resident {
  id: string;
  full_name: string;
  nik?: string;
  phone?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface HistoryRecord {
  id: string;
  resident_id: string;
  house_id: string;
  move_in_date: string;
  move_out_date: string | null;
  is_current: boolean;
  resident: Resident;
  created_at?: string;
  updated_at?: string;
}

// ── Shared input style ──────────────────────────────────────────────────────
const inputCls = `w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
  transition-colors`;

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

export default function HouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: houseData, isLoading } = useHouse(id);
  const { data: historyData } = useHouseResidents(id); // ✅ FIX: Separate hook for history
  const { data: residentsData } = useResidents({ is_active: true });
  const assignMutation = useAssignResident(id);
  const moveOutMutation = useMoveOut(id);

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({
    resident_id: '',
    move_in_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const house = houseData?.data;
  const history: HistoryRecord[] = historyData?.data ?? []; // ✅ FIX: Use historyData
  const availableResidents = residentsData?.data ?? [];

  const handleAssign = async () => {
    await assignMutation.mutateAsync(assignForm);
    setShowAssignForm(false);
    setAssignForm({ resident_id: '', move_in_date: format(new Date(), 'yyyy-MM-dd') });
  };

  const handleMoveOut = async () => {
    if (!confirm('Confirm move out for current resident?')) return;
    await moveOutMutation.mutateAsync({ move_out_date: format(new Date(), 'yyyy-MM-dd') });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-3xl space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <p className="text-sm text-gray-400">House not found</p>
      </div>
    );
  }

  const isOccupied = house.occupancy_status === 'occupied';

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div>
          <Link
            href="/houses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold
                       text-blue-500 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to Houses
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-1">
                House Detail
              </p>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                House {house.house_number}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{house.address}</p>
            </div>

            {/* Action button */}
            {isOccupied ? (
              <button
                onClick={handleMoveOut}
                disabled={moveOutMutation.isPending}
                className="inline-flex items-center gap-2 bg-white border border-amber-200
                           text-amber-700 hover:bg-amber-50 px-4 py-2 rounded-lg text-sm
                           font-medium transition-colors shadow-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {moveOutMutation.isPending
                  ? <Loader2 size={15} className="animate-spin" />
                  : <LogOut size={15} />
                }
                Move Out
              </button>
            ) : (
              <button
                onClick={() => setShowAssignForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                           text-white px-4 py-2 rounded-lg text-sm font-medium
                           transition-colors shadow-sm"
              >
                <UserPlus size={15} />
                Assign Resident
              </button>
            )}
          </div>
        </div>

        {/* ── Info Cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className={labelCls}>Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                isOccupied ? 'bg-blue-500' : 'bg-slate-300'
              }`} />
              <p className={`text-base font-bold capitalize ${
                isOccupied ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {house.occupancy_status}
              </p>
            </div>
          </div>

          {/* House Type */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className={labelCls}>House Type</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
              house.house_type === 'permanent'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {house.house_type}
            </span>
          </div>

          {/* Current Resident */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className={labelCls}>Current Resident</p>
            <div className="flex items-center gap-1.5 mt-1">
              <User size={14} className={house.current_resident ? 'text-blue-400' : 'text-slate-300'} />
              <p className={`text-sm font-semibold truncate ${
                house.current_resident ? 'text-gray-800' : 'text-slate-400'
              }`}>
                {house.current_resident?.full_name ?? 'Vacant'}
              </p>
            </div>
          </div>

        </div>

        {/* ── Assign Resident Form ────────────────────────────────────────────── */}
        {showAssignForm && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">

            {/* Form header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3
                            bg-blue-50/50">
              <span className="p-2 rounded-xl bg-blue-100">
                <UserPlus size={16} className="text-blue-600" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800 tracking-tight">Assign New Resident</p>
                <p className="text-xs text-gray-400 mt-0.5">Select a resident and set move-in date</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">

                {/* Resident select */}
                <div>
                  <label className={labelCls}>Resident</label>
                  <select
                    value={assignForm.resident_id}
                    onChange={e => setAssignForm(f => ({ ...f, resident_id: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Select resident...</option>
                    {availableResidents.map((r: Resident) => (
                      <option key={r.id} value={r.id}>{r.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Move-in date */}
                <div>
                  <label className={labelCls}>Move-in Date</label>
                  <input
                    type="date"
                    value={assignForm.move_in_date}
                    onChange={e => setAssignForm(f => ({ ...f, move_in_date: e.target.value }))}
                    className={inputCls}
                  />
                </div>

              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600
                             border border-slate-200 rounded-xl hover:bg-slate-50
                             transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assignMutation.isPending || !assignForm.resident_id}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                             text-white px-5 py-2.5 rounded-xl text-sm font-semibold
                             transition-colors shadow-sm
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assignMutation.isPending
                    ? <><Loader2 size={14} className="animate-spin" /> Assigning...</>
                    : <><CheckCircle2 size={14} /> Confirm</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Resident History ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50">
              <Home size={16} className="text-blue-500" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800 tracking-tight">Resident History</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {history.length > 0
                  ? `${history.length} record${history.length > 1 ? 's' : ''}`
                  : 'No records yet'}
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl bg-slate-100">
                <User size={22} className="text-slate-300" />
              </div>
              <p className="text-sm text-gray-400">No resident history yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {history.map((record: HistoryRecord) => (
                <div key={record.id}
                     className="px-6 py-4 flex items-center justify-between
                                hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {record.resident.full_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {format(new Date(record.move_in_date), 'dd MMM yyyy')}
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
          )}
        </div>

        {/* ── Payment History Link ────────────────────────────────────────────── */}
        <Link
          href={`/houses/${id}/payments`}
          className="flex items-center justify-between bg-white rounded-2xl
                     border border-slate-100 shadow-sm p-5
                     hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50">
              <CreditCard size={16} className="text-blue-500" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800 tracking-tight">
                Payment History
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                See all iuran records for this house
              </p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-slate-300 group-hover:text-blue-400 transition-colors"
          />
        </Link>

      </div>
    </div>
  );
}