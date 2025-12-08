import apiClient from './client';
import type {
  WeeklyMeeting,
  WeeklyMeetingDetail,
  WeeklyContribution,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  CreateContributionRequest,
  BulkCreateContributionsRequest,
  CashRoundSchedule,
  CashRoundScheduleDetail,
  MeetingFilters,
  PaginatedResponse,
  PassbookEntry,
} from '../types';

export const meetingsApi = {
  /**
   * Get all meetings
   */
  getMeetings: async (saccoId: number, filters?: MeetingFilters): Promise<PaginatedResponse<WeeklyMeeting>> => {
    const response = await apiClient.get(`/saccos/${saccoId}/meetings/`, {
      params: { ...filters },
    });
    return response.data;
  },

  /**
   * Get a single meeting with contributions
   */
  getMeeting: async (meetingId: number): Promise<WeeklyMeetingDetail> => {
    const response = await apiClient.get(`/saccos/meetings/${meetingId}/`);
    return response.data;
  },

  /**
   * Create a new meeting
   */
  createMeeting: async (data: CreateMeetingRequest): Promise<WeeklyMeeting> => {
    const response = await apiClient.post(`/saccos/${data.sacco}/meetings/`, data);
    return response.data;
  },

  /**
   * Update a meeting
   */
  updateMeeting: async (meetingId: number, data: UpdateMeetingRequest): Promise<WeeklyMeeting> => {
    const response = await apiClient.patch(`/saccos/meetings/${meetingId}/`, data);
    return response.data;
  },

  /**
   * Finalize a meeting (create passbook entries, advance schedule)
   */
  finalizeMeeting: async (meetingId: number): Promise<WeeklyMeeting> => {
    const response = await apiClient.post(`/saccos/meetings/${meetingId}/finalize/`);
    return response.data;
  },

  /**
   * Reset a finalized meeting (undo finalization)
   */
  resetMeeting: async (meetingId: number): Promise<WeeklyMeeting> => {
    const response = await apiClient.post(`/saccos/meetings/${meetingId}/reset/`);
    return response.data.meeting || response.data;
  },

  /**
   * Record a defaulter for a meeting (SACCO covers missed contribution)
   */
  recordDefaulter: async (
    meetingId: number,
    data: { member_id: number; amount?: string; notes?: string }
  ): Promise<any> => {
    const response = await apiClient.post(`/saccos/meetings/${meetingId}/record_defaulter/`, data);
    return response.data;
  },

  /**
   * Get contributions for a meeting
   */
  getContributions: async (meetingId: number): Promise<WeeklyContribution[]> => {
    const response = await apiClient.get('/saccos/contributions/', {
      params: { meeting: meetingId },
    });
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Create a contribution
   */
  createContribution: async (data: CreateContributionRequest): Promise<WeeklyContribution> => {
    const response = await apiClient.post('/saccos/contributions/', data);
    return response.data;
  },

  /**
   * Record a contribution (simple interface for collection)
   */
  recordContribution: async (data: {
    meeting: number;
    member: number;
    section: number;
    amount: string;
  }): Promise<PassbookEntry> => {
    // For now, create a passbook entry directly
    const response = await apiClient.post('/saccos/passbooks/entries/', {
      member: data.member,
      section: data.section,
      transaction_type: 'credit',
      amount: data.amount,
      description: `Week contribution`,
      reference_number: `MTG-${data.meeting}`,
    });
    return response.data;
  },

  /**
   * Bulk create contributions
   */
  bulkCreateContributions: async (data: BulkCreateContributionsRequest): Promise<WeeklyContribution[]> => {
    const response = await apiClient.post('/saccos/contributions/bulk_create/', data);
    return response.data;
  },

  /**
   * Update a contribution
   */
  updateContribution: async (contributionId: number, data: Partial<CreateContributionRequest>): Promise<WeeklyContribution> => {
    const response = await apiClient.patch(`/saccos/contributions/${contributionId}/`, data);
    return response.data;
  },

  /**
   * Delete a contribution
   */
  deleteContribution: async (contributionId: number): Promise<void> => {
    await apiClient.delete(`/saccos/contributions/${contributionId}/`);
  },

  /**
   * Get cash round schedule
   */
  getCashRoundSchedule: async (saccoId: number): Promise<CashRoundScheduleDetail> => {
    const response = await apiClient.get(`/saccos/${saccoId}/cash-round-schedules/`, {
      params: { is_active: true },
    });
    // API returns array, we take the first active one
    return response.data.results?.[0] || response.data[0];
  },

  /**
   * Create cash round schedule
   */
  createCashRoundSchedule: async (data: Partial<CashRoundSchedule>): Promise<CashRoundSchedule> => {
    const response = await apiClient.post('/saccos/cash-round-schedules/', data);
    return response.data;
  },

  /**
   * Update cash round schedule
   */
  updateCashRoundSchedule: async (scheduleId: number, data: Partial<CashRoundSchedule>): Promise<CashRoundSchedule> => {
    const response = await apiClient.patch(`/saccos/cash-round-schedules/${scheduleId}/`, data);
    return response.data;
  },

  /**
   * Advance to next member in rotation
   */
  advanceCashRound: async (scheduleId: number): Promise<CashRoundSchedule> => {
    const response = await apiClient.post(`/saccos/cash-round-schedules/${scheduleId}/advance/`);
    return response.data;
  },

  /**
   * Get current recipient
   */
  getCurrentRecipient: async (scheduleId: number) => {
    const response = await apiClient.get(`/saccos/cash-round-schedules/${scheduleId}/current_recipient/`);
    return response.data;
  },
};
