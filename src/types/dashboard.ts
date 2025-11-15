/**
 * Dashboard types
 */

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
  total_members: number;
  active_members: number;
  total_savings: string;
  account_balance: string;
  total_loans: string;
  outstanding_loans: string;
  this_week_collection: string;
  attendance_rate: number;
  next_meeting_date: string;
  current_recipient: {
    id: number;
    member_number: string;
    first_name: string;
    last_name: string;
  } | null;
}

export type PendingPaymentStatus = 'due_soon' | 'overdue';

export type PendingPaymentType = 'loan' | 'meeting';

export interface PendingPaymentItem {
  type: PendingPaymentType;
  loan_id?: number;
  loan_number?: string;
  meeting_id?: number;
  week_number?: number;
  cash_round_name?: string | null;
  amount_due: string; // Decimal as string
  due_date: string; // Date string
  status: PendingPaymentStatus;
  days_until_due: number;
}

export interface MemberPendingPayments {
  member_id: number;
  has_pending: boolean;
  total_count: number;
  items: PendingPaymentItem[];
}

/**
 * Trend data point
 */
export interface TrendDataPoint {
  date: string;
  value: number;
}

/**
 * Savings growth data
 */
export interface SavingsGrowthData {
  compulsory_savings: TrendDataPoint[];
  optional_savings: TrendDataPoint[];
  total_savings: TrendDataPoint[];
}

/**
 * Activity item
 */
export interface ActivityItem {
  id: number;
  type: 'meeting' | 'member' | 'loan' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}
