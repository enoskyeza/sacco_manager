import apiClient from './client';
import type { CashRoundSchedule, CreateCashRoundScheduleRequest, WeeklyMeeting } from '../types';

// Types for new Cash Round structure
export interface CashRound {
  id: number;
  uuid: string;
  sacco: number;
  sacco_name: string;
  name: string;
  round_number: number;
  start_date: string;
  expected_end_date: string;
  actual_end_date?: string;
  weekly_amount: string;
  num_weeks: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  created_by?: number;
  created_by_name?: string;
  started_at?: string;
  completed_at?: string;
  notes: string;
  member_count: number;
  members?: CashRoundMember[];
  schedule?: CashRoundSchedule;
  created_at: string;
  updated_at: string;
}

export interface CashRoundMember {
  id: number;
  uuid: string;
  cash_round: number;
  member: number;
  member_number: string;
  member_name: string;
  position_in_rotation: number;
  is_active: boolean;
  joined_at: string;
  left_at?: string;
}

export interface CreateCashRoundRequest {
  name: string;
  start_date: string;
  weekly_amount: number;
  member_ids: number[];
  notes?: string;
}

export const cashRoundApi = {
  // ============ NEW CASH ROUND ENDPOINTS ============
  
  /**
   * Get all cash rounds for a SACCO
   */
  getCashRounds: async (saccoId: number, status?: string): Promise<CashRound[]> => {
    const params: { sacco: number; status?: string } = { sacco: saccoId };
    if (status) params.status = status;
    
    const response = await apiClient.get(`/saccos/${saccoId}/cash-rounds/`, { params });
    return response.data.results || response.data;
  },

  /**
   * Get active cash rounds for a SACCO
   */
  getActiveCashRounds: async (saccoId: number): Promise<CashRound[]> => {
    const response = await apiClient.get(`/saccos/${saccoId}/cash-rounds/active/`);
    return response.data.results || response.data;
  },

  /**
   * Get a single cash round
   */
  getCashRound: async (saccoId: number, roundId: number): Promise<CashRound> => {
    const response = await apiClient.get(`/saccos/${saccoId}/cash-rounds/${roundId}/`);
    return response.data;
  },

  /**
   * Create a new cash round
   */
  createCashRound: async (saccoId: number, data: CreateCashRoundRequest): Promise<CashRound> => {
    console.log('=== API CLIENT: Creating Cash Round ===');
    console.log('SACCO ID:', saccoId);
    console.log('Request Data:', data);
    console.log('URL:', `/saccos/${saccoId}/cash-rounds/`);
    
    try {
      const response = await apiClient.post(`/saccos/${saccoId}/cash-rounds/`, data);
      console.log('Success Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== API CLIENT ERROR ===');
      console.error('Error:', error);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
        console.error('Response Headers:', error.response.headers);
      }
      throw error;
    }
  },

  /**
   * Update a cash round
   */
  updateCashRound: async (
    saccoId: number,
    roundId: number,
    data: Partial<CreateCashRoundRequest>
  ): Promise<CashRound> => {
    const response = await apiClient.patch(`/saccos/${saccoId}/cash-rounds/${roundId}/`, data);
    return response.data;
  },

  /**
   * Delete a cash round
   */
  deleteCashRound: async (saccoId: number, roundId: number): Promise<void> => {
    await apiClient.delete(`/saccos/${saccoId}/cash-rounds/${roundId}/`);
  },

  /**
   * Start a cash round (creates first meeting automatically)
   */
  startCashRound: async (saccoId: number, roundId: number): Promise<{ cash_round: CashRound; meeting: WeeklyMeeting; message: string }> => {
    const response = await apiClient.post(`/saccos/${saccoId}/cash-rounds/${roundId}/start-round/`);
    return response.data;
  },

  /**
   * Create next meeting in the cash round
   */
  startNextMeeting: async (saccoId: number, roundId: number): Promise<{ meeting: WeeklyMeeting; message: string }> => {
    const response = await apiClient.post(`/saccos/${saccoId}/cash-rounds/${roundId}/start-next-meeting/`);
    return response.data;
  },

  /**
   * Complete a cash round
   */
  completeCashRound: async (saccoId: number, roundId: number): Promise<CashRound> => {
    const response = await apiClient.post(`/saccos/${saccoId}/cash-rounds/${roundId}/complete/`);
    return response.data;
  },

  /**
   * Get members of a cash round
   */
  getCashRoundMembers: async (saccoId: number, roundId: number): Promise<CashRoundMember[]> => {
    const response = await apiClient.get(`/saccos/${saccoId}/cash-rounds/${roundId}/members/`);
    return response.data.results || response.data;
  },

  /**
   * Add a member to a cash round
   */
  addMemberToCashRound: async (
    saccoId: number,
    roundId: number,
    memberId: number,
    position?: number
  ): Promise<CashRoundMember> => {
    const response = await apiClient.post(`/saccos/${saccoId}/cash-rounds/${roundId}/members/`, {
      member_id: memberId,
      position,
    });
    return response.data;
  },

  /**
   * Remove a member from a cash round
   */
  removeMemberFromCashRound: async (
    saccoId: number,
    roundId: number,
    memberId: number
  ): Promise<void> => {
    await apiClient.delete(`/saccos/${saccoId}/cash-rounds/${roundId}/members/${memberId}/`);
  },

  // ============ LEGACY CASH ROUND SCHEDULE ENDPOINTS ============
  
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
