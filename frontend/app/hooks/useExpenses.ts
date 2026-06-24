// hooks/useExpenses.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../lib/api';
import type { Expense } from '../types';

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  list: (params?: object) => [...EXPENSE_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...EXPENSE_KEYS.all, 'detail', id] as const,
};

export function useExpenses(params?: {
  month?: string;
  category?: string;
  is_recurring?: boolean;
}) {
  return useQuery({
    queryKey: EXPENSE_KEYS.list(params),
    queryFn: () => expensesApi.list(params),
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: EXPENSE_KEYS.detail(id),
    queryFn: () => expensesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Expense>) => expensesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateExpense(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Expense>) => expensesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: EXPENSE_KEYS.list() });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}