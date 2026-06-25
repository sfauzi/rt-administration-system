// components/residents/ResidentForm.tsx
// Reusable form untuk Create dan Edit resident
// Used by: app/(dashboard)/residents/new/page.tsx
//          app/(dashboard)/residents/[id]/edit/page.tsx

'use client';

import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import {
  User, Phone, Upload, X, FileImage,
  CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import type { Resident } from '@/app/types';

// ── Types ────────────────────────────────────────────────────────────────────

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
  // Kalau ada initialData → mode Edit, kalau tidak → mode Create
  initialData?: Resident;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
  // Label tombol submit bisa dikustomisasi
  submitLabel?: string;
}

// ── Helper: default form state ────────────────────────────────────────────────

function getDefaultValues(resident?: Resident): ResidentFormData {
  return {
    full_name:           resident?.full_name        ?? '',
    phone_number:        resident?.phone_number      ?? '',
    resident_type:       resident?.resident_type     ?? 'permanent',
    is_married:          resident?.is_married        ?? false,
    is_active:           resident?.is_active         ?? true,
    contract_start_date: resident?.contract_start_date ?? '',
    contract_end_date:   resident?.contract_end_date   ?? '',
    notes:               resident?.notes             ?? '',
    id_card_photo:       null,
  };
}

// ── Sub-component: Form Field wrapper ────────────────────────────────────────

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
        <p className="text-xs text-gray-400">{hint}</p>
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

// ── Sub-component: Text Input ─────────────────────────────────────────────────

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        ${error
          ? 'border-red-300 bg-red-50 focus:ring-red-400'
          : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
    />
  );
}

