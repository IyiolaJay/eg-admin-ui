import apiClient, { extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';
import type { 
  Agent, 
  CreateAgentRequest,
  AgentsListResponse, 
  AgentFilters,
  AgentSortOption,
  AgentsListApiResponse,
  AgentDetailApiResponse,
  CreateAgentApiResponse,
} from '../types/agent';

export interface FetchAgentsParams {
  offset?: number;
  limit?: number;
  sortBy?: AgentSortOption;
  filters?: AgentFilters;
}

/**
 * Fetch paginated list of agents
 */
export async function fetchAgents(params: FetchAgentsParams = {}): Promise<AgentsListResponse> {
  try {
    const { offset = 1, limit = 10, sortBy, filters } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('offset', offset.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('isAgent', 'true'); // Always fetch agents
    
    if (sortBy) {
      queryParams.append('sortBy', `${sortBy.field}:${sortBy.order}`);
    }
    
    if (filters?.isVerified !== undefined) {
      queryParams.append('isVerified', filters.isVerified.toString());
    }
    
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', filters.isActive.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `${ENDPOINTS.USERS_ALL}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<AgentsListApiResponse>(url);
    
    if (response.data.success && response.data.content) {
      // Transform API response to frontend format
      const { data, offset, limit, totalPages, totalElements } = response.data.content;
      return {
        agents: data,
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
    
    throw new Error(response.data.message || 'Failed to fetch agents');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch a single agent by ID
 */
export async function fetchAgentById(agentId: string): Promise<Agent> {
  try {
    const response = await apiClient.get<AgentDetailApiResponse>(
      ENDPOINTS.USER_DETAILS(agentId)
    );
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to fetch agent');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Create a new agent
 */
export async function createAgent(agentData: CreateAgentRequest): Promise<Agent> {
  try {
    const response = await apiClient.post<CreateAgentApiResponse>(
      ENDPOINTS.CREATE_AGENT,
      agentData
    );
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to create agent');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}
