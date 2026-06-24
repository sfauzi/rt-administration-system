// lib/api.ts

import axios from 'axios';
import type {
  House, Resident, Payment, Expense, FeeType,
  MonthlySummaryReport, HouseResident, HousePaymentStatus,
  ApiCollection, ApiItem,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,  // needed if using Sanctum cookie auth
});

// ── Houses ──────────────────────────────────────────────────────────────────

export const housesApi = {
  // GET /api/v1/houses
  list: (params?: { occupancy_status?: string; house_type?: string }) =>
    api.get<ApiCollection<House>>('/houses', { params }).then(r => r.data),

  // GET /api/v1/houses/:id
  get: (id: string) =>
    api.get<ApiItem<House>>(`/houses/${id}`).then(r => r.data),

  // POST /api/v1/houses
  create: (data: Partial<House>) =>
    api.post<ApiItem<House>>('/houses', data).then(r => r.data),

  // PUT /api/v1/houses/:id
  update: (id: string, data: Partial<House>) =>
    api.put<ApiItem<House>>(`/houses/${id}`, data).then(r => r.data),

  // GET /api/v1/houses/:id/residents  (history)
  residents: (id: string) =>
    api.get<ApiCollection<HouseResident>>(`/houses/${id}/residents`).then(r => r.data),

  // POST /api/v1/houses/:id/residents
  assignResident: (id: string, data: { resident_id: string; move_in_date: string; notes?: string }) =>
    api.post<ApiItem<HouseResident>>(`/houses/${id}/residents`, data).then(r => r.data),

  // PUT /api/v1/houses/:id/move-out
  moveOut: (id: string, data: { move_out_date: string }) =>
    api.put(`/houses/${id}/move-out`, data).then(r => r.data),

  // GET /api/v1/houses/:id/payments
  payments: (id: string, params?: { month?: string }) =>
    api.get<ApiCollection<Payment>>(`/houses/${id}/payments`, { params }).then(r => r.data),
};

// ── Residents ───────────────────────────────────────────────────────────────

export const residentsApi = {
  // GET /api/v1/residents
  list: (params?: { resident_type?: string; is_active?: boolean }) =>
    api.get<ApiCollection<Resident>>('/residents', { params }).then(r => r.data),

  // GET /api/v1/residents/:id
  get: (id: string) =>
    api.get<ApiItem<Resident>>(`/residents/${id}`).then(r => r.data),

  // POST /api/v1/residents  (use FormData for KTP photo upload)
  create: (data: FormData) =>
    api.post<ApiItem<Resident>>('/residents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  // PUT /api/v1/residents/:id
  update: (id: string, data: FormData) =>
    api.post<ApiItem<Resident>>(`/residents/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  // DELETE /api/v1/residents/:id
  delete: (id: string) =>
    api.delete(`/residents/${id}`).then(r => r.data),
};

// ── Payments ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  // GET /api/v1/payments
  list: (params?: { month?: string; house_id?: string; status?: string }) =>
    api.get<ApiCollection<Payment>>('/payments', { params }).then(r => r.data),

  // GET /api/v1/payments/:id
  get: (id: string) =>
    api.get<ApiItem<Payment>>(`/payments/${id}`).then(r => r.data),

  // POST /api/v1/payments
  create: (data: Partial<Payment>) =>
    api.post<ApiItem<Payment>>('/payments', data).then(r => r.data),

  // PUT /api/v1/payments/:id
  update: (id: string, data: Partial<Payment>) =>
    api.put<ApiItem<Payment>>(`/payments/${id}`, data).then(r => r.data),

  // DELETE /api/v1/payments/:id
  delete: (id: string) =>
    api.delete(`/payments/${id}`).then(r => r.data),
};

// ── Expenses ────────────────────────────────────────────────────────────────

export const expensesApi = {
  // GET /api/v1/expenses
  list: (params?: { month?: string; category?: string }) =>
    api.get<ApiCollection<Expense>>('/expenses', { params }).then(r => r.data),

  // POST /api/v1/expenses
  create: (data: Partial<Expense>) =>
    api.post<ApiItem<Expense>>('/expenses', data).then(r => r.data),

  // PUT /api/v1/expenses/:id
  update: (id: string, data: Partial<Expense>) =>
    api.put<ApiItem<Expense>>(`/expenses/${id}`, data).then(r => r.data),

  // DELETE /api/v1/expenses/:id
  delete: (id: string) =>
    api.delete(`/expenses/${id}`).then(r => r.data),
};

// ── Fee Types ───────────────────────────────────────────────────────────────

export const feeTypesApi = {
  // GET /api/v1/fee-types
  list: () =>
    api.get<ApiCollection<FeeType>>('/fee-types').then(r => r.data),
};

// ── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  // GET /api/v1/reports/monthly-summary?year=2025
  monthlySummary: (year: number) =>
    api.get<MonthlySummaryReport>('/reports/monthly-summary', { params: { year } })
      .then(r => r.data),

  // GET /api/v1/reports/monthly-detail?month=2025-01
  monthlyDetail: (month: string) =>
    api.get('/reports/monthly-detail', { params: { month } }).then(r => r.data),

  // GET /api/v1/reports/payment-status?month=2025-01
  paymentStatus: (month: string) =>
    api.get<{ month: string; houses: HousePaymentStatus[] }>(
      '/reports/payment-status', { params: { month } }
    ).then(r => r.data),
};

export default api;