import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Calendar, User, Users, Briefcase, ChevronRight, Tag, Settings, Power, Eye, Search } from 'lucide-react';
import { Pagination } from './Pagination';
import type { Reward, RewardType, RewardClass } from '../types/reward';

interface RewardsListProps {
  rewards: Reward[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  selectedType: RewardType | 'ALL';
  selectedClass: RewardClass | 'ALL';
  selectedActive: boolean | 'ALL';
  searchQuery: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onTypeChange: (type: RewardType | 'ALL') => void;
  onClassChange: (rewardClass: RewardClass | 'ALL') => void;
  onActiveChange: (isActive: boolean | 'ALL') => void;
  onSearchChange: (query: string) => void;
  onDeactivateClick?: (reward: Reward) => void;
}

const REWARD_TYPES: { value: RewardType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'DISCOUNT', label: 'Discounts' },
  { value: 'REFERRAL', label: 'Referrals' },
  { value: 'CASHBACK', label: 'Cashbacks' },
  { value: 'BONUS', label: 'Bonuses' },
  { value: 'LOYALTY', label: 'Loyalty' },
];

const REWARD_CLASSES: { value: RewardClass | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Classes' },
  { value: 'CREATOR', label: 'Creators' },
  { value: 'RUNNER', label: 'Runners' },
];

const ACTIVE_OPTIONS: { value: boolean | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

export const RewardsList: React.FC<RewardsListProps> = ({
  rewards,
  loading = false,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  selectedType,
  selectedClass,
  selectedActive,
  searchQuery,
  onPageChange,
  onPageSizeChange,
  onTypeChange,
  onClassChange,
  onActiveChange,
  onSearchChange,
  onDeactivateClick,
}) => {
  const navigate = useNavigate();

  const getRewardTypeColor = (type: RewardType) => {
    const colors: Record<RewardType, string> = {
      BONUS: 'bg-blue-100 text-blue-700 border-blue-200',
      REFERRAL: 'bg-purple-100 text-purple-700 border-purple-200',
      DISCOUNT: 'bg-green-100 text-green-700 border-green-200',
      CASHBACK: 'bg-orange-100 text-orange-700 border-orange-200',
      LOYALTY: 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRewardTypeIcon = (type: RewardType) => {
    const icons: Record<RewardType, React.ReactNode> = {
      BONUS: <Gift size={24} />,
      REFERRAL: <Users size={24} />,
      DISCOUNT: <Tag size={24} />,
      CASHBACK: <Gift size={24} />,
      LOYALTY: <Gift size={24} />,
    };
    return icons[type] || <Gift size={24} />;
  };

  const getRewardClassLabel = (rewardClass: RewardClass) => {
    const labels: Record<RewardClass, string> = {
      RUNNER: 'For Runners',
      CREATOR: 'For Creators',
      ALL: 'For Everyone',
    };
    return labels[rewardClass];
  };

  const getRewardClassIcon = (rewardClass: RewardClass) => {
    const icons: Record<RewardClass, React.ReactNode> = {
      RUNNER: <Briefcase size={16} />,
      CREATOR: <User size={16} />,
      ALL: <Users size={16} />,
    };
    return icons[rewardClass];
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleViewDetails = (rewardId: string) => {
    navigate(`/admin/reward-hub/rewards/${rewardId}`);
  };

  const handleConfigureConditions = (rewardId: string) => {
    navigate(`/admin/reward-hub/rewards/${rewardId}/conditions`);
  };

  const selectedTypeLabel = REWARD_TYPES.find(t => t.value === selectedType)?.label || 'All Categories';

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 bg-gray-200 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="space-y-6">
        {/* Filter Bar - Always show */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="w-full sm:w-64">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rewards..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                <div className="flex flex-wrap gap-1">
                  {REWARD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => onTypeChange(type.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedType === type.value
                          ? 'bg-secondary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Class</label>
                <div className="flex flex-wrap gap-1">
                  {REWARD_CLASSES.map((cls) => (
                    <button
                      key={cls.value}
                      onClick={() => onClassChange(cls.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedClass === cls.value
                          ? 'bg-secondary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cls.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Status Filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <div className="flex flex-wrap gap-1">
                  {ACTIVE_OPTIONS.map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => onActiveChange(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedActive === option.value
                          ? 'bg-secondary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Showing 0 of {totalItems} rewards
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {selectedType === 'ALL' ? 'No Rewards Found' : `No ${selectedTypeLabel} Available`}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {selectedType === 'ALL' 
              ? 'There are no active rewards in the system at the moment.'
              : `There are no ${selectedTypeLabel.toLowerCase()} rewards available at the moment.`}
          </p>
          {selectedType !== 'ALL' && (
            <button
              onClick={() => onTypeChange('ALL')}
              className="text-secondary hover:text-secondary/80 font-medium"
            >
              View all rewards →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="w-full sm:w-64">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rewards..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
              <div className="flex flex-wrap gap-1">
                {REWARD_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => onTypeChange(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedType === type.value
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Class</label>
              <div className="flex flex-wrap gap-1">
                {REWARD_CLASSES.map((cls) => (
                  <button
                    key={cls.value}
                    onClick={() => onClassChange(cls.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedClass === cls.value
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cls.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Status Filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
              <div className="flex flex-wrap gap-1">
                {ACTIVE_OPTIONS.map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => onActiveChange(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedActive === option.value
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Showing {rewards.length} of {totalItems} rewards
          </div>
        </div>
      </div>

      {/* Rewards List - Vertical Layout */}
      <div className="space-y-4">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getRewardTypeColor(reward.rewardType)}`}>
                {getRewardTypeIcon(reward.rewardType)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleViewDetails(reward.id)}
                  >
                    {/* Title and Type Badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-secondary transition-colors">
                        {reward.rewardName}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getRewardTypeColor(reward.rewardType)}`}>
                        {reward.rewardType}
                      </span>
                      {reward.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3">
                      {reward.rewardDescription}
                    </p>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {/* Amount */}
                      <span className="text-xl font-bold text-gray-900">
                        {formatAmount(reward.rewardAmount)}
                      </span>
                      
                      <span className="text-gray-300">|</span>
                      
                      {/* Target Audience */}
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        {getRewardClassIcon(reward.rewardClass)}
                        {getRewardClassLabel(reward.rewardClass)}
                      </span>
                      
                      <span className="text-gray-300">|</span>
                      
                      {/* Date */}
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <Calendar size={14} />
                        Created {formatDate(reward.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewDetails(reward.id)}
                      className="p-2 text-gray-500 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    
                    {reward.isActive ? (
                      <>
                        <button
                          onClick={() => handleConfigureConditions(reward.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={reward.conditions && reward.conditions.length > 0 ? 'Edit Conditions' : 'Configure Conditions'}
                        >
                          <Settings size={20} />
                        </button>
                        
                        <button
                          onClick={() => onDeactivateClick?.(reward)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate Reward"
                        >
                          <Power size={20} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onDeactivateClick?.(reward)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Reactivate Reward"
                      >
                        <Power size={20} className="rotate-180" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleViewDetails(reward.id)}
                      className="p-2 text-gray-400 group-hover:text-secondary transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};
