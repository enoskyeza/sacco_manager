import type { BaseModel, MeetingStatus } from './common';

/**
 * Cash Round Schedule
 */
export interface CashRoundSchedule extends BaseModel {
  sacco: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  rotation_order: number[]; // Array of member IDs
  current_position: number;
}

/**
 * Cash Round Schedule with Member Details
 */
export interface CashRoundScheduleDetail extends CashRoundSchedule {
  current_recipient?: {
    id: number;
    member_number: string;
    first_name: string;
    last_name: string;
  };
  next_recipient?: {
    id: number;
    member_number: string;
    first_name: string;
    last_name: string;
  };
}

/**
 * Weekly Meeting
 */
export interface WeeklyMeeting extends BaseModel {
  sacco: number;
  meeting_date: string;
  week_number: number;
  year: number;
  cash_round?: number; // Link to CashRound (NEW)
  cash_round_number?: number; // Populated for display (NEW)
  cash_round_name?: string; // Populated for display (NEW)
  cash_round_recipient?: number;
  cash_round_recipient_name?: string; // Populated
  total_collected: string; // Decimal as string
  total_deductions: string;
  amount_to_recipient: string;
  amount_to_bank: string;
  members_present: number;
  members_absent: number;
  status: MeetingStatus;
  notes?: string;
  recorded_by?: number;
  completed_at?: string;
}

/**
 * Weekly Contribution
 */
export interface WeeklyContribution extends BaseModel {
  meeting: number;
  member: number;
  member_name?: string; // Populated
  member_number?: string; // Populated
  was_present: boolean;
  amount_contributed: string; // Decimal as string
  optional_savings: string;
  funding_source?: 'member' | 'sacco';
  is_recipient: boolean;
  compulsory_savings_deduction: string;
  welfare_deduction: string;
  development_deduction: string;
  other_deductions: string;
  total_deductions: string;
  notes?: string;
}

/**
 * Meeting with Contributions (Detail view)
 */
export interface WeeklyMeetingDetail extends WeeklyMeeting {
  contributions: WeeklyContribution[];
}

/**
 * Create meeting request
 */
export interface CreateMeetingRequest {
  sacco: number;
  meeting_date: string;
  week_number: number;
  year: number;
  cash_round_recipient?: number;
  status?: MeetingStatus;
  notes?: string;
}

/**
 * Update meeting request
 */
export type UpdateMeetingRequest = Partial<CreateMeetingRequest>;

/**
 * Create contribution request
 */
export interface CreateContributionRequest {
  meeting: number;
  member: number;
  was_present: boolean;
  amount_contributed?: string;
  optional_savings?: string;
}

/**
 * Create recipient deductions request
 */
export interface CreateRecipientDeductionsRequest {
  meeting: number;
  member: number;
  is_recipient: true;
  compulsory_savings_deduction: string;
  welfare_deduction: string;
  development_deduction: string;
  other_deductions?: string;
}

/**
 * Bulk create contributions request
 */
export interface BulkCreateContributionsRequest {
  meeting: number;
  contributions: Omit<CreateContributionRequest, 'meeting'>[];
}

/**
 * Meeting filters
 */
export interface MeetingFilters {
  sacco?: number;
  year?: number;
  week_number?: number;
  status?: MeetingStatus;
  cash_round?: number;  // NEW: Filter by cash round
  page?: number;
  page_size?: number;
}

/**
 * Meeting Statistics (for UI display)
 */
export interface MeetingStatistics {
  total_expected: string;
  total_collected: string;
  collection_rate: number; // Percentage
  members_paid: number;
  members_pending: number;
  amount_to_recipient: string;
  amount_to_bank: string;
}

/**
 * Contribution form data (for quick entry)
 */
export interface ContributionFormData {
  member_id: number;
  was_present: boolean;
  amount_contributed: string;
  optional_savings: string;
}

/**
 * Create cash round schedule request
 */
export interface CreateCashRoundScheduleRequest {
  sacco: number;
  start_date: string;
  rotation_order: number[]; // Array of member IDs in rotation order
  is_active?: boolean;
}
