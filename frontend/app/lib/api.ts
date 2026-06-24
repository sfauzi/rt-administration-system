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