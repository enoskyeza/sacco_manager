import apiClient from './client';
import type { DashboardMetrics, SavingsGrowthData, MemberPendingPayments } from '../types';

export const dashboardApi = {
  /**
   * Get dashboard metrics for a SACCO
   */
  getDashboardMetrics: async (saccoId: number): Promise<DashboardMetrics> => {
    const response = await apiClient.get(`/saccos/${saccoId}/analytics/dashboard/`);
    return response.data;
  },

  /**
   * Get savings growth data
   */
  getSavingsGrowth: async (saccoId: number, startDate?: string, endDate?: string): Promise<SavingsGrowthData> => {
    const response = await apiClient.get(`/saccos/${saccoId}/analytics/savings-growth/`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  /**
   * Get member growth analysis
   */
  getMemberGrowth: async (saccoId: number) => {
    const response = await apiClient.get(`/saccos/${saccoId}/analytics/member-growth/`);
    return response.data;
  },

  /**
   * Get meeting efficiency metrics
   */
  getMeetingEfficiency: async (saccoId: number) => {
    const response = await apiClient.get(`/saccos/${saccoId}/analytics/meeting-efficiency/`);
    return response.data;
  },

  /**
   * Get pending payments for a member (loans + weekly contributions)
   */
  getMemberPendingPayments: async (
    saccoId: number,
    memberId: number,
    daysAhead = 3,
  ): Promise<MemberPendingPayments> => {
    const response = await apiClient.get(
      `/saccos/${saccoId}/members/${memberId}/pending-payments/`,
      { params: { days: daysAhead } },
    );
    return response.data;
  },
};
