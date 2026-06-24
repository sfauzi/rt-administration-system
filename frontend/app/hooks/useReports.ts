// hooks/useReports.ts

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';

export const REPORT_KEYS = {
  monthlySummary: (year: number) => ['reports', 'monthly-summary', year] as const,
  monthlyDetail: (month: string) => ['reports', 'monthly-detail', month] as const,
  paymentStatus: (month: string) => ['reports', 'payment-status', month] as const,
};

export function useMonthlySummary(year: number) {
  return useQuery({
    queryKey: REPORT_KEYS.monthlySummary(year),
    queryFn: () => reportsApi.monthlySummary(year),
  });
}

export function useMonthlyDetail(month: string) {
  return useQuery({
    queryKey: REPORT_KEYS.monthlyDetail(month),
    queryFn: () => reportsApi.monthlyDetail(month),
    enabled: !!month,
  });
}

export function usePaymentStatus(month: string) {
  return useQuery({
    queryKey: REPORT_KEYS.paymentStatus(month),
    queryFn: () => reportsApi.paymentStatus(month),
    enabled: !!month,
  });
}