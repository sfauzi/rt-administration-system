// lib/api.ts
import axios from 'axios';
import type {
  House, Resident, Payment, Expense, FeeType,
  MonthlySummaryReport, HouseResident, HousePaymentStatus,
  ApiCollection, ApiItem,
} from '@/types';
import { AuthUser, LoginResponse } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // withCredentials dihapus — tidak pakai Sanctum cookie di Next.js
});

// ── Token management helpers ─────────────────────────────────────────────────

const TOKEN_KEY = 'rt_admin_token';

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

// ── Axios interceptor — inject token ke setiap request ──────────────────────

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor response — handle 401 (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid — hapus dan redirect ke login
      tokenStorage.remove();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  // POST /api/v1/auth/login
  login: (credentials: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', credentials).then(r => r.data),

  // POST /api/v1/auth/logout
  logout: () =>
    api.post('/auth/logout').then(r => r.data),

  // GET /api/v1/auth/me
  me: () =>
    api.get<{ user: AuthUser }>('/auth/me').then(r => r.data),
};

// Interceptor untuk debug — hapus setelah confirmed working
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.status, error.response?.data ?? error.message);
    return Promise.reject(error);
  }
);

// ... sisa isi api.ts sama persis, tidak berubah
export const housesApi = {
  list: (params?: { occupancy_status?: string; house_type?: string }) =>
    api.get<ApiCollection<House>>('/houses', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<ApiItem<House>>(`/houses/${id}`).then(r => r.data),
  create: (data: Partial<House>) =>
    api.post<ApiItem<House>>('/houses', data).then(r => r.data),
  update: (id: string, data: Partial<House>) =>
    api.put<ApiItem<House>>(`/houses/${id}`, data).then(r => r.data),
  residents: (id: string) =>
    api.get<ApiCollection<HouseResident>>(`/houses/${id}/residents`).then(r => r.data),
  assignResident: (id: string, data: { resident_id: string; move_in_date: string; notes?: string }) =>
    api.post<ApiItem<HouseResident>>(`/houses/${id}/residents`, data).then(r => r.data),
  moveOut: (id: string, data: { move_out_date: string }) =>
    api.put(`/houses/${id}/move-out`, data).then(r => r.data),
  payments: (id: string, params?: { month?: string }) =>
    api.get<ApiCollection<Payment>>(`/houses/${id}/payments`, { params }).then(r => r.data),
};

export const residentsApi = {
  list: (params?: { resident_type?: string; is_active?: boolean }) =>
    api.get<ApiCollection<Resident>>('/residents', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<ApiItem<Resident>>(`/residents/${id}`).then(r => r.data),
  create: (data: FormData) =>
    api.post<ApiItem<Resident>>('/residents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  update: (id: string, data: FormData) =>
    api.post<ApiItem<Resident>>(`/residents/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/residents/${id}`).then(r => r.data),
};

export const paymentsApi = {
  list: (params?: { month?: string; house_id?: string; status?: string }) =>
    api.get<ApiCollection<Payment>>('/payments', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<ApiItem<Payment>>(`/payments/${id}`).then(r => r.data),
  create: (data: Partial<Payment>) =>
    api.post<ApiItem<Payment>>('/payments', data).then(r => r.data),
  update: (id: string, data: Partial<Payment>) =>
    api.put<ApiItem<Payment>>(`/payments/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/payments/${id}`).then(r => r.data),
};

export const expensesApi = {
  list: (params?: { month?: string; category?: string }) =>
    api.get<ApiCollection<Expense>>('/expenses', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<ApiItem<Expense>>(`/expenses/${id}`).then(r => r.data),
  create: (data: Partial<Expense>) =>
    api.post<ApiItem<Expense>>('/expenses', data).then(r => r.data),
  update: (id: string, data: Partial<Expense>) =>
    api.put<ApiItem<Expense>>(`/expenses/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/expenses/${id}`).then(r => r.data),
};

export const feeTypesApi = {
  list: () =>
    api.get<ApiCollection<FeeType>>('/fee-types').then(r => r.data),
};

export const reportsApi = {
  monthlySummary: (year: number) =>
    api.get<MonthlySummaryReport>('/reports/monthly-summary', { params: { year } })
      .then(r => r.data),
  monthlyDetail: (month: string) =>
    api.get('/reports/monthly-detail', { params: { month } }).then(r => r.data),
  paymentStatus: (month: string) =>
    api.get<{ month: string; houses: HousePaymentStatus[] }>(
      '/reports/payment-status', { params: { month } }
    ).then(r => r.data),
};

export default api;