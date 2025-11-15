import type { BaseModel, LoanStatus } from './common';

/**
 * SACCO Loan
 */
export interface SaccoLoan extends BaseModel {
  sacco: number;
  member: number;
  member_name?: string; // Populated
  member_number?: string; // Populated
  loan_number: string;
  principal_amount: string; // Decimal as string
  interest_rate: string;
  interest_amount: string;
  total_amount: string;
  application_date: string;
  approval_date?: string;
  disbursement_date?: string;
  due_date?: string;
  duration_months: number;
  amount_paid_principal: string;
  amount_paid_interest: string;
  balance_principal: string;
  balance_interest: string;
  total_balance: string; // Computed
  status: LoanStatus;
  purpose: string;
  notes?: string;
  approved_by?: number;
  rejection_reason?: string;
  is_overdue: boolean; // Computed
  repayment_frequency?: 'monthly' | 'weekly';
}

/**
 * Loan Payment
 */
export interface LoanPayment extends BaseModel {
  loan: number;
  payment_date: string;
  total_amount: string; // Decimal as string
  principal_amount: string;
  interest_amount: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  recorded_by?: number;
}

/**
 * Loan Guarantor
 */
export interface LoanGuarantor extends BaseModel {
  loan: number;
  guarantor: number;
  guarantor_name?: string; // Populated
  guarantor_number?: string; // Populated
  guarantee_amount: string; // Decimal as string
  guarantee_date: string;
  is_active: boolean;
  notes?: string;
}

/**
 * Create loan request
 */
export interface CreateLoanRequest {
  sacco: number;
  member: number;
  principal_amount: string;
  interest_rate: string;
  duration_months: number;
  purpose: string;
  application_date: string;
  repayment_frequency?: 'monthly' | 'weekly';
}

/**
 * Update loan request
 */
export interface UpdateLoanRequest extends Partial<CreateLoanRequest> {
  status?: LoanStatus;
  approval_date?: string;
  disbursement_date?: string;
  due_date?: string;
  rejection_reason?: string;
}

/**
 * Create loan payment request
 */
export interface CreateLoanPaymentRequest {
  loan: number;
  payment_date: string;
  total_amount: string;
  principal_amount?: string;
  interest_amount?: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}

/**
 * Loan filters
 */
export interface LoanFilters {
  sacco?: number;
  member?: number;
  status?: LoanStatus;
  page?: number;
  page_size?: number;
}

/**
 * Loan Summary (for dashboard)
 */
export interface LoanSummary {
  total_active_loans: number;
  total_lent: string;
  total_repaid: string;
  outstanding_balance: string;
  overdue_loans: number;
  repayment_rate: number; // Percentage
}

/**
 * Loan application form data
 */
export interface LoanApplicationFormData {
  principal_amount: string;
  duration_months: number;
  purpose: string;
}
