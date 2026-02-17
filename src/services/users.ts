import apiClient, { extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UsersListResponse, 
  UserFilters,
  SortOption,
  UsersListApiResponse,
  CreateUserApiResponse,
  UpdateUserApiResponse,
  UserDetailApiResponse,
  CheckEmailApiResponse,
  CheckUsernameApiResponse,
  CheckPhoneApiResponse,
} from '../types/user';

export interface FetchUsersParams {
  offset?: number;
  limit?: number;
  sortBy?: SortOption;
  filters?: UserFilters;
}

/**
 * Fetch paginated list of admin users
 */
export async function fetchUsers(params: FetchUsersParams = {}): Promise<UsersListResponse> {
  try {
    const { offset = 1, limit = 10, sortBy, filters } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('offset', offset.toString());
    queryParams.append('limit', limit.toString());
    
    if (sortBy) {
      queryParams.append('sortBy', `${sortBy.field}:${sortBy.order}`);
    }
    
    if (filters?.role) {
      queryParams.append('role', filters.role);
    }
    
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', filters.isActive.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `${ENDPOINTS.ADMIN_ALL}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<UsersListApiResponse>(url);
    
    if (response.data.success && response.data.content) {
      // Transform API response to frontend format
      const { data, offset, limit, totalPages, totalElements } = response.data.content;
      return {
        users: data,
        pagination: {
          currentPage: offset,
          totalPages,
          pageSize: limit,
          totalItems: totalElements,
          hasNextPage: offset < totalPages,
          hasPrevPage: offset > 1,
        },
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch users');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch a single user by ID
 */
export async function fetchUserById(userId: string): Promise<User> {
  try {
    const response = await apiClient.get<UserDetailApiResponse>(
      ENDPOINTS.USER_DETAILS(userId)
    );
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to fetch user');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Create a new admin user
 */
export async function createUser(userData: CreateUserRequest): Promise<User> {
  try {
    const response = await apiClient.post<CreateUserApiResponse>(
      ENDPOINTS.ADMIN_CREATE,
      userData
    );
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to create user');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Update an existing user
 */
export async function updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
  try {
    const response = await apiClient.patch<UpdateUserApiResponse>(
      ENDPOINTS.USER_DETAILS(userId),
      userData
    );
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to update user');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Deactivate a user
 */
export async function deactivateUser(userId: string): Promise<User> {
  try {
    const response = await apiClient.patch<UpdateUserApiResponse>(
      ENDPOINTS.ADMIN_DEACTIVATE(userId)
    );
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to deactivate user');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Activate a user
 */
export async function activateUser(userId: string): Promise<User> {
  return updateUser(userId, { isActive: true });
}

/**
 * Check if email is available
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  try {
    const response = await apiClient.get<CheckEmailApiResponse>(
      ENDPOINTS.CHECK_EMAIL(email)
    );
    
    if (response.data.success && response.data.content) {
      return !response.data.content.exists;
    }
    
    return false;
  } catch {
    // Don't throw on availability check - just return false
    return false;
  }
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const response = await apiClient.get<CheckUsernameApiResponse>(
      ENDPOINTS.CHECK_USERNAME(username)
    );
    
    if (response.data.success && response.data.content) {
      return !response.data.content.exists;
    }
    
    return false;
  } catch {
    // Don't throw on availability check - just return false
    return false;
  }
}

/**
 * Check if phone number is available
 */
export async function checkPhoneAvailability(phoneNumber: string): Promise<boolean> {
  try {
    const response = await apiClient.get<CheckPhoneApiResponse>(
      ENDPOINTS.CHECK_PHONE(phoneNumber)
    );
    
    if (response.data.success && response.data.content) {
      return !response.data.content.exists;
    }
    
    return false;
  } catch {
    // Don't throw on availability check - just return false
    return false;
  }
}
