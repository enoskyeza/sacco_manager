import apiClient from './client';
import type {
  SaccoWithdrawal,
  WithdrawalFilters,
  CreateWithdrawalRequest,
  WithdrawalAvailableSummary,
} from '../types';

export const withdrawalsApi = {
  getWithdrawals: async (saccoId: number, filters?: WithdrawalFilters): Promise<SaccoWithdrawal[]> => {
    const response = await apiClient.get('/saccos/withdrawals/', {
      params: { sacco: saccoId, ...filters },
    });
    return response.data.results || response.data;
  },

  getWithdrawal: async (withdrawalId: number): Promise<SaccoWithdrawal> => {
    const response = await apiClient.get(`/saccos/withdrawals/${withdrawalId}/`);
    return response.data;
  },

  getAvailable: async (saccoId: number, memberId?: number): Promise<WithdrawalAvailableSummary> => {
    const response = await apiClient.get('/saccos/withdrawals/available/', {
      params: { sacco: saccoId, ...(memberId ? { member: memberId } : {}) },
    });
    return response.data;
  },

  createWithdrawal: async (data: CreateWithdrawalRequest): Promise<SaccoWithdrawal> => {
    const response = await apiClient.post('/saccos/withdrawals/', data);
    return response.data;
  },

  approveWithdrawal: async (withdrawalId: number): Promise<SaccoWithdrawal> => {
    const response = await apiClient.post(`/saccos/withdrawals/${withdrawalId}/approve/`);
    return response.data;
  },

  rejectWithdrawal: async (withdrawalId: number, rejectionReason: string): Promise<SaccoWithdrawal> => {
    const response = await apiClient.post(`/saccos/withdrawals/${withdrawalId}/reject/`, {
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  disburseWithdrawal: async (withdrawalId: number, disbursementDate: string): Promise<SaccoWithdrawal> => {
    const response = await apiClient.post(`/saccos/withdrawals/${withdrawalId}/disburse/`, {
      disbursement_date: disbursementDate,
    });
    return response.data;
  },
};
