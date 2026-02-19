import type { ApiResponse, PaginationMeta } from './api';

// Reward types
export type RewardType = 'BONUS' | 'REFERRAL' | 'DISCOUNT' | 'CASHBACK' | 'LOYALTY';
export type RewardClass = 'RUNNER' | 'CREATOR' | 'ALL';

// Condition data
export interface RewardCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  value2?: string;
}

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
  metadata?: {
    conditions?: RewardCondition[];
  };
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

// Create reward request
export interface CreateRewardRequest {
  rewardName: string;
  rewardAmount: number;
  rewardDescription: string;
  rewardType: RewardType;
  rewardClass: RewardClass;
}

// Create reward response
export type CreateRewardResponse = ApiResponse<Reward>;

// Condition field types
export type ConditionFieldType = 'string' | 'number' | 'boolean' | 'enum';

export interface ConditionField {
  name: string;
  type: ConditionFieldType;
  values?: string[]; // For enum type
}

export interface ConditionEntity {
  name: string;
  fields: ConditionField[];
}

export interface ConditionFieldsResponse {
  entities: ConditionEntity[];
}

// Condition logic types
export type LogicOperator = 'and' | 'or';

export type ComparisonOperator = '==' | '!=' | '>' | '<' | '>=' | '<=';

export interface ConditionRule {
  field: string;
  operator: ComparisonOperator;
  value: string | number | boolean;
}

export interface ConditionLogic {
  and?: (ConditionRule | ConditionLogic)[];
  or?: (ConditionRule | ConditionLogic)[];
}

export interface SaveConditionsRequest {
  logic: ConditionLogic;
}

export interface RewardConditionsData {
  id: string;
  rewardId: string;
  logic: ConditionLogic;
  createdAt: string;
  updatedAt: string;
}
