import apiClient from './client';
import type { DeductionRule, CreateDeductionRuleRequest, UpdateDeductionRuleRequest } from '../types';

export const deductionsApi = {
  /**
   * Get all deduction rules for a SACCO
   */
  getDeductionRules: async (saccoId: number): Promise<DeductionRule[]> => {
    const response = await apiClient.get('/saccos/deduction-rules/', {
      params: { sacco: saccoId },
    });
    return response.data.results || response.data;
  },

  /**
   * Get a single deduction rule
   */
  getDeductionRule: async (ruleId: number): Promise<DeductionRule> => {
    const response = await apiClient.get(`/saccos/deduction-rules/${ruleId}/`);
    return response.data;
  },

  /**
   * Create a new deduction rule
   */
  createDeductionRule: async (data: CreateDeductionRuleRequest): Promise<DeductionRule> => {
    const response = await apiClient.post('/saccos/deduction-rules/', data);
    return response.data;
  },

  /**
   * Update a deduction rule
   */
  updateDeductionRule: async (
    ruleId: number,
    data: UpdateDeductionRuleRequest
  ): Promise<DeductionRule> => {
    const response = await apiClient.patch(`/saccos/deduction-rules/${ruleId}/`, data);
    return response.data;
  },

  /**
   * Delete a deduction rule
   */
  deleteDeductionRule: async (ruleId: number): Promise<void> => {
    await apiClient.delete(`/saccos/deduction-rules/${ruleId}/`);
  },
};
