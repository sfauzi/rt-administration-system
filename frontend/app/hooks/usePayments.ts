// hooks/usePayments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../lib/api';
import type { Payment } from '../types';

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
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Better error handling
    retry: (failureCount, error: any) => {
      // Don't retry on 400/404/409 errors
      if (error?.response?.status === 400 || 
          error?.response?.status === 404 || 
          error?.response?.status === 409) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.detail(id),
    queryFn: () => paymentsApi.get(id),
    enabled: !!id,
    staleTime: 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Payment>) => paymentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ 
        queryKey: PAYMENT_KEYS.all,
        refetchType: 'all',
      });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      // Log error for debugging
      console.error('Create payment error:', error);
      // The error will be passed to the component
      throw error;
    },
  });
}

export function useUpdatePayment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Payment>) => paymentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ 
        queryKey: PAYMENT_KEYS.detail(id),
        refetchType: 'all',
      });
      qc.invalidateQueries({ 
        queryKey: PAYMENT_KEYS.all,
        refetchType: 'all',
      });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      console.error('Update payment error:', error);
      throw error;
    },
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ 
        queryKey: PAYMENT_KEYS.all,
        refetchType: 'all',
      });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      console.error('Delete payment error:', error);
      throw error;
    },
  });
}