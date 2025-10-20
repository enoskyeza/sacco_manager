import apiClient from './client';
import type {
  SaccoAccount,
  SaccoAccountTransaction,
  SaccoAccountSummary,
  CreateSaccoAccountRequest,
  UpdateSaccoAccountRequest,
} from '../types';

export const accountApi = {
  /**
   * Get SACCO account
   */
  getSaccoAccount: async (): Promise<SaccoAccount> => {
    const response = await apiClient.get('/saccos/account/');
    return response.data;
  },

  /**
   * Create SACCO account
   */
  createSaccoAccount: async (data: CreateSaccoAccountRequest): Promise<SaccoAccount> => {
    const response = await apiClient.post('/saccos/account/', data);
    return response.data;
  },

  /**
   * Update SACCO account
   */
  updateSaccoAccount: async (
    accountId: number,
    data: UpdateSaccoAccountRequest
  ): Promise<SaccoAccount> => {
    const response = await apiClient.patch(`/saccos/account/${accountId}/`, data);
    return response.data;
  },

  /**
   * Get SACCO account transactions
   */
  getAccountTransactions: async (params?: {
    start_date?: string;
    end_date?: string;
    category?: string;
  }): Promise<SaccoAccountTransaction[]> => {
    const response = await apiClient.get('/saccos/account/transactions/', { params });
    return response.data;
  },

  /**
   * Get SACCO account summary
   */
  getAccountSummary: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<SaccoAccountSummary> => {
    const response = await apiClient.get('/saccos/account/summary/', { params });
    return response.data;
  },
};
