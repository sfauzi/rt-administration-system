// components/residents/ResidentForm.tsx
// Reusable form untuk Create dan Edit resident
// Used by: app/(dashboard)/residents/new/page.tsx
//          app/(dashboard)/residents/[id]/edit/page.tsx

'use client';

import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import {
  User, Phone, Upload, X, FileImage,
  CheckCircle2, AlertCircle, Loader2, Save,
} from 'lucide-react';
import type { Resident } from '@/app/types';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ResidentFormData {
  full_name: string;
  phone_number: string;
  resident_type: 'permanent' | 'contract';
  is_married: boolean;
  is_active: boolean;
  contract_start_date: string;
  contract_end_date: string;
  notes: string;
  id_card_photo: File | null;
}

interface ResidentFormProps {
  initialData?: Resident;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

// ── Default values ────────────────────────────────────────────────────────────
function getDefaultValues(resident?: Resident): ResidentFormData {
  return {
    full_name:           resident?.full_name           ?? '',
    phone_number:        resident?.phone_number         ?? '',
    resident_type:       resident?.resident_type        ?? 'permanent',
    is_married:          resident?.is_married           ?? false,
    is_active:           resident?.is_active            ?? true,
    contract_start_date: resident?.contract_start_date  ?? '',
    contract_end_date:   resident?.contract_end_date    ?? '',
    notes:               resident?.notes                ?? '',
    id_card_photo:       null,
  };
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls = `w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
  disabled:bg-slate-50 disabled:text-gray-400 disabled:cursor-not-allowed
  transition-colors`;

const inputErrorCls = `w-full border border-red-300 bg-red-50 rounded-xl px-4 py-2.5
  text-sm text-gray-700 placeholder-gray-300
  focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400
  transition-colors`;

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5';

// ── Sub-component: Field wrapper ──────────────────────────────────────────────
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
        <p className="text-xs text-gray-400">{hint}</p>
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

// ── Sub-component: Toggle Switch ──────────────────────────────────────────────
function Toggle({
  checked, onChange, label, description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer
        transition-colors ${checked
          ? 'bg-blue-50 border-blue-200'
          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
    >
      {/* Toggle pill */}
      <div className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200
        ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
          transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </div>
      <div>
        <p className={`text-sm font-semibold ${checked ? 'text-blue-700' : 'text-gray-700'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ── Sub-component: KTP Photo Uploader ────────────────────────────────────────
function KtpUploader({
  existingUrl, file, onChange, error,
}: {
  existingUrl?: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const displayUrl = preview ?? existingUrl ?? null;

  const handleFile = useCallback((incoming: File) => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(incoming.type)) {
      alert('Only JPG/PNG files are allowed.');
      return;
    }
    if (incoming.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB.');
      return;
    }
    onChange(incoming);
    setPreview(URL.createObjectURL(incoming));
  }, [onChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {displayUrl ? (
        <div className="relative group inline-block">
          <img
            src={displayUrl}
            alt="KTP Preview"
            className="w-full max-w-sm h-44 object-cover rounded-xl
                       border border-slate-200"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                          transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-gray-800 text-xs
                         font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Upload size={12} /> Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 bg-red-500 text-white text-xs
                         font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={12} /> Remove
            </button>
          </div>
          {file && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs
                            px-2 py-1 rounded-lg backdrop-blur-sm font-mono">
              {file.name} · {(file.size / 1024).toFixed(0)}KB
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full max-w-sm h-44 rounded-xl border-2 border-dashed cursor-pointer
            transition-colors flex flex-col items-center justify-center gap-2
            ${dragOver
              ? 'border-blue-400 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'}`}
        >
          <div className={`p-3 rounded-xl ${dragOver ? 'bg-blue-100' : 'bg-slate-100'}`}>
            <FileImage size={22} className={dragOver ? 'text-blue-500' : 'text-slate-400'} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">
              {dragOver ? 'Drop photo here' : 'Upload KTP Photo'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-400">JPG, PNG · max 2MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpg,image/jpeg,image/png"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Section label — identik dengan payments/new ───────────────────────────────
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

// ── Main Form Component ───────────────────────────────────────────────────────
export function ResidentForm({
  initialData, onSubmit, isSubmitting, submitLabel,
}: ResidentFormProps) {
  const [form, setForm]     = useState<ResidentFormData>(() => getDefaultValues(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof ResidentFormData, string>>>({});

  const isEditMode = !!initialData;

  const set = <K extends keyof ResidentFormData>(key: K, value: ResidentFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required.';
    }
    if (form.phone_number && !/^[0-9+\-\s]{6,20}$/.test(form.phone_number)) {
      newErrors.phone_number = 'Enter a valid phone number.';
    }
    if (form.resident_type === 'contract' && !form.contract_start_date) {
      newErrors.contract_start_date = 'Contract start date is required for contract residents.';
    }
    if (
      form.contract_start_date &&
      form.contract_end_date &&
      form.contract_end_date < form.contract_start_date
    ) {
      newErrors.contract_end_date = 'End date must be after start date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('full_name',    form.full_name.trim());
    fd.append('phone_number', form.phone_number.trim());
    fd.append('resident_type', form.resident_type);
    fd.append('is_married',    form.is_married ? '1' : '0');
    fd.append('is_active',     form.is_active  ? '1' : '0');
    fd.append('notes',         form.notes.trim());

    if (form.resident_type === 'contract') {
      fd.append('contract_start_date', form.contract_start_date);
      fd.append('contract_end_date',   form.contract_end_date);
    }
    if (form.id_card_photo) fd.append('id_card_photo', form.id_card_photo);
    if (isEditMode)         fd.append('_method', 'PUT');

    await onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Form Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-blue-50">
            <User size={16} className="text-blue-500" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-800 tracking-tight">Resident Details</p>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the information below</p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Personal Information ─────────────────────────────────────── */}
          <SectionLabel>Personal Information</SectionLabel>

          {/* Full Name */}
          <Field label="Full Name" required error={errors.full_name}>
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="e.g. Budi Santoso"
              className={errors.full_name ? inputErrorCls : inputCls}
            />
          </Field>

          {/* Phone */}
          <Field
            label="Phone Number"
            // hint="Include country code if needed (e.g. +62812...)"
            error={errors.phone_number}
          >
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                          text-gray-300 pointer-events-none" />
              <input
                type="tel"
                value={form.phone_number}
                onChange={e => set('phone_number', e.target.value)}
                placeholder="0812 3456 7890"
                className={`${errors.phone_number ? inputErrorCls : inputCls} pl-9`}
              />
            </div>
          </Field>

          {/* Resident Type */}
          <Field label="Resident Type" required>
            <div className="grid grid-cols-2 gap-2">
              {(['permanent', 'contract'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    set('resident_type', type);
                    if (type === 'permanent') {
                      set('contract_start_date', '');
                      set('contract_end_date', '');
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold
                    capitalize text-center transition-colors
                    ${form.resident_type === type
                      ? type === 'permanent'
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-amber-50 border-amber-400 text-amber-700'
                      : 'border-slate-200 text-gray-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Field>

          {/* Contract Period */}
          {form.resident_type === 'contract' && (
            <>
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700">
                  Contract resident — please fill in the contract period below
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Contract Start Date"
                  required
                  error={errors.contract_start_date}
                >
                  <input
                    type="date"
                    value={form.contract_start_date}
                    onChange={e => set('contract_start_date', e.target.value)}
                    className={errors.contract_start_date ? inputErrorCls : inputCls}
                  />
                </Field>

                <Field
                  label="Contract End Date"
                  hint="Leave empty if not yet determined"
                  error={errors.contract_end_date}
                >
                  <input
                    type="date"
                    value={form.contract_end_date}
                    onChange={e => set('contract_end_date', e.target.value)}
                    className={errors.contract_end_date ? inputErrorCls : inputCls}
                  />
                </Field>
              </div>
            </>
          )}

          {/* ── Status ───────────────────────────────────────────────────── */}
          <SectionLabel>Status</SectionLabel>

          <Toggle
            checked={form.is_active}
            onChange={v => set('is_active', v)}
            label="Active Resident"
            description="Inactive residents won't be billed and won't appear in occupancy lists"
          />

          <Toggle
            checked={form.is_married}
            onChange={v => set('is_married', v)}
            label="Married"
            description="Marital status for administrative records"
          />

          {/* ── KTP Photo ────────────────────────────────────────────────── */}
          <SectionLabel>ID Card (KTP) Photo</SectionLabel>

          <KtpUploader
            existingUrl={initialData?.id_card_photo_url}
            file={form.id_card_photo}
            onChange={f => set('id_card_photo', f)}
            error={errors.id_card_photo}
          />

          {isEditMode && !form.id_card_photo && initialData?.id_card_photo_url && (
            <p className="text-xs text-gray-400">
              Current photo will be kept unless you upload a new one.
            </p>
          )}

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <SectionLabel>Notes</SectionLabel>

          <div>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Additional notes about this resident..."
              rows={3}
              className={inputCls + ' resize-none'}
            />
            <p className="text-xs text-gray-400 mt-1.5 text-right">
              {form.notes.length}/500
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* ── Submit ───────────────────────────────────────────────────── */}
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
                  : <><Save size={14} /> {submitLabel ?? (isEditMode ? 'Save Changes' : 'Add Resident')}</>
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}