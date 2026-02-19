/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Core Services API (Main Backend)
export const CORE_API_URL = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3001/api/v1';

// Additional Services (for future use)
export const NOTIFICATION_API_URL = import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:3002/api/v1';
export const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3003/api/v1';
export const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:3004/api/v1';

// API Configuration
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;
export const API_RETRY_COUNT = Number(import.meta.env.VITE_API_RETRY_COUNT) || 3;

// API Endpoints
export const ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  REFRESH_TOKEN: '/admin/refresh-token',
  
  // Admin Management
  ADMIN_PROFILE: '/admin/profile',
  ADMINS: '/admins',
  ADMIN_CREATE: '/admin/create',
  ADMIN_ALL: '/admin/all',
  
  // Availability Checks
  CHECK_EMAIL: (email: string) => `/admin/check-email/${email}`,
  CHECK_USERNAME: (username: string) => `/admin/check-username/${username}`,
  CHECK_PHONE: (phoneNumber: string) => `/admin/check-phone/${phoneNumber}`,
  
  // Admin Actions
  ADMIN_DEACTIVATE: (adminId: string) => `/admin/deactivate/${adminId}`,
  
  // Users
  USERS: '/users',
  USERS_ALL: '/users/all',
  USER_DETAILS: (id: string) => `/users/${id}`,
  CREATE_AGENT: '/users/create-agent-user',
  
  // Errands
  ERRANDS: '/errands',
  ERRAND_DETAILS: (id: string) => `/errands/${id}`,
  
  // Disputes
  DISPUTES: '/disputes',
  DISPUTE_DETAILS: (id: string) => `/disputes/${id}`,
  
  // Dashboard
  DASHBOARD_METRICS: '/dashboard/metrics',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  
  // Analytics
  ANALYTICS_TREND: '/analytics/trend',
  ANALYTICS_AGGREGATE: '/analytics/aggregate',
  ANALYTICS_TODAY: '/analytics/today',
  ANALYTICS_BY_DATE: (date: string) => `/analytics/date/${date}`,
  ANALYTICS_BY_RANGE: '/analytics/range',
  
  // Wallets
  WALLETS: '/wallets',
  WALLET_DETAILS: (id: string) => `/wallets/${id}`,
  
  // Agents
  AGENTS: '/agents',
  AGENT_DETAILS: (id: string) => `/agents/${id}`,
  
  // Rewards
  REWARDS: '/rewards',
  REWARDS_ACTIVE: '/rewards/get-active-rewards',
  REWARD_DETAILS: (id: string) => `/rewards/${id}`,
  REWARD_CONDITIONS: (id: string) => `/rewards/conditions/${id}`,
  REWARD_FIELDS: '/rewards/fields',
  
  // Failed Operations
  FAILED_OPERATIONS: '/operations/failed',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
} as const;
