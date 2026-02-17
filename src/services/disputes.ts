import apiClient, { extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';
import type { Dispute } from '../components/DisputesTable';

export interface FetchDisputesParams {
  offset?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  status?: string;
  priority?: string;
  module?: string;
  raisedBy?: string;
  assignedTo?: string;
  disputeItemId?: string;
}

export interface DisputesListResponse {
  disputes: Dispute[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

// API Response format - matches actual API structure
interface DisputesApiResponse {
  success: boolean;
  message: string;
  content: {
    data: Dispute[];
    offset: number;
    limit: number;
    totalPages: number;
    totalElements: number;
  } | null;
  error: string | null;
}

interface SingleDisputeApiResponse {
  success: boolean;
  message: string;
  content: Dispute | null;
  error: string | null;
}

/**
 * Fetch disputes with pagination and optional filters
 */
export async function fetchDisputes(params: FetchDisputesParams = {}): Promise<DisputesListResponse> {
  try {
    const { offset = 1, limit = 10, sortBy, search, status, priority, module, raisedBy, assignedTo, disputeItemId } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('offset', String(offset));
    queryParams.append('limit', String(limit));
    
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (priority) queryParams.append('priority', priority);
    if (module) queryParams.append('module', module);
    if (raisedBy) queryParams.append('raisedBy', raisedBy);
    if (assignedTo) queryParams.append('assignedTo', assignedTo);
    if (disputeItemId) queryParams.append('disputeItemId', disputeItemId);
    
    const url = `${ENDPOINTS.DISPUTES}?${queryParams.toString()}`;
    
    const response = await apiClient.get<DisputesApiResponse>(url);
    
    // Check for successful response with content
    if (response.data.success && response.data.content) {
      const { data, offset, limit, totalElements } = response.data.content;
      return {
        disputes: data || [],
        pagination: {
          offset,
          limit,
          total: totalElements,
        },
      };
    }
    
    // If success is true but content is null/empty, return empty array
    if (response.data.success) {
      return {
        disputes: [],
        pagination: {
          offset: params.offset || 1,
          limit: params.limit || 10,
          total: 0,
        },
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch disputes');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch disputes assigned to the current user
 */
export async function fetchMyDisputes(): Promise<Dispute[]> {
  try {
    const response = await apiClient.get<DisputesApiResponse>(`${ENDPOINTS.DISPUTES}/my`);
    
    if (response.data.success && response.data.content) {
      return response.data.content.data || [];
    }
    
    return [];
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Get dispute by ID
 */
export async function fetchDisputeById(id: string): Promise<Dispute> {
  try {
    const response = await apiClient.get<SingleDisputeApiResponse>(ENDPOINTS.DISPUTE_DETAILS(id));
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to fetch dispute details');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}
