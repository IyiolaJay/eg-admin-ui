import apiClient, { extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';
import type {
  Reward,
  RewardsListResponse,
  RewardFilters,
  RewardSortOption,
  RewardsListApiResponse,
  CreateRewardRequest,
  CreateRewardResponse,
  ConditionFieldsResponse,
  SaveConditionsRequest,
  RewardConditionsData,
} from '../types/reward';

export interface FetchRewardsParams {
  offset?: number;
  limit?: number;
  sortBy?: RewardSortOption;
  filters?: RewardFilters;
}

/**
 * Fetch active rewards (paginated)
 */
export async function fetchRewards(params: FetchRewardsParams = {}): Promise<RewardsListResponse> {
  try {
    const { offset = 1, limit = 10, sortBy, filters } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('offset', offset.toString());
    queryParams.append('limit', limit.toString());
    
    if (sortBy) {
      queryParams.append('sortBy', `${sortBy.field}:${sortBy.order}`);
    }
    
    if (filters?.rewardType) {
      queryParams.append('rewardType', filters.rewardType);
    }
    
    if (filters?.rewardClass) {
      queryParams.append('rewardClass', filters.rewardClass);
    }
    
    if (filters?.isActive !== undefined) {
      queryParams.append('isActive', filters.isActive.toString());
    }
    
    if (filters?.search) {
      queryParams.append('search', filters.search);
    }
    
    const queryString = queryParams.toString();
    const url = `${ENDPOINTS.REWARDS_ALL}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<RewardsListApiResponse>(url);
    
    if (response.data.success && response.data.content) {
      // Transform API response to frontend format
      const { data, offset, limit, totalPages, totalElements } = response.data.content;
      return {
        rewards: data,
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
    
    throw new Error(response.data.message || 'Failed to fetch rewards');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch a single reward by ID
 */
export async function fetchRewardById(rewardId: string): Promise<Reward> {
  try {
    const response = await apiClient.get<{ success: boolean; content: Reward; message: string }>(
      ENDPOINTS.REWARD_DETAILS(rewardId)
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch reward');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Create a new reward
 */
export async function createReward(rewardData: CreateRewardRequest): Promise<Reward> {
  try {
    const response = await apiClient.post<CreateRewardResponse>(
      ENDPOINTS.REWARDS,
      rewardData
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to create reward');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Activate or deactivate a reward
 */
export async function updateRewardStatus(rewardId: string, isActive: boolean): Promise<Reward> {
  try {
    const response = await apiClient.patch<{ success: boolean; content: Reward; message: string }>(
      ENDPOINTS.REWARD_DETAILS(rewardId),
      { isActive }
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || `Failed to ${isActive ? 'activate' : 'deactivate'} reward`);
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch available fields for condition building
 */
export async function fetchConditionFields(): Promise<ConditionFieldsResponse> {
  try {
    const response = await apiClient.get<{ success: boolean; content: ConditionFieldsResponse; message: string }>(
      ENDPOINTS.REWARD_FIELDS
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch condition fields');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Save conditions for a reward
 */
export async function saveRewardConditions(
  rewardId: string,
  conditions: SaveConditionsRequest
): Promise<RewardConditionsData> {
  try {
    const response = await apiClient.post<{ success: boolean; content: RewardConditionsData; message: string }>(
      ENDPOINTS.REWARD_CONDITIONS(rewardId),
      conditions
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to save reward conditions');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}
