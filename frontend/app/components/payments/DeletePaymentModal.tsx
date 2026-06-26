// app/components/payments/DeletePaymentModal.tsx

'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payment: {
    id: string;
    house_number?: string;
    resident_name?: string;
    amount?: number;
  } | null;
  isPending?: boolean;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
}

export function DeletePaymentModal({
  isOpen,
  onClose,
  onConfirm,
  payment,
  isPending = false,
}: DeletePaymentModalProps) {
  if (!payment) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl
                                       bg-white p-6 text-left align-middle shadow-xl
                                       transition-all border border-slate-100">
                <div className="flex items-start justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-3"
                  >
                    <span className="p-2 rounded-xl bg-red-50">
                      <AlertTriangle size={18} className="text-red-500" />
                    </span>
                    Delete Payment
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400
                               hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this payment record?
                  </p>

                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">House</span>
                        <span className="font-semibold text-gray-800">
                          {payment.house_number || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resident</span>
                        <span className="font-semibold text-gray-800">
                          {payment.resident_name || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-bold text-red-600">
                          {payment.amount ? formatRupiah(payment.amount) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-red-500 font-medium">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600
                               hover:bg-slate-50 transition-colors border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white
                               bg-red-600 hover:bg-red-700 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}