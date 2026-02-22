import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, Button, Toast } from '../components';
import { RewardsList } from '../components/RewardsList';
import { Plus, Eye, ArrowLeft } from 'lucide-react';
import { fetchRewards, updateRewardStatus } from '../services/rewards';
import type { Reward, RewardType, RewardClass } from '../types/reward';

// View states
type ViewState = 'landing' | 'list';

export const RewardHub: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedType, setSelectedType] = useState<RewardType | 'ALL'>('ALL');
  const [selectedClass, setSelectedClass] = useState<RewardClass | 'ALL'>('ALL');
  const [selectedActive, setSelectedActive] = useState<boolean | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [rewardToDeactivate, setRewardToDeactivate] = useState<Reward | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadRewards = async () => {
    if (currentView !== 'list') return;
    
    setLoading(true);
    try {
      const filters: {
        rewardType?: RewardType;
        rewardClass?: RewardClass;
        isActive?: boolean;
        search?: string;
      } = {};

      if (selectedType !== 'ALL') {
        filters.rewardType = selectedType;
      }
      if (selectedClass !== 'ALL') {
        filters.rewardClass = selectedClass;
      }
      if (selectedActive !== 'ALL') {
        filters.isActive = selectedActive;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await fetchRewards({
        offset: currentPage,
        limit: pageSize,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      setRewards(response.rewards);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to load rewards',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, currentView, selectedType, selectedClass, selectedActive, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: RewardType | 'ALL') => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleClassChange = (rewardClass: RewardClass | 'ALL') => {
    setSelectedClass(rewardClass);
    setCurrentPage(1);
  };

  const handleActiveChange = (isActive: boolean | 'ALL') => {
    setSelectedActive(isActive);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCreateReward = () => {
    navigate('/admin/reward-hub/create');
  };

  const handleStatusToggleClick = (reward: Reward) => {
    setRewardToDeactivate(reward);
    setShowDeactivateModal(true);
  };

  const handleStatusToggleConfirm = async () => {
    if (!rewardToDeactivate) return;
    
    const isActivating = !rewardToDeactivate.isActive;
    setDeactivating(true);
    try {
      await updateRewardStatus(rewardToDeactivate.id, isActivating);
      setToast({
        message: isActivating 
          ? `"${rewardToDeactivate.rewardName}" has been activated`
          : `"${rewardToDeactivate.rewardName}" has been deactivated`,
        type: 'success',
      });
      setShowDeactivateModal(false);
      setRewardToDeactivate(null);
      loadRewards();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : `Failed to ${isActivating ? 'activate' : 'deactivate'} reward`,
        type: 'error',
      });
    } finally {
      setDeactivating(false);
    }
  };

  // Landing View - Action Cards
  if (currentView === 'landing') {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reward Hub</h1>
          <p className="text-gray-600 mt-1">Manage rewards and incentives for users</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Configure New Reward Card */}
          <div
            onClick={handleCreateReward}
            className="group bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 hover:border-secondary hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex flex-col h-full">
              <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
                <Plus size={32} className="text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-secondary transition-colors">
                Configure New Reward
              </h2>
              <p className="text-gray-600 flex-grow">
                Create and customize new reward programs for runners, creators, or all users. Set reward amounts, types, and eligibility criteria.
              </p>
              <div className="mt-6 flex items-center text-secondary font-medium">
                Get Started
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {/* View Rewards Card */}
          <div
            onClick={() => setCurrentView('list')}
            className="group bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 hover:border-success hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex flex-col h-full">
              <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mb-6 group-hover:bg-success/20 transition-colors">
                <Eye size={32} className="text-success" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-success transition-colors">
                View Rewards
              </h2>
              <p className="text-gray-600 flex-grow">
                Browse all active reward programs in the system. View details, track performance, and manage existing rewards.
              </p>
              <div className="mt-6 flex items-center text-success font-medium">
                View All Rewards
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </DashboardLayout>
    );
  }

  // List View - Rewards
  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('landing')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
            <p className="text-gray-600 mt-1">
              {totalItems} reward{totalItems !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        
        <Button
          variant="primary"
          onClick={handleCreateReward}
        >
          <span className="flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Configure New Reward
          </span>
        </Button>
      </div>

      <RewardsList
        rewards={rewards}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        selectedType={selectedType}
        selectedClass={selectedClass}
        selectedActive={selectedActive}
        searchQuery={searchQuery}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onTypeChange={handleTypeChange}
        onClassChange={handleClassChange}
        onActiveChange={handleActiveChange}
        onSearchChange={handleSearchChange}
        onDeactivateClick={handleStatusToggleClick}
      />

      {/* Status Toggle Modal */}
      {showDeactivateModal && rewardToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deactivating && setShowDeactivateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            {(() => {
              const isActivating = !rewardToDeactivate.isActive;
              return (
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isActivating ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isActivating ? (
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {isActivating ? 'Activate Reward' : 'Deactivate Reward'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isActivating ? (
                      <>Are you sure you want to activate <strong>"{rewardToDeactivate.rewardName}"</strong>? Users will be able to earn this reward.</>
                    ) : (
                      <>Are you sure you want to deactivate <strong>"{rewardToDeactivate.rewardName}"</strong>? This will stop users from being able to earn this reward.</>
                    )}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeactivateModal(false)}
                      disabled={deactivating}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusToggleConfirm}
                      disabled={deactivating}
                      className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${isActivating ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {deactivating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          {isActivating ? 'Activating...' : 'Deactivating...'}
                        </>
                      ) : (
                        isActivating ? 'Activate' : 'Deactivate'
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};