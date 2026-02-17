import React, { useState, useEffect } from 'react';
import { DashboardLayout, Button, Toast } from '../components';
import { RewardsList } from '../components/RewardsList';
import { ConfigureRewardModal } from '../components/ConfigureRewardModal';
import { Plus, Eye, ArrowLeft } from 'lucide-react';
import { fetchRewards } from '../services/rewards';
import type { Reward, RewardType } from '../types/reward';

// View states
type ViewState = 'landing' | 'list';

export const RewardHub: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedType, setSelectedType] = useState<RewardType | 'ALL'>('ALL');
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const loadRewards = async () => {
    if (currentView !== 'list') return;
    
    setLoading(true);
    try {
      const response = await fetchRewards({
        offset: currentPage,
        limit: pageSize,
        filters: selectedType !== 'ALL' ? { rewardType: selectedType } : undefined,
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
  }, [currentPage, pageSize, currentView, selectedType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: RewardType | 'ALL') => {
    setSelectedType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleRewardClick = (reward: Reward) => {
    // TODO: Show reward details modal
    console.log('Reward clicked:', reward);
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
            onClick={() => setShowConfigureModal(true)}
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

        {/* Configure Modal */}
        {showConfigureModal && (
          <ConfigureRewardModal
            isOpen={showConfigureModal}
            onClose={() => setShowConfigureModal(false)}
          />
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
            <h1 className="text-3xl font-bold text-gray-900">Active Rewards</h1>
            <p className="text-gray-600 mt-1">
              {totalItems} reward{totalItems !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowConfigureModal(true)}
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
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onTypeChange={handleTypeChange}
        onRewardClick={handleRewardClick}
      />

      {/* Configure Modal */}
      {showConfigureModal && (
        <ConfigureRewardModal
          isOpen={showConfigureModal}
          onClose={() => setShowConfigureModal(false)}
        />
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
