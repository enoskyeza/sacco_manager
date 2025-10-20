import apiClient from './client';
import type {
  SaccoLoan,
  LoanPayment,
  LoanGuarantor,
  CreateLoanRequest,
  UpdateLoanRequest,
  CreateLoanPaymentRequest,
  LoanFilters,
  LoanSummary,
} from '../types';

export const loansApi = {
  /**
   * Get all loans
   */
  getLoans: async (saccoId: number, filters?: LoanFilters): Promise<SaccoLoan[]> => {
    const response = await apiClient.get('/saccos/loans/', {
      params: { sacco: saccoId, ...filters },
    });
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Get a single loan
   */
  getLoan: async (loanId: number): Promise<SaccoLoan> => {
    const response = await apiClient.get(`/saccos/loans/${loanId}/`);
    return response.data;
  },

  /**
   * Create a loan application
   */
  createLoan: async (data: CreateLoanRequest): Promise<SaccoLoan> => {
    const response = await apiClient.post('/saccos/loans/', data);
    return response.data;
  },

  /**
   * Update a loan
   */
  updateLoan: async (loanId: number, data: UpdateLoanRequest): Promise<SaccoLoan> => {
    const response = await apiClient.patch(`/saccos/loans/${loanId}/`, data);
    return response.data;
  },

  /**
   * Approve a loan
   */
  approveLoan: async (loanId: number): Promise<SaccoLoan> => {
    const response = await apiClient.post(`/saccos/loans/${loanId}/approve/`);
    return response.data;
  },

  /**
   * Reject a loan
   */
  rejectLoan: async (loanId: number, reason: string): Promise<SaccoLoan> => {
    const response = await apiClient.post(`/saccos/loans/${loanId}/reject/`, { rejection_reason: reason });
    return response.data;
  },

  /**
   * Disburse a loan
   */
  disburseLoan: async (loanId: number, disbursementDate: string): Promise<SaccoLoan> => {
    const response = await apiClient.post(`/saccos/loans/${loanId}/disburse/`, {
      disbursement_date: disbursementDate,
    });
    return response.data;
  },

  /**
   * Get loan payments
   */
  getLoanPayments: async (loanId: number): Promise<LoanPayment[]> => {
    const response = await apiClient.get('/saccos/loan-payments/', {
      params: { loan: loanId },
    });
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Create a loan payment
   */
  createLoanPayment: async (data: CreateLoanPaymentRequest): Promise<LoanPayment> => {
    const response = await apiClient.post('/saccos/loan-payments/', data);
    return response.data;
  },

  /**
   * Get loan guarantors
   */
  getLoanGuarantors: async (loanId: number): Promise<LoanGuarantor[]> => {
    const response = await apiClient.get('/saccos/loan-guarantors/', {
      params: { loan: loanId },
    });
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Add a guarantor to a loan
   */
  addGuarantor: async (data: Partial<LoanGuarantor>): Promise<LoanGuarantor> => {
    const response = await apiClient.post('/saccos/loan-guarantors/', data);
    return response.data;
  },

  /**
   * Remove a guarantor from a loan
   */
  removeGuarantor: async (guarantorId: number): Promise<void> => {
    await apiClient.delete(`/saccos/loan-guarantors/${guarantorId}/`);
  },

  /**
   * Get loan summary/statistics
   */
  getLoanSummary: async (saccoId: number): Promise<LoanSummary> => {
    const response = await apiClient.get(`/saccos/${saccoId}/analytics/loan-performance/`);
    return response.data;
  },
};
