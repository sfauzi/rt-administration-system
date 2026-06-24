// lib/query-clients.ts
import { QueryClient } from '@tanstack/react-query';

// Jangan export instance langsung — buat di dalam Providers
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}