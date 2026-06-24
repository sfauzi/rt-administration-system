// hooks/useFeeTypes.ts

import { useQuery } from '@tanstack/react-query';
import { feeTypesApi } from '../lib/api';

export const FEE_TYPE_KEYS = {
  all: ['fee-types'] as const,
  list: () => [...FEE_TYPE_KEYS.all, 'list'] as const,
  detail: (id: string) => [...FEE_TYPE_KEYS.all, 'detail', id] as const,
};

// Fetches active fee types (used in payment forms, dashboards)
export function useFeeTypes() {
  return useQuery({
    queryKey: FEE_TYPE_KEYS.list(),
    queryFn: () => feeTypesApi.list(),
    // Fee types rarely change — cache aggressively
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}