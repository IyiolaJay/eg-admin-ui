import type { AxiosError } from 'axios';
import apiClient, { extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';
import type { LoginCredentials, LoginResponse, LoginApiResponse } from '../types/auth';

/**
 * Authentication service for admin login
 * Integrates with the real API
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginApiResponse>(
      ENDPOINTS.ADMIN_LOGIN,
      {
        username: credentials.username,
        password: credentials.password,
      }
    );

    const data = response.data;

    if (data.success && data.content) {
      const { admin, accessToken, expiresIn } = data.content;

      // Store token and user data (no refresh token)
      sessionStorage.setItem('authToken', accessToken);
      sessionStorage.setItem('user', JSON.stringify(admin));
      sessionStorage.setItem('userRole', admin.role);
      sessionStorage.setItem('expiresIn', expiresIn.toString());

      return {
        ok: true,
        user: admin,
        token: accessToken,
        expiresIn,
      };
    } else {
      return {
        ok: false,
        error: 'invalid_credentials',
        message: data.message || 'Login failed',
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError<LoginApiResponse>;

    // Handle different error types
    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;

      // Map HTTP status codes and API error responses - prioritize API message
      if (status === 401) {
        return {
          ok: false,
          error: 'invalid_credentials',
          message: errorData?.message || 'Invalid username or password',
        };
      } else if (status === 403) {
        return {
          ok: false,
          error: 'account_locked',
          message: errorData?.message || 'Your account has been locked',
        };
      } else if (status >= 500) {
        return {
          ok: false,
          error: 'server_error',
          message: errorData?.message || 'Server error. Please try again later.',
        };
      }

      return {
        ok: false,
        error: 'server_error',
        message: errorData?.message || extractApiErrorMessage(error),
      };
    } else if (axiosError.request) {
      // Network error
      return {
        ok: false,
        error: 'network_error',
        message: 'Network error. Please check your connection.',
      };
    } else {
      return {
        ok: false,
        error: 'server_error',
        message: extractApiErrorMessage(error),
      };
    }
  }
}

/**
 * Logout function - clears stored tokens
 */
export function logout(): void {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('expiresIn');
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
  const userStr = sessionStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('authToken');
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  return sessionStorage.getItem('authToken');
}

/**
 * Get current user role
 */
export function getCurrentUserRole(): string | null {
  const user = getCurrentUser();
  return user?.role || null;
}

/**
 * Check if current user is super admin
 */
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'super_admin';
}
