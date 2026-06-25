'use client';

// components/houses/HouseForm.tsx
// Reusable form untuk Create dan Edit house
// Used by: app/(dashboard)/houses/new/page.tsx
//          app/(dashboard)/houses/[id]/edit/page.tsx

import { useState } from 'react';
import {
  Home, MapPin, CheckCircle2,
  AlertCircle, Loader2, Info,
} from 'lucide-react';
import type { House } from '@/app/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HouseFormData {
  house_number: string;
  address: string;
  house_type: 'permanent' | 'temporary';
  occupancy_status: 'occupied' | 'vacant';
  notes: string;
}

interface HouseFormProps {
  initialData?: House;
  onSubmit: (data: HouseFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

// ── Sub-component: Field wrapper ──────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-400 flex items-start gap-1">
          <Info size={11} className="shrink-0 mt-0.5" />
          {hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Sub-component: Option card group (house type & occupancy status) ───────────

function OptionGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: {
    value: T;
    label: string;
    description: string;
    emoji: string;
    activeClass: string;
  }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2
            text-left transition-all duration-150
            ${value === opt.value
              ? opt.activeClass
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
        >
          {/* Selected checkmark */}
          {value === opt.value && (
            <CheckCircle2
              size={16}
              className="absolute top-3 right-3 text-current opacity-70"
            />
          )}
          <span className="text-xl">{opt.emoji}</span>
          <div>
            <p className="text-sm font-semibold leading-tight">{opt.label}</p>
            <p className="text-xs opacity-70 mt-1 leading-relaxed">{opt.description}</p>
          </div>
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
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Section 1: House Identity ──────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            <Home size={15} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              House Identity
            </h2>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-neutral-700">
          {/* House Number */}
          <Field
            label="House Number"
            required
            hint='Short unique identifier shown on cards (e.g. A1, B3)'
            error={errors.house_number}
          >
            <input
              type="text"
              value={form.house_number}
              onChange={e => set('house_number', e.target.value.toUpperCase())}
              placeholder="A1"
              maxLength={10}
              className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors
                font-mono font-bold tracking-widest text-center uppercase
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.house_number
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
                }`}
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
                <MapPin
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="Jl. Perumahan Elite No. A1, RT 05"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${errors.address
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}
                />
              </div>
            </Field>
          </div>
        </div>
      </section>

      {/* ── Section 2: House Type ──────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-neutral-700">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            House Type
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Determines billing behaviour for this house
          </p>
        </div>

        <div className="p-6 space-y-4">
          <OptionGroup
            value={form.house_type}
            onChange={v => set('house_type', v)}
            options={[
              {
                value: 'permanent',
                label: 'Permanent',
                description: 'Always billed every month regardless of occupancy status.',
                emoji: '',
                activeClass: 'border-blue-400 bg-blue-50 text-blue-700',
              },
              {
                value: 'temporary',
                label: 'Temporary / Rental',
                description: 'Only billed when a resident is actively assigned.',
                emoji: '',
                activeClass: 'border-orange-400 bg-orange-50 text-orange-700',
              },
            ]}
          />

          {/* Contextual billing note */}
          <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed
            ${form.house_type === 'permanent'
              ? 'bg-blue-50 text-blue-700 border border-blue-100'
              : 'bg-orange-50 text-orange-700 border border-orange-100'
            }`}
          >
            {form.house_type === 'permanent'
              ? '📋 Monthly billing is always generated for this house. Assign a resident before recording payment.'
              : '📋 Billing is only generated when this house has an active resident. Vacant months are skipped.'
            }
          </div>
        </div>
      </section>

      {/* ── Section 3: Occupancy Status ───────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-neutral-700">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Occupancy Status
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Current state of this house unit
          </p>
        </div>

        <div className="p-6 space-y-4">
          <OptionGroup
            value={form.occupancy_status}
            onChange={v => set('occupancy_status', v)}
            options={[
              {
                value: 'occupied',
                label: 'Occupied',
                description: 'A resident is currently living in this house.',
                emoji: '',
                activeClass: 'border-green-400 bg-green-50 text-green-700',
              },
              {
                value: 'vacant',
                label: 'Vacant',
                description: 'No resident is currently assigned to this house.',
                emoji: '',
                activeClass: 'border-gray-400 bg-gray-100 text-gray-600',
              },
            ]}
          />

          {/* Warning: occupied but no resident assigned yet (create mode) */}
          {form.occupancy_status === 'occupied' && !isEditMode && (
            <div className="rounded-xl px-4 py-3 text-xs leading-relaxed
              bg-yellow-50 text-yellow-700 border border-yellow-200">
              ⚠️ Status set to Occupied — remember to assign a resident from the
              house detail page after saving.
            </div>
          )}
        </div>
      </section>

      {/* ── Section 4: Notes ──────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-neutral-700">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Notes
            </h2>
            <span className="text-xs text-gray-400">Optional</span>
          </div>
        </div>
        <div className="p-6">
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Additional notes about this house (e.g. renovation in progress, special arrangement)..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
                       hover:border-gray-400 focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:border-transparent
                       resize-none placeholder:text-gray-400 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">
            {form.notes.length}/500
          </p>
        </div>
      </section>

      {/* ── Submit Bar (sticky bottom) ─────────────────────────────────── */}
      <div className="flex items-center justify-between py-4 px-6 bg-white rounded-2xl
                      border border-gray-200 sticky bottom-4
                      shadow-lg shadow-gray-200/60">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin text-blue-500" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={15} className="text-gray-300" />
              <span>
                Fields with <span className="text-red-500">*</span> are required
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg
                       hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-5 py-2 min-w-[120px]
                       bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                       rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {submitLabel ?? (isEditMode ? 'Save Changes' : 'Add House')}
          </button>
        </div>
      </div>

    </form>
  );
}