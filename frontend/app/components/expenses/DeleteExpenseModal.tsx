// app/(dashboard)/expenses/_components/DeleteExpenseModal.tsx

'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DeleteExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expenseTitle: string | null;
  isPending: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function DeleteExpenseModal({
  isOpen,
  onClose,
  onConfirm,
  expenseTitle,
  isPending,
}: DeleteExpenseModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button when modal opens (keyboard accessibility)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => confirmButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/40 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Modal panel */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden
                      animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-red-50 shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </span>
            <div>
              <h2
                id="delete-modal-title"
                className="text-base font-bold text-gray-900 tracking-tight"
              >
                Delete Expense
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600
                       hover:bg-slate-100 transition-colors disabled:opacity-40"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{' '}
            {expenseTitle ? (
              <>
                <span className="font-semibold text-gray-800">&ldquo;{expenseTitle}&rdquo;</span>
                ?
              </>
            ) : (
              'this expense?'
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Data pengeluaran ini akan dihapus permanen dari sistem.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200
                       text-sm font-semibold text-gray-600
                       hover:bg-slate-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2
                       px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700
                       text-sm font-semibold text-white transition-colors shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>

      </div>
    </div>
  );
}