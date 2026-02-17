import type { ApiResponse } from './api';

// User role types
export type UserRole = 'admin' | 'super_admin';

// Admin user data from API
export interface AdminUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Login request payload
export interface LoginCredentials {
  username: string;
  password: string;
}

// Login response content from API (refresh token removed)
export interface LoginResponseContent {
  admin: AdminUser;
  accessToken: string;
  expiresIn: number;
}

// Full login response from API
export type LoginApiResponse = ApiResponse<LoginResponseContent>;

// Auth state in application (refresh token removed)
export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  accessToken: string | null;
  expiresIn: number | null;
}

// Frontend-friendly login response (refresh token removed)
export interface LoginResponse {
  ok: boolean;
  user?: AdminUser;
  token?: string;
  expiresIn?: number;
  error?: 'invalid_credentials' | 'account_locked' | 'server_error' | 'network_error';
  message?: string;
}
