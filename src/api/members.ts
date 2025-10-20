import apiClient from './client';
import type {
  Member,
  MemberFilters,
  CreateMemberRequest,
  UpdateMemberRequest,
} from '../types';

export interface MemberCreationResponse {
  message: string;
  member: Member;
  credentials?: {
    username: string;
    password: string;
  };
  instructions?: string;
}

export const membersApi = {
  /**
   * Get all members with filters
   */
  getMembers: async (saccoId: number, filters?: MemberFilters): Promise<Member[]> => {
    const response = await apiClient.get(`/saccos/${saccoId}/members/`, {
      params: filters,
    });
    // Backend returns paginated response: { count, next, previous, results }
    return response.data.results || response.data;
  },

  /**
   * Get a single member by ID
   */
  getMember: async (saccoId: number, memberId: number): Promise<Member> => {
    const response = await apiClient.get(`/saccos/${saccoId}/members/${memberId}/`);
    return response.data;
  },

  /**
   * Create a new member
   */
  createMember: async (saccoId: number, data: CreateMemberRequest): Promise<MemberCreationResponse> => {
    const response = await apiClient.post(`/saccos/${saccoId}/members/`, data);
    return response.data;
  },

  /**
   * Update a member
   */
  updateMember: async (saccoId: number, memberId: number, data: UpdateMemberRequest): Promise<Member> => {
    const response = await apiClient.patch(`/saccos/${saccoId}/members/${memberId}/`, data);
    return response.data;
  },

  /**
   * Delete a member
   */
  deleteMember: async (saccoId: number, memberId: number): Promise<void> => {
    await apiClient.delete(`/saccos/${saccoId}/members/${memberId}/`);
  },

  /**
   * Get current user's member profile
   */
  getCurrentMember: async (saccoId: number): Promise<Member> => {
    const response = await apiClient.get(`/saccos/${saccoId}/members/me/`);
    return response.data;
  },
};
