/**
 * Common types and interfaces used across the application
 */

/**
 * Base model interface - all entities extend this
 */
export interface BaseModel {
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Common status types
 */
export type Status = 'active' | 'inactive' | 'suspended' | 'resigned';

/**
 * Transaction types
 */
export type TransactionType = 'credit' | 'debit';

/**
 * Meeting status
 */
export type MeetingStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Loan status
 */
export type LoanStatus = 
  | 'pending' 
  | 'approved' 
  | 'disbursed' 
  | 'active' 
  | 'paid' 
  | 'defaulted' 
  | 'rejected';

/**
 * Section types
 */
export type SectionType = 
  | 'savings' 
  | 'welfare' 
  | 'development' 
  | 'loan' 
  | 'emergency' 
  | 'interest' 
  | 'other';

/**
 * Days of week
 */
export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

/**
 * Standard API error response
 */
export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * API success response (generic)
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  success: number;
  failed: number;
  errors?: {
    item: unknown;
    error: string;
  }[];
}
