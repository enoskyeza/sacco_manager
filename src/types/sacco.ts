import type { BaseModel, DayOfWeek } from './common';

/**
 * SACCO Organization
 */
export interface Sacco extends BaseModel {
  name: string;
  registration_number?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  settings: Record<string, unknown>;
  cash_round_amount: string; // Decimal as string
  meeting_day: DayOfWeek;
  is_active: boolean;
  subscription_plan: string;
  subscription_status: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscription_expires_at?: string;
  member_count: number;
  is_subscription_active: boolean;
}

/**
 * Create SACCO request
 */
export interface CreateSaccoRequest {
  name: string;
  registration_number?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  cash_round_amount?: string;
  meeting_day?: DayOfWeek;
  admin_ids?: number[];
}

/**
 * Update SACCO request
 */
export type UpdateSaccoRequest = Partial<CreateSaccoRequest>;
