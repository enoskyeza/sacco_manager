import apiClient from './client';
import type { User, LoginCredentials, LoginResponse, TokenRefreshResponse } from '../types';

export const authApi = {
  /**
   * Login with username and password
   * Backend sets refresh_token cookie automatically
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  /**
   * Logout
   * Clears the refresh_token cookie
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout/');
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  },
};
