import type { BaseModel } from './common';

/**
 * User interface
 */
export interface User extends BaseModel {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar?: string;
  is_staff: boolean;
  is_superuser: boolean;
  role: 'Admin' | 'Staff' | 'Customer' | 'Sacco Admin' | 'Sacco Member' | 'Sacco Secretary';
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Token refresh request
 */
export interface TokenRefreshRequest {
  refresh: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  access: string;
}
