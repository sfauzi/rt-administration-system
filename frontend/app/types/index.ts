// types/index.ts

export type OccupancyStatus = 'occupied' | 'vacant';
export type HouseType = 'permanent' | 'temporary';
export type ResidentType = 'permanent' | 'contract';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type ExpenseCategory = 'salary' | 'electricity' | 'maintenance' | 'other';

export interface FeeType {
  id: string;
  name: string;
  slug: string;
  amount: number;
  billing_cycle: string;
  description: string | null;
  is_active: boolean;
}

export interface Resident {
  id: string;
  full_name: string;
  phone_number: string | null;
  id_card_photo_url: string | null;
  resident_type: ResidentType;
  is_married: boolean;
  contract_start_date: string | null;
  contract_end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface HouseResident {
  id: string;
  house_id: string;
  resident_id: string;
  resident: Resident;
  move_in_date: string;
  move_out_date: string | null;
  is_current: boolean;
  notes: string | null;
}

export interface House {
  id: string;
  house_number: string;
  address: string;
  house_type: HouseType;
  occupancy_status: OccupancyStatus;
  notes: string | null;
  current_resident?: Resident | null;
  residents_history?: HouseResident[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  house_id: string;
  house_number?: string;
  resident_id: string;
  resident_name?: string;
  fee_type_id: string;
  fee_type_name?: string;
  amount: number;
  billing_month: string;  // "YYYY-MM"
  months_covered: number;
  status: PaymentStatus;
  paid_at: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  expense_month: string;  // "YYYY-MM"
  description: string | null;
  receipt_photo: string | null;
  is_recurring: boolean;
}

// Report types
export interface MonthlyDataPoint {
  month: string;
  month_label: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface MonthlySummaryReport {
  year: number;
  data: MonthlyDataPoint[];
  summary: {
    total_income: number;
    total_expenses: number;
    net_balance: number;
  };
}

export interface FeeStatus {
  fee_type_id: string;
  fee_type_name: string;
  amount_due: number;
  status: PaymentStatus;
  paid_amount: number;
  paid_at: string | null;
  payment_id: string | null;
}

export interface HousePaymentStatus {
  house_id: string;
  house_number: string;
  resident_name: string;
  fee_statuses: FeeStatus[];
  all_paid: boolean;
}

// API response wrapper
export interface ApiCollection<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiItem<T> {
  data: T;
}