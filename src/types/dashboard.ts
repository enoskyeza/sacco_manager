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
