import apiClient from './client';
import type { CashRoundSchedule, CreateCashRoundScheduleRequest } from '../types';

export const cashRoundApi = {
  /**
   * Get all cash round schedules for a SACCO
   */
  getCashRoundSchedules: async (saccoId: number): Promise<CashRoundSchedule[]> => {
    const response = await apiClient.get('/saccos/cash-round-schedules/', {
      params: { sacco: saccoId },
    });
    return response.data.results || response.data;
  },

  /**
   * Get a single cash round schedule
   */
  getCashRoundSchedule: async (scheduleId: number): Promise<CashRoundSchedule> => {
    const response = await apiClient.get(`/saccos/cash-round-schedules/${scheduleId}/`);
    return response.data;
  },

  /**
   * Create a new cash round schedule
   */
  createCashRoundSchedule: async (
    data: CreateCashRoundScheduleRequest
  ): Promise<CashRoundSchedule> => {
    const response = await apiClient.post('/saccos/cash-round-schedules/', data);
    return response.data;
  },

  /**
   * Update a cash round schedule
   */
  updateCashRoundSchedule: async (
    scheduleId: number,
    data: Partial<CashRoundSchedule>
  ): Promise<CashRoundSchedule> => {
    const response = await apiClient.patch(`/saccos/cash-round-schedules/${scheduleId}/`, data);
    return response.data;
  },

  /**
   * Delete a cash round schedule
   */
  deleteCashRoundSchedule: async (scheduleId: number): Promise<void> => {
    await apiClient.delete(`/saccos/cash-round-schedules/${scheduleId}/`);
  },

  /**
   * Advance cash round to next member
   */
  advanceCashRound: async (scheduleId: number): Promise<CashRoundSchedule> => {
    const response = await apiClient.post(
      `/saccos/cash-round-schedules/${scheduleId}/advance/`
    );
    return response.data;
  },
};
