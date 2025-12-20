import type { BaseModel, WithdrawalStatus, SectionType } from './common';

export interface WithdrawalAllocation extends BaseModel {
  withdrawal: number;
  section: number;
  section_name?: string;
  section_type?: SectionType;
  section_color?: string;
  amount: string;
  passbook_entry?: number;
}

export interface SaccoWithdrawal extends BaseModel {
  sacco: number;
  member: number;
  member_number?: string;
  member_name?: string;
  withdrawal_number: string;
  request_date: string;
  amount: string;
  reason?: string;
  notes?: string;
  status: WithdrawalStatus;
  requested_by?: number;
  requested_by_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approval_date?: string;
  disbursement_date?: string;
  rejection_reason?: string;
  allocations?: WithdrawalAllocation[];
}

export interface WithdrawalFilters {
  member?: number;
  status?: WithdrawalStatus;
  page?: number;
  page_size?: number;
}

export interface CreateWithdrawalRequest {
  sacco: number;
  member: number;
  amount: string;
  request_date?: string;
  reason?: string;
  notes?: string;
  allocations?: {
    section: number;
    amount: string;
  }[];
}

export interface WithdrawalAvailableSectionRow {
  section_id: number;
  section_name: string;
  section_type: SectionType;
  color: string;
  balance: string;
  reserved: string;
  available: string;
}

export interface WithdrawalAvailableSummary {
  member_id: number;
  total_balance: string;
  total_reserved: string;
  total_available: string;
  sections: WithdrawalAvailableSectionRow[];
}
