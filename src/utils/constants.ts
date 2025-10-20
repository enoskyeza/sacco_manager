/**
 * Application constants
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  SELECTED_SACCO: 'selected_sacco',
  THEME: 'theme',
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY_SHORT: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
} as const;

/**
 * Currency
 */
export const CURRENCY = {
  CODE: 'UGX',
  SYMBOL: 'UGX',
  NAME: 'Uganda Shillings',
} as const;

/**
 * Member Status Options
 */
export const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  RESIGNED: 'resigned',
} as const;

export const MEMBER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  resigned: 'Resigned',
} as const;

export const MEMBER_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  resigned: 'bg-red-100 text-red-800',
} as const;

/**
 * Meeting Status Options
 */
export const MEETING_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const MEETING_STATUS_LABELS = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export const MEETING_STATUS_COLORS = {
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

/**
 * Loan Status Options
 */
export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DISBURSED: 'disbursed',
  ACTIVE: 'active',
  PAID: 'paid',
  DEFAULTED: 'defaulted',
  REJECTED: 'rejected',
} as const;

export const LOAN_STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  disbursed: 'Disbursed',
  active: 'Active',
  paid: 'Fully Paid',
  defaulted: 'Defaulted',
  rejected: 'Rejected',
} as const;

export const LOAN_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  disbursed: 'bg-indigo-100 text-indigo-800',
  active: 'bg-green-100 text-green-800',
  paid: 'bg-gray-100 text-gray-800',
  defaulted: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
} as const;

/**
 * Section Type Options
 */
export const SECTION_TYPES = {
  SAVINGS: 'savings',
  WELFARE: 'welfare',
  DEVELOPMENT: 'development',
  LOAN: 'loan',
  EMERGENCY: 'emergency',
  INTEREST: 'interest',
  OTHER: 'other',
} as const;

export const SECTION_TYPE_LABELS = {
  savings: 'Savings',
  welfare: 'Welfare',
  development: 'Development',
  loan: 'Loan',
  emergency: 'Emergency',
  interest: 'Interest',
  other: 'Other',
} as const;

/**
 * Default Section Colors
 */
export const DEFAULT_SECTION_COLORS = {
  savings: '#10B981',
  welfare: '#8B5CF6',
  development: '#F59E0B',
  loan: '#EF4444',
  emergency: '#DC2626',
  interest: '#6366F1',
  other: '#6B7280',
} as const;

/**
 * Transaction Types
 */
export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export const TRANSACTION_TYPE_LABELS = {
  credit: 'Credit',
  debit: 'Debit',
} as const;

/**
 * Days of Week
 */
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  
  // Members
  MEMBERS: '/members',
  MEMBER_NEW: '/members/new',
  MEMBER_DETAIL: '/members/:id',
  MEMBER_EDIT: '/members/:id/edit',
  MEMBER_PASSBOOK: '/members/:id/passbook',
  
  // Meetings
  MEETINGS: '/meetings',
  MEETING_NEW: '/meetings/new',
  MEETING_DETAIL: '/meetings/:id',
  MEETING_COLLECT: '/meetings/:id/collect',
  MEETING_REPORT: '/meetings/:id/report',
  
  // Cash Round
  CASH_ROUND: '/cash-round',
  CASH_ROUND_SCHEDULE: '/cash-round/schedule',
  CASH_ROUND_HISTORY: '/cash-round/history',
  
  // Loans
  LOANS: '/loans',
  LOAN_NEW: '/loans/new',
  LOAN_DETAIL: '/loans/:id',
  LOAN_APPROVE: '/loans/:id/approve',
  LOAN_PAYMENT: '/loans/:id/payment',
  MY_LOANS: '/my-loans',
  
  // Reports
  REPORTS: '/reports',
  REPORT_MEMBER_STATEMENT: '/reports/member-statement/:id',
  REPORT_ATTENDANCE: '/reports/attendance',
  REPORT_SAVINGS: '/reports/savings',
  REPORT_LOANS: '/reports/loans',
  
  // Settings
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_FEES: '/settings/fees',
  SETTINGS_SECTIONS: '/settings/sections',
  SETTINGS_USERS: '/settings/users',
} as const;

/**
 * Query Keys (for React Query)
 */
export const QUERY_KEYS = {
  USER: ['user'],
  SACCOS: ['saccos'],
  SACCO: (id: number) => ['sacco', id],
  
  MEMBERS: (saccoId: number) => ['members', saccoId],
  MEMBER: (id: number) => ['member', id],
  
  PASSBOOK: (id: number) => ['passbook', id],
  PASSBOOK_STATEMENT: (id: number) => ['passbook-statement', id],
  SECTIONS: (saccoId: number) => ['sections', saccoId],
  
  MEETINGS: (saccoId: number) => ['meetings', saccoId],
  MEETING: (id: number) => ['meeting', id],
  CONTRIBUTIONS: (meetingId: number) => ['contributions', meetingId],
  
  CASH_ROUND_SCHEDULE: (saccoId: number) => ['cash-round-schedule', saccoId],
  
  LOANS: (saccoId: number) => ['loans', saccoId],
  LOAN: (id: number) => ['loan', id],
  LOAN_PAYMENTS: (loanId: number) => ['loan-payments', loanId],
  
  DASHBOARD_METRICS: (saccoId: number) => ['dashboard-metrics', saccoId],
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC: 'An error occurred. Please try again.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  MEMBER_CREATED: 'Member created successfully',
  MEMBER_UPDATED: 'Member updated successfully',
  MEMBER_DELETED: 'Member deleted successfully',
  
  MEETING_CREATED: 'Meeting created successfully',
  MEETING_UPDATED: 'Meeting updated successfully',
  MEETING_FINALIZED: 'Meeting finalized successfully',
  
  CONTRIBUTION_RECORDED: 'Contribution recorded successfully',
  
  LOAN_APPLIED: 'Loan application submitted successfully',
  LOAN_APPROVED: 'Loan approved successfully',
  LOAN_DISBURSED: 'Loan disbursed successfully',
  PAYMENT_RECORDED: 'Payment recorded successfully',
  
  SETTINGS_UPDATED: 'Settings updated successfully',
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;
