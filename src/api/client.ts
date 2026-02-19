import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { CORE_API_URL, PAYMENT_API_URL, API_TIMEOUT } from './config';

// Custom API Error class to handle API response messages
export class ApiError extends Error {
  status: number;
  errorCode: string | null;

  constructor(message: string, status: number, errorCode: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

// Extract error message from API response
export function extractApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  
  // Fallback messages based on status code
  if (axiosError.response) {
    const status = axiosError.response.status;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed. Please try again.`;
    }
  }
  
  if (axiosError.request) {
    return 'Network error. Please check your connection.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Create axios instance for Core Services API
const apiClient: AxiosInstance = axios.create({
  baseURL: CORE_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Create axios instance for Payment Services API
export const paymentApiClient: AxiosInstance = axios.create({
  baseURL: PAYMENT_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token to requests (for both clients)
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

paymentApiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
const handleResponseError = async (error: AxiosError<{ success: boolean; message: string; error: string }>) => {
  // Handle 401 Unauthorized - Token expired or invalid
  if (error.response?.status === 401) {
    // Don't redirect if this is a login attempt - let the login page handle it
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/admin/login') || requestUrl.includes('/auth/login');
    
    if (!isLoginRequest) {
      // Clear auth data and redirect to login only for authenticated endpoints
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('expiresIn');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }

  // Handle network errors
  if (!error.response) {
    console.error('Network Error: No response received from server');
  }

  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleResponseError
);

paymentApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleResponseError
);

// Generic API request function
export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.request<T>({
    method,
    url,
    data,
    ...config,
  });
  return response.data;
}

// Export the configured axios instances
export default apiClient;
