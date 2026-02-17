import type { ApiResponse, PaginationMeta } from './api';

// Auth method types
export type AuthMethod = 'PHONE' | 'EMAIL' | 'GOOGLE' | 'APPLE';

// Primary usage types
export type PrimaryUsage = 'SENDER' | 'RUNNER' | 'BOTH';

// Agent data from API
export interface Agent {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string;
  country: string | null;
  primaryUsage: PrimaryUsage | null;
  isVerified: boolean;
  isActive: boolean;
  isAgent: boolean;
  authMethod: AuthMethod;
  profileImageUrl: string | null;
  referralCode: string;
  createdAt: string;
  lastLogin: string;
}

// Create agent request
export interface CreateAgentRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

// API Response content structure
export interface AgentsListApiContent {
  data: Agent[];
  offset: number;
  limit: number;
  totalPages: number;
  totalElements: number;
}

// Agents list response (normalized for frontend use)
export interface AgentsListResponse {
  agents: Agent[];
  pagination: PaginationMeta;
}

// API Response types
export type AgentsListApiResponse = ApiResponse<AgentsListApiContent>;
export type AgentDetailApiResponse = ApiResponse<Agent>;
export type CreateAgentApiResponse = ApiResponse<Agent>;

// Agent filters
export interface AgentFilters {
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
}

// Sort options
export type AgentSortField = 'createdAt' | 'firstName' | 'lastName' | 'phoneNumber' | 'lastLogin';
export type AgentSortOrder = 'Asc' | 'Desc';

export interface AgentSortOption {
  field: AgentSortField;
  order: AgentSortOrder;
}
