/**
 * Standard API Response Types
 * Based on the backend API structure
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  content: T | null;
  error: string | null;
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Paginated API Response
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination?: PaginationMeta;
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  message: string;
  content: null;
  error: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Request Config
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}