// ── Sub-component: Toggle Switch ──────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
  activeColor = 'bg-blue-600',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full text-left group"
    >
      {/* Toggle pill */}
      <div className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${
        checked ? activeColor : 'bg-gray-200'
      }`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
          transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400">{description}</p>
        )}
      </div>
    </button>
  );
}

// ── Sub-component: KTP Photo Uploader ────────────────────────────────────────

function KtpUploader({
  existingUrl,
  file,
  onChange,
  error,
}: {
  existingUrl?: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Preview URL: pakai file baru kalau ada, fallback ke existing URL
  const displayUrl = preview ?? existingUrl ?? null;

  const handleFile = useCallback((incoming: File) => {
    // Validasi tipe
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(incoming.type)) {
      alert('Only JPG/PNG files are allowed.');
      return;
    }
    // Validasi ukuran (max 2MB)
    if (incoming.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB.');
      return;
    }

    onChange(incoming);
    const url = URL.createObjectURL(incoming);
    setPreview(url);
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
      {/* Preview area */}
      {displayUrl ? (
        <div className="relative group inline-block">
          <img
            src={displayUrl}
            alt="KTP Preview"
            className="w-full max-w-sm h-44 object-cover rounded-xl border border-gray-200"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                          transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-medium
                         px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Upload size={12} />
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-medium
                         px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={12} />
              Remove
            </button>
          </div>
          {/* File info badge */}
          {file && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs
                            px-2 py-1 rounded-lg backdrop-blur-sm">
              {file.name} · {(file.size / 1024).toFixed(0)}KB
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
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
              ? 'border-red-300 bg-red-50 hover:border-red-400'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }`}
        >
          <div className={`p-3 rounded-full ${dragOver ? 'bg-blue-100' : 'bg-gray-200'}`}>
            <FileImage size={22} className={dragOver ? 'text-blue-500' : 'text-gray-400'} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              {dragOver ? 'Drop photo here' : 'Upload KTP Photo'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-gray-400">JPG, PNG · max 2MB</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpg,image/jpeg,image/png"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────────────────────────

export function ResidentForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: ResidentFormProps) {
  const [form, setForm] = useState<ResidentFormData>(() => getDefaultValues(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof ResidentFormData, string>>>({});

  const isEditMode = !!initialData;

  // ── Field updater ───────────────────────────────────────────────────────────

  const set = <K extends keyof ResidentFormData>(key: K, value: ResidentFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    // Clear error on change
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────

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

  // ── Submit → build FormData ─────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('full_name',    form.full_name.trim());
    fd.append('phone_number', form.phone_number.trim());
    fd.append('resident_type', form.resident_type);
    fd.append('is_married',    form.is_married    ? '1' : '0');
    fd.append('is_active',     form.is_active     ? '1' : '0');
    fd.append('notes',         form.notes.trim());

    if (form.resident_type === 'contract') {
      fd.append('contract_start_date', form.contract_start_date);
      fd.append('contract_end_date',   form.contract_end_date);
    }

    if (form.id_card_photo) {
      fd.append('id_card_photo', form.id_card_photo);
    }

    // Edit mode: Laravel butuh _method=PUT karena FormData harus pakai POST
    if (isEditMode) {
      fd.append('_method', 'PUT');
    }

    await onSubmit(fd);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Section 1: Personal Information ─────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Personal Information
            </h2>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="md:col-span-2 text-neutral-500">
            <Field label="Full Name" required error={errors.full_name}>
              <TextInput
                value={form.full_name}
                onChange={v => set('full_name', v)}
                placeholder="e.g. Budi Santoso"
                error={!!errors.full_name}
              />
            </Field>
          </div>

          {/* Phone Number */}
          <Field
            label="Phone Number"
            hint="Include country code if needed (e.g. +62812...)"
            error={errors.phone_number}
          >
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                value={form.phone_number}
                onChange={e => set('phone_number', e.target.value)}
                placeholder="+62812 3456 7890"
                className={`text-neutral-500 w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${errors.phone_number
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }`}
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
                    // Reset contract dates kalau beralih ke permanent
                    if (type === 'permanent') {
                      set('contract_start_date', '');
                      set('contract_end_date', '');
                    }
                  }}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors
                    capitalize text-center
                    ${form.resident_type === type
                      ? type === 'permanent'
                        ? 'bg-green-50 border-green-400 text-green-700'
                        : 'bg-orange-50 border-orange-400 text-orange-700'
                      : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Contract Period — hanya muncul kalau type === contract */}
        {form.resident_type === 'contract' && (
          <div className="px-6 pb-6 grid grid-cols-2 gap-5 border-t border-dashed border-gray-200 pt-5 text-neutral-500">
            <div className="col-span-2">
              <p className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200
                           rounded-lg px-3 py-2 inline-block">
                Contract resident — please fill in the contract period below
              </p>
            </div>

            <Field
              label="Contract Start Date"
              required
              error={errors.contract_start_date}
            >
              <TextInput
                type="date"
                value={form.contract_start_date}
                onChange={v => set('contract_start_date', v)}
                error={!!errors.contract_start_date}
              />
            </Field>

            <Field
              label="Contract End Date"
              hint="Leave empty if end date is not yet determined"
              error={errors.contract_end_date}
            >
              <TextInput
                type="date"
                value={form.contract_end_date}
                onChange={v => set('contract_end_date', v)}
                error={!!errors.contract_end_date}
              />
            </Field>
          </div>
        )}
      </section>

      {/* ── Section 2: Status & Toggles ──────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Status
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <Toggle
            checked={form.is_active}
            onChange={v => set('is_active', v)}
            label="Active Resident"
            description="Inactive residents won't be billed and won't appear in occupancy lists"
            activeColor="bg-green-500"
          />

          <div className="border-t border-gray-100" />

          <Toggle
            checked={form.is_married}
            onChange={v => set('is_married', v)}
            label="Married"
            description="Marital status for administrative records"
            activeColor="bg-blue-500"
          />
        </div>
      </section>

      {/* ── Section 3: KTP Photo ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              ID Card (KTP) Photo
            </h2>
            <span className="text-xs text-gray-400">Optional</span>
          </div>
        </div>

        <div className="p-6">
          <KtpUploader
            existingUrl={initialData?.id_card_photo_url}
            file={form.id_card_photo}
            onChange={f => set('id_card_photo', f)}
            error={errors.id_card_photo}
          />

          {isEditMode && !form.id_card_photo && initialData?.id_card_photo_url && (
            <p className="text-xs text-gray-400 mt-2">
              Current photo will be kept unless you upload a new one.
            </p>
          )}
        </div>
      </section>

      {/* ── Section 4: Notes ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-neutral-500">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Notes
            </h2>
            <span className="text-xs text-gray-400">Optional</span>
          </div>
        </div>

        <div className="p-6">
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Additional notes about this resident..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300
                       hover:border-gray-400 focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:border-transparent resize-none
                       placeholder:text-gray-400 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5 text-right">
            {form.notes.length}/500
          </p>
        </div>
      </section>

      {/* ── Submit Bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-4 px-6 bg-white rounded-2xl
                      border border-gray-200 sticky bottom-4 shadow-lg shadow-gray-200/50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin text-blue-500" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={15} className="text-gray-300" />
              <span>All fields with <span className="text-red-500">*</span> are required</span>
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
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-medium rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {submitLabel ?? (isEditMode ? 'Save Changes' : 'Add Resident')}
          </button>
        </div>
      </div>

    </form>
  );
}