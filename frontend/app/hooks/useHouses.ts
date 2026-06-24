// hooks/useHouses.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housesApi } from '@/lib/api';

export const HOUSE_KEYS = {
  all: ['houses'] as const,
  list: (params?: object) => [...HOUSE_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...HOUSE_KEYS.all, 'detail', id] as const,
  residents: (id: string) => [...HOUSE_KEYS.all, id, 'residents'] as const,
  payments: (id: string, params?: object) => [...HOUSE_KEYS.all, id, 'payments', params] as const,
};

export function useHouses(params?: { occupancy_status?: string; house_type?: string }) {
  return useQuery({
    queryKey: HOUSE_KEYS.list(params),
    queryFn: () => housesApi.list(params),
  });
}

export function useHouse(id: string) {
  return useQuery({
    queryKey: HOUSE_KEYS.detail(id),
    queryFn: () => housesApi.get(id),
    enabled: !!id,
  });
}

export function useHouseResidents(id: string) {
  return useQuery({
    queryKey: HOUSE_KEYS.residents(id),
    queryFn: () => housesApi.residents(id),
    enabled: !!id,
  });
}

export function useHousePayments(id: string, params?: { month?: string }) {
  return useQuery({
    queryKey: HOUSE_KEYS.payments(id, params),
    queryFn: () => housesApi.payments(id, params),
    enabled: !!id,
  });
}

export function useAssignResident(houseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { resident_id: string; move_in_date: string; notes?: string }) =>
      housesApi.assignResident(houseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOUSE_KEYS.detail(houseId) });
      qc.invalidateQueries({ queryKey: HOUSE_KEYS.residents(houseId) });
      qc.invalidateQueries({ queryKey: HOUSE_KEYS.list() });
    },
  });
}

export function useMoveOut(houseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { move_out_date: string }) => housesApi.moveOut(houseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HOUSE_KEYS.all });
    },
  });
}