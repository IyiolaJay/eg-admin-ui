import type { ApiResponse, PaginationMeta } from './api';

// Reward types
export type RewardType = 'BONUS' | 'REFERRAL' | 'DISCOUNT' | 'CASHBACK' | 'LOYALTY';
export type RewardClass = 'RUNNER' | 'CREATOR' | 'ALL';

// Reward data from API
export interface Reward {
  id: string;
  rewardName: string;
  rewardAmount: string;
  rewardType: RewardType;
  rewardDescription: string;
  isActive: boolean;
  rewardClass: RewardClass;
  createdAt: string;
  updatedAt: string;
}

// API Response content structure
export interface RewardsListApiContent {
  data: Reward[];
  offset: number;
  limit: number;
  totalPages: number;
  totalElements: number;
}

// Rewards list response (normalized for frontend use)
export interface RewardsListResponse {
  rewards: Reward[];
  pagination: PaginationMeta;
}

// API Response types
export type RewardsListApiResponse = ApiResponse<RewardsListApiContent>;

// Reward filters
export interface RewardFilters {
  rewardType?: RewardType;
  rewardClass?: RewardClass;
  isActive?: boolean;
  search?: string;
}

// Sort options
export type RewardSortField = 'createdAt' | 'rewardName' | 'rewardAmount' | 'rewardType';
export type RewardSortOrder = 'Asc' | 'Desc';

export interface RewardSortOption {
  field: RewardSortField;
  order: RewardSortOrder;
}
