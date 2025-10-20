import apiClient from './client';
import type { Sacco, Member, UpdateSaccoRequest } from '../types';

export const saccoApi = {
  /**
   * Get all SACCOs the user has access to
   */
  getMySaccos: async (): Promise<Sacco[]> => {
    const response = await apiClient.get('/saccos/my-saccos/');
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Get details of a specific SACCO
   */
  getSacco: async (saccoId: number): Promise<Sacco> => {
    const response = await apiClient.get(`/saccos/${saccoId}/`);
    return response.data;
  },

  /**
   * Update SACCO configuration
   */
  updateSacco: async (saccoId: number, data: UpdateSaccoRequest): Promise<Sacco> => {
    const response = await apiClient.patch(`/saccos/${saccoId}/`, data);
    return response.data;
  },

  /**
   * Get user's membership in a SACCO
   */
  getMyMembership: async (saccoId: number): Promise<Member> => {
    const response = await apiClient.get(`/saccos/${saccoId}/my-membership/`);
    return response.data;
  },
};
