import type { BaseModel, TransactionType, SectionType } from './common';

/**
 * Passbook Section
 */
export interface PassbookSection extends BaseModel {
  sacco: number;
  name: string;
  section_type: SectionType;
  description?: string;
  is_compulsory: boolean;
  weekly_amount: string; // Decimal as string
  allow_variable_amounts: boolean;
  display_order: number;
  is_active: boolean;
  color: string; // Hex color
}

/**
 * Passbook Entry
 */
export interface PassbookEntry extends BaseModel {
  passbook: number;
  section: number;
  section_name?: string; // Populated in some responses
  member_name?: string; // Populated in some responses
  member_number?: string; // Populated in some responses
  transaction_date: string;
  transaction_type: TransactionType;
  amount: string; // Decimal as string
  balance_after: string; // Decimal as string
  description: string;
  reference_number?: string;
  recorded_by?: number;
  meeting?: number; // Link to weekly meeting
  week_number?: number;
  is_reversal: boolean;
}

/**
 * Member Passbook
 */
export interface MemberPassbook extends BaseModel {
  member: number;
  member_name?: string; // Populated in responses
  member_number?: string; // Populated in responses
  sacco: number;
  passbook_number: string;
  issued_date: string;
  is_active: boolean;
}

/**
 * Section Balance
 */
export interface SectionBalance {
  section_id: number;
  section_name: string;
  section_type: SectionType;
  color: string;
  balance: string; // Decimal as string
  is_compulsory: boolean;
}

/**
 * Passbook Statement (Full view with all sections)
 */
export interface PassbookStatement {
  passbook: {
    id: number;
    passbook_number: string;
    member_name: string;
    member_number: string;
  };
  sections: {
    section: string;
    section_id: number;
    section_type: SectionType;
    color: string;
    current_balance: string;
    entries: PassbookEntry[];
  }[];
  total_balance: string;
}

/**
 * Create passbook entry request
 */
export interface CreatePassbookEntryRequest {
  passbook: number;
  section: number;
  transaction_date: string;
  transaction_type: TransactionType;
  amount: string;
  description: string;
  reference_number?: string;
  meeting?: number;
  week_number?: number;
}

/**
 * Create section request
 */
export interface CreateSectionRequest {
  sacco: number;
  name: string;
  section_type: SectionType;
  description?: string;
  is_compulsory?: boolean;
  weekly_amount?: string;
  allow_variable_amounts?: boolean;
  display_order?: number;
  color?: string;
}

/**
 * Update section request
 */
export type UpdateSectionRequest = Partial<CreateSectionRequest>;

/**
 * Passbook filters
 */
export interface PassbookFilters {
  member?: number;
  section?: number;
  start_date?: string;
  end_date?: string;
  transaction_type?: TransactionType;
}

/**
 * Deduction Rule
 */
export interface DeductionRule extends BaseModel {
  sacco: number;
  section: number;
  section_name?: string; // Populated in responses
  amount: string; // Decimal as string
  applies_to: 'recipient' | 'all_members' | 'specific';
  is_active: boolean;
  effective_from: string; // Date string
  effective_until?: string; // Date string
  description?: string;
  is_effective_now?: boolean; // Computed field
}

/**
 * Create deduction rule request
 */
export interface CreateDeductionRuleRequest {
  sacco: number;
  section: number;
  amount?: string; // Optional - will be set from section's weekly_amount on backend
  applies_to?: 'recipient' | 'all_members' | 'specific';
  is_active?: boolean;
  effective_from: string;
  effective_until?: string;
  description?: string;
}

/**
 * Update deduction rule request
 */
export type UpdateDeductionRuleRequest = Partial<Omit<CreateDeductionRuleRequest, 'sacco'>>;

