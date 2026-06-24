// hooks/useResidents.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { residentsApi } from '../lib/api';

export const RESIDENT_KEYS = {
  all: ['residents'] as const,
  list: (params?: object) => [...RESIDENT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...RESIDENT_KEYS.all, 'detail', id] as const,
};

export function useResidents(params?: {
  resident_type?: string;
  is_active?: boolean;
  search?: string;
}) {
  return useQuery({
    queryKey: RESIDENT_KEYS.list(params),
    queryFn: () => residentsApi.list(params),
  });
}

export function useResident(id: string) {
  return useQuery({
    queryKey: RESIDENT_KEYS.detail(id),
    queryFn: () => residentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => residentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESIDENT_KEYS.all });
    },
  });
}

export function useUpdateResident(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => residentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESIDENT_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: RESIDENT_KEYS.list() });
    },
  });
}

export function useDeleteResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => residentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESIDENT_KEYS.all });
    },
  });
}