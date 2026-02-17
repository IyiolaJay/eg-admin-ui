import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { login, logout, getCurrentUser, isAuthenticated, getAuthToken } from '../services/auth';
import type { AdminUser } from '../types/auth';

// Mock axios
vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from '../api/client';

describe('Auth Service', () => {
  const mockUser: AdminUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'superadmin',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@errandgo.com',
    phoneNumber: '+2348123456789',
    role: 'super_admin',
    isActive: true,
    lastLogin: '2024-02-16T10:30:00.000Z',
    createdBy: '123e4567-e89b-12d3-a456-426614174000',
    createdAt: '2024-02-16T09:00:00.000Z',
    updatedAt: '2024-02-16T10:30:00.000Z',
  };

  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Request successful',
        content: {
          admin: mockUser,
          accessToken: 'mock-access-token',
          expiresIn: 86400,
        },
        error: null,
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

    const response = await login({
      username: 'superadmin',
      password: 'SuperAdmin@2024',
    });

    expect(response.ok).toBe(true);
    expect(response.user).toEqual(mockUser);
    expect(response.token).toBe('mock-access-token');
    expect(response.expiresIn).toBe(86400);

    // Verify sessionStorage was updated
    expect(sessionStorage.getItem('authToken')).toBe('mock-access-token');
    expect(JSON.parse(sessionStorage.getItem('user') || '{}')).toEqual(mockUser);
  });

  it('should return invalid_credentials error for 401 response', async () => {
    const mockError = {
      response: {
        status: 401,
        data: {
          success: false,
          message: 'Invalid username or password',
          content: null,
          error: 'Unauthorized',
        },
      },
    };

    vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

    const response = await login({
      username: 'wronguser',
      password: 'wrongpass',
    });

    expect(response.ok).toBe(false);
    expect(response.error).toBe('invalid_credentials');
    expect(response.message).toBe('Invalid username or password');
  });

  it('should return account_locked error for 403 response', async () => {
    const mockError = {
      response: {
        status: 403,
        data: {
          success: false,
          message: 'Account is locked',
          content: null,
          error: 'Forbidden',
        },
      },
    };

    vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

    const response = await login({
      username: 'lockeduser',
      password: 'password',
    });

    expect(response.ok).toBe(false);
    expect(response.error).toBe('account_locked');
    expect(response.message).toBe('Account is locked');
  });

  it('should return network_error when no response received', async () => {
    const mockError = {
      request: {},
      response: undefined,
    };

    vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

    const response = await login({
      username: 'user',
      password: 'pass',
    });

    expect(response.ok).toBe(false);
    expect(response.error).toBe('network_error');
    expect(response.message).toBe('Network error. Please check your connection.');
  });

  it('should logout and clear session storage', () => {
    // Setup session storage
    sessionStorage.setItem('authToken', 'token');
    sessionStorage.setItem('user', JSON.stringify(mockUser));

    logout();

    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('should return current user from session storage', () => {
    sessionStorage.setItem('user', JSON.stringify(mockUser));

    const user = getCurrentUser();

    expect(user).toEqual(mockUser);
  });

  it('should return null when no user in session storage', () => {
    const user = getCurrentUser();

    expect(user).toBeNull();
  });

  it('should return true when authenticated', () => {
    sessionStorage.setItem('authToken', 'valid-token');

    expect(isAuthenticated()).toBe(true);
  });

  it('should return false when not authenticated', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('should return auth token from session storage', () => {
    sessionStorage.setItem('authToken', 'my-token');

    expect(getAuthToken()).toBe('my-token');
  });
});
