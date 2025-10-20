import type { BaseModel } from './common';

/**
 * SACCO Account Types
 */

export type AccountType = 
  | 'bank'
  | 'mobile_money'
  | 'wallet'
  | 'paypal'
  | 'cashbox'
  | 'personal_bank'
  | 'airtel_money'
  | 'mtn_money'
  | 'cash_wallet'
  | 'savings_account'
  | 'credit_card';

export type TransactionCategory =
  | 'sacco_savings'
  | 'sacco_loan_disbursement'
  | 'sacco_loan_repayment'
  | 'sacco_welfare'
  | 'sacco_development'
  | 'sacco_emergency';

/**
 * SACCO Account
 */
export interface SaccoAccount extends BaseModel {
  sacco: number;
  bank_name: string;
  bank_branch: string;
  account_number: string;
  current_balance: string; // Decimal as string
  account_type: AccountType;
  account_name: string;
}

/**
 * SACCO Account Transaction
 */
export interface SaccoAccountTransaction extends BaseModel {
  type: 'income' | 'expense';
  amount: string; // Decimal as string
  description: string;
  category: TransactionCategory;
  date: string; // Date string
}

/**
 * SACCO Account Summary
 */
export interface SaccoAccountSummary {
  total_income: string; // Decimal as string
  total_expense: string; // Decimal as string
  net_change: string; // Decimal as string
  current_balance: string; // Decimal as string
  transaction_count: number;
}

/**
 * Create SACCO Account Request
 */
export interface CreateSaccoAccountRequest {
  bank_name?: string;
  bank_branch?: string;
  account_number?: string;
  account_type?: AccountType;
  account_name?: string;
}

/**
 * Update SACCO Account Request
 */
export interface UpdateSaccoAccountRequest {
  bank_name?: string;
  bank_branch?: string;
  account_number?: string;
  account_type?: AccountType;
  account_name?: string;
}
