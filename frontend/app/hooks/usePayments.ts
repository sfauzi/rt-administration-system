// hooks/usePayments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../lib/api';
import type { Payment } from '@/types';

export const PAYMENT_KEYS = {
  all: ['payments'] as const,
  list: (params?: object) => [...PAYMENT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...PAYMENT_KEYS.all, 'detail', id] as const,
};

export function usePayments(params?: {
  month?: string;
  house_id?: string;
  resident_id?: string;
  status?: string;
  fee_type_id?: string;
}) {
  return useQuery({
    queryKey: PAYMENT_KEYS.list(params),
    queryFn: () => paymentsApi.list(params),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.detail(id),
    queryFn: () => paymentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Payment>) => paymentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      // Also invalidate report queries since payment affects report data
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdatePayment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Payment>) => paymentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENT_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: PAYMENT_KEYS.list() });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENT_KEYS.all });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}