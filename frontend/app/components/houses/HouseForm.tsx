'use client';

// components/houses/HouseForm.tsx
// Reusable form untuk Create dan Edit house
// Used by: app/(dashboard)/houses/new/page.tsx
//          app/(dashboard)/houses/[id]/edit/page.tsx

import { useState } from 'react';
import {
  Home, MapPin, CheckCircle2, AlertCircle, Loader2, Save, Info,
} from 'lucide-react';
import type { House } from '@/app/types';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface HouseFormData {
  house_number:     string;
  address:          string;
  house_type:       'permanent' | 'temporary';
  occupancy_status: 'occupied' | 'vacant';
  notes:            string;
}

interface HouseFormProps {
  initialData?: House;
  onSubmit: (data: HouseFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

// ── Shared styles — identik dengan ResidentForm ───────────────────────────────
const inputCls = `w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
  transition-colors`;

const inputErrorCls = `w-full border border-red-300 bg-red-50 rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400
  transition-colors`;

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

// ── Section label divider — identik dengan ResidentForm ──────────────────────
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

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label, required, hint, error, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="flex items-start gap-1 text-xs text-gray-400">
          <Info size={11} className="shrink-0 mt-0.5" />
          {hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Option card group ─────────────────────────────────────────────────────────
function OptionGroup<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: {
    value: T;
    label: string;
    description: string;
    activeClass: string;
    inactiveClass?: string;
  }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative flex flex-col items-start gap-1.5 p-4 rounded-xl border-2
            text-left transition-colors
            ${value === opt.value
              ? opt.activeClass
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          {value === opt.value && (
            <CheckCircle2 size={15} className="absolute top-3 right-3 opacity-70" />
          )}
          <p className="text-sm font-bold leading-tight pr-5">{opt.label}</p>
          <p className="text-xs opacity-70 leading-relaxed">{opt.description}</p>
        </button>
      ))}
    </div>
  );
}

// ── Default values ────────────────────────────────────────────────────────────
function getDefaults(house?: House): HouseFormData {
  return {
    house_number:     house?.house_number     ?? '',
    address:          house?.address          ?? '',
    house_type:       house?.house_type       ?? 'permanent',
    occupancy_status: house?.occupancy_status ?? 'vacant',
    notes:            house?.notes            ?? '',
  };
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export function HouseForm({
  initialData, onSubmit, isSubmitting, submitLabel,
}: HouseFormProps) {
  const [form, setForm]     = useState<HouseFormData>(() => getDefaults(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof HouseFormData, string>>>({});

  const isEditMode = !!initialData;

  const set = <K extends keyof HouseFormData>(key: K, value: HouseFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.house_number.trim()) e.house_number = 'House number is required.';
    if (!form.address.trim())      e.address      = 'Address is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      house_number: form.house_number.trim().toUpperCase(),
      address:      form.address.trim(),
      notes:        form.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Form Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-blue-50">
            <Home size={16} className="text-blue-500" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-800 tracking-tight">House Details</p>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the information below</p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── House Identity ───────────────────────────────────────────── */}
          <SectionLabel>House Identity</SectionLabel>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* House Number */}
            <Field
              label="House Number"
              required
              hint="Short unique ID shown on cards (e.g. A1, B3)"
              error={errors.house_number}
            >
              <input
                type="text"
                value={form.house_number}
                onChange={e => set('house_number', e.target.value.toUpperCase())}
                placeholder="A1"
                maxLength={10}
                className={`${errors.house_number ? inputErrorCls : inputCls}
                  font-mono font-bold tracking-widest text-center uppercase`}
              />
            </Field>

            {/* Address */}
            <div className="md:col-span-2">
              <Field
                label="Address"
                required
                hint="Full street address of this house unit"
                error={errors.address}
              >
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                               text-gray-300 pointer-events-none" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    placeholder="Jl. Perumahan Elite No. A1, RT 05"
                    className={`${errors.address ? inputErrorCls : inputCls} pl-9`}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── House Type ───────────────────────────────────────────────── */}
          <SectionLabel>House Type</SectionLabel>

          <OptionGroup
            value={form.house_type}
            onChange={v => set('house_type', v)}
            options={[
              {
                value: 'permanent',
                label: 'Permanent',
                description: 'Always billed every month regardless of occupancy status.',
                activeClass: 'border-blue-400 bg-blue-50 text-blue-700',
              },
              {
                value: 'temporary',
                label: 'Temporary / Rental',
                description: 'Only billed when a resident is actively assigned.',
                activeClass: 'border-amber-400 bg-amber-50 text-amber-700',
              },
            ]}
          />

          {/* Billing note */}
          <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed font-medium border ${
            form.house_type === 'permanent'
              ? 'bg-blue-50 text-blue-700 border-blue-100'
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {form.house_type === 'permanent'
              ? 'Monthly billing is always generated for this house. Assign a resident before recording payment.'
              : 'Billing is only generated when this house has an active resident. Vacant months are skipped.'
            }
          </div>

          {/* ── Occupancy Status ─────────────────────────────────────────── */}
          <SectionLabel>Occupancy Status</SectionLabel>

          <OptionGroup
            value={form.occupancy_status}
            onChange={v => set('occupancy_status', v)}
            options={[
              {
                value: 'occupied',
                label: 'Occupied',
                description: 'A resident is currently living in this house.',
                activeClass: 'border-blue-400 bg-blue-50 text-blue-700',
              },
              {
                value: 'vacant',
                label: 'Vacant',
                description: 'No resident is currently assigned to this house.',
                activeClass: 'border-slate-400 bg-slate-100 text-slate-600',
              },
            ]}
          />

          {/* Warning for occupied in create mode */}
          {form.occupancy_status === 'occupied' && !isEditMode && (
            <div className="rounded-xl px-4 py-3 text-xs leading-relaxed font-medium
                            bg-amber-50 text-amber-700 border border-amber-100">
              Status set to Occupied — remember to assign a resident from the house
              detail page after saving.
            </div>
          )}

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <SectionLabel>Notes</SectionLabel>

          <div>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Additional notes about this house (e.g. renovation in progress, special arrangement)..."
              rows={3}
              maxLength={500}
              className={inputCls + ' resize-none'}
            />
            <p className="text-xs text-gray-400 mt-1.5 text-right">
              {form.notes.length}/500
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* ── Submit — identik dengan ResidentForm ─────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Fields marked <span className="text-red-400 font-semibold">*</span> are required
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-sm font-medium text-gray-600
                           border border-slate-200 rounded-xl hover:bg-slate-50
                           transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2
                           bg-blue-600 hover:bg-blue-700 text-white
                           px-5 py-2.5 rounded-xl font-semibold text-sm
                           transition-colors shadow-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  : <><Save size={14} /> {submitLabel ?? (isEditMode ? 'Save Changes' : 'Add House')}</>
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}