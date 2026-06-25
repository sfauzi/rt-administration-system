// app/(dashboard)/houses/[id]/page.tsx
// Route: /houses/:id

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useHouse, useHouseResidents, useAssignResident, useMoveOut } from '@/app/hooks/useHouses';
import { useResidents } from '@/app/hooks/useResidents';
import { ArrowLeft, UserPlus, LogOut } from 'lucide-react';
import Link from 'next/link';

// Define the Resident interface with optional fields
interface Resident {
  id: string;
  full_name: string;
  nik?: string;
  phone?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Define the HistoryRecord interface
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

export default function HouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: houseData, isLoading } = useHouse(id);
  const { data: historyData } = useHouseResidents(id);
  const { data: residentsData } = useResidents({ is_active: true });
  const assignMutation = useAssignResident(id);
  const moveOutMutation = useMoveOut(id);

  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState({
    resident_id: '',
    move_in_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const house = houseData?.data;
  const history = historyData?.data ?? [];
  const availableResidents = residentsData?.data ?? [];

  if (isLoading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (!house) return <div className="p-8 text-gray-400">House not found</div>;

  const handleAssign = async () => {
    if (!assignForm.resident_id) return;
    await assignMutation.mutateAsync(assignForm);
    setShowAssignForm(false);
    setAssignForm({ resident_id: '', move_in_date: format(new Date(), 'yyyy-MM-dd') });
  };

  const handleMoveOut = async () => {
    if (!confirm('Mark current resident as moved out?')) return;
    await moveOutMutation.mutateAsync({
      move_out_date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/houses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} /> Back to Houses
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">House {house.house_number}</h1>
            <p className="text-gray-500">{house.address}</p>
          </div>
          <div className="flex gap-2">
            {house.occupancy_status === 'vacant' ? (
              <button
                onClick={() => setShowAssignForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                <UserPlus size={16} /> Assign Resident
              </button>
            ) : (
              <button
                onClick={handleMoveOut}
                className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm"
              >
                <LogOut size={16} /> Move Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
          <p className={`text-lg font-semibold mt-1 capitalize ${
            house.occupancy_status === 'occupied' ? 'text-green-600' : 'text-gray-400'
          }`}>{house.occupancy_status}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">House Type</p>
          <p className="text-lg font-semibold mt-1 capitalize text-neutral-700">{house.house_type}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Current Resident</p>
          <p className="text-lg font-semibold mt-1 text-neutral-700">
            {house.current_resident?.full_name ?? '—'}
          </p>
        </div>
      </div>

      {/* Assign Resident Form */}
      {showAssignForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold mb-4 text-neutral-800">Assign New Resident</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-600">Resident</label>
              <select
                value={assignForm.resident_id}
                onChange={e => setAssignForm(f => ({ ...f, resident_id: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
              >
                <option value="">Select resident...</option>
                {availableResidents.map((r: Resident) => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-600">Move-in Date</label>
              <input
                type="date"
                value={assignForm.move_in_date}
                onChange={e => setAssignForm(f => ({ ...f, move_in_date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm text-neutral-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAssign}
              disabled={assignMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowAssignForm(false)}
              className="border px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resident History */}
      <div className="bg-white rounded-xl border">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-neutral-700">Resident History</h2>
        </div>
        <div className="divide-y">
          {history.length === 0 && (
            <p className="p-5 text-sm text-gray-400">No resident history yet.</p>
          )}
          {history.map((record: HistoryRecord) => (
            <div key={record.id} className="p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-700">{record.resident.full_name}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(record.move_in_date), 'dd MMM yyyy')}
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

      {/* Payment Link */}
      <Link
        href={`/houses/${id}/payments`}
        className="block bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
      >
        <p className="font-semibold text-neutral-700">View Payment History →</p>
        <p className="text-sm text-gray-500">See all iuran records for this house</p>
      </Link>
    </div>
  );
}