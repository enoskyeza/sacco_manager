import type { BaseModel, Status } from './common';

/**
 * Member (Flattened - as returned by list/detail endpoints)
 */
export interface Member extends BaseModel {
  user_id?: number;
  member_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  status: Status;
  date_joined: string;
  total_savings: string; // Decimal as string
  total_shares: string; // Decimal as string
  address?: string;
  profile_picture?: string;
  id_number?: string;
  alternative_phone?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  savings_goal?: string; // Decimal as string
  savings_goal_deadline?: string; // Date string
}

/**
 * Member Detail (Extended with more fields)
 */
export interface MemberDetail extends Member {
  passbook_number?: string;
  national_id?: string;
  date_of_birth?: string;
  occupation?: string;
  alternative_phone?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  date_left?: string;
  is_secretary: boolean;
  is_treasurer: boolean;
  is_chairperson: boolean;
}

/**
 * Create member request
 */
export interface CreateMemberRequest {
  user_id?: number;
  member_number?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  date_joined: string;
  id_number?: string;
  passbook_number?: string;
  national_id?: string;
  date_of_birth?: string;
  occupation?: string;
  address?: string;
  alternative_phone?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  status?: Status;
}

/**
 * Update member request
 */
export type UpdateMemberRequest = Partial<CreateMemberRequest>;

/**
 * Member filters for listing
 */
export interface MemberFilters {
  search?: string;
  status?: Status;
  page?: number;
  page_size?: number;
}

/**
 * Member form data (for forms)
 */
export interface MemberFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  national_id?: string;
  date_of_birth?: string;
  occupation?: string;
  address?: string;
  alternative_phone?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
}
