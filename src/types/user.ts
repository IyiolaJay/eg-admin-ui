import type { ApiResponse, PaginationMeta } from './api';
import type { AdminUser, UserRole } from './auth';

// Re-export AdminUser as User for consistency
export type User = AdminUser;
export type { UserRole };

// Create user request
export interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
}

// Update user request
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
}

// API Response content structure for users list
export interface UsersListApiContent {
  data: User[];
  offset: number;
  limit: number;
  totalPages: number;
  totalElements: number;
}

// Users list response (normalized for frontend use)
export interface UsersListResponse {
  users: User[];
  pagination: PaginationMeta;
}

// API Response types
export type CreateUserApiResponse = ApiResponse<User>;
export type UpdateUserApiResponse = ApiResponse<User>;
export type UsersListApiResponse = ApiResponse<UsersListApiContent>;
export type UserDetailApiResponse = ApiResponse<User>;

// Availability check response
export interface AvailabilityCheckResponse {
  exists: boolean;
}

export type CheckEmailApiResponse = ApiResponse<AvailabilityCheckResponse>;
export type CheckUsernameApiResponse = ApiResponse<AvailabilityCheckResponse>;
export type CheckPhoneApiResponse = ApiResponse<AvailabilityCheckResponse>;

// User filters
export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

// Sort options
export type SortField = 'createdAt' | 'username' | 'email' | 'role' | 'lastLogin';
export type SortOrder = 'Asc' | 'Desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
}
