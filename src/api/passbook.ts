import apiClient from './client';
import type {
  MemberPassbook,
  PassbookSection,
  PassbookEntry,
  PassbookStatement,
  PassbookFilters,
  CreatePassbookEntryRequest,
  CreateSectionRequest,
  UpdateSectionRequest,
  PaginatedResponse,
} from '../types';

export const passbookApi = {
  /**
   * Get all passbooks (filtered by user's SACCO automatically by backend)
   */
  getPassbooks: async (): Promise<MemberPassbook[]> => {
    const response = await apiClient.get('/saccos/passbooks/');
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Get passbook entries for a specific meeting
   */
  getMeetingEntries: async (meetingId: number): Promise<PassbookEntry[]> => {
    const response = await apiClient.get('/saccos/entries/', {
      params: { meeting: meetingId },
    });
    return response.data.results || response.data;
  },

  /**
   * Get passbook for a member
   */
  getPassbook: async (passbookId: number): Promise<MemberPassbook> => {
    const response = await apiClient.get(`/saccos/passbooks/${passbookId}/`);
    return response.data;
  },

  /**
   * Get passbook statement with all sections and entries
   */
  getPassbookStatement: async (
    passbookId: number,
    filters?: PassbookFilters
  ): Promise<PassbookStatement> => {
    const response = await apiClient.get(`/saccos/passbooks/${passbookId}/statement/`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get all sections for a SACCO
   */
  getSections: async (saccoId: number): Promise<PassbookSection[]> => {
    const response = await apiClient.get('/saccos/sections/', {
      params: { sacco: saccoId },
    });
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Get a single section
   */
  getSection: async (sectionId: number): Promise<PassbookSection> => {
    const response = await apiClient.get(`/saccos/sections/${sectionId}/`);
    return response.data;
  },

  /**
   * Create a new section
   */
  createSection: async (data: CreateSectionRequest): Promise<PassbookSection> => {
    const response = await apiClient.post('/saccos/sections/', data);
    return response.data;
  },

  /**
   * Update a section
   */
  updateSection: async (sectionId: number, data: UpdateSectionRequest): Promise<PassbookSection> => {
    const response = await apiClient.patch(`/saccos/sections/${sectionId}/`, data);
    return response.data;
  },

  /**
   * Delete a section
   */
  deleteSection: async (sectionId: number): Promise<void> => {
    await apiClient.delete(`/saccos/sections/${sectionId}/`);
  },

  /**
   * Get passbook entries
   */
  getEntries: async (filters?: PassbookFilters): Promise<PaginatedResponse<PassbookEntry>> => {
    const response = await apiClient.get('/saccos/entries/', {
      params: filters,
    });
    // Already returns PaginatedResponse type, keep as is
    return response.data;
  },

  /**
   * Create a passbook entry
   */
  createEntry: async (data: CreatePassbookEntryRequest): Promise<PassbookEntry> => {
    const response = await apiClient.post('/saccos/entries/', data);
    return response.data;
  },
};
