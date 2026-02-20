import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout, Button, Toast } from '../components';
import { fetchRewardById, deactivateReward } from '../services/rewards';
import type { Reward } from '../types/reward';
import {
  ArrowLeft,
  Gift,
  User,
  Users,
  Briefcase,
  Tag,
  Settings,
  Power,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export const RewardDetail: React.FC = () => {
  const { rewardId } = useParams<{ rewardId: string }>();
  const navigate = useNavigate();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (rewardId) {
      loadReward();
    }
  }, [rewardId]);

  const loadReward = async () => {
    try {
      setLoading(true);
      setError(null);
      const rewardData = await fetchRewardById(rewardId!);
      setReward(rewardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reward');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!reward) return;

    setDeactivating(true);
    try {
      await deactivateReward(reward.id);
      setToast({
        message: 'Reward deactivated successfully',
        type: 'success',
      });
      setShowDeactivateModal(false);
      // Refresh reward data
      await loadReward();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to deactivate reward',
        type: 'error',
      });
    } finally {
      setDeactivating(false);
    }
  };

  const handleConfigureConditions = () => {
    navigate(`/admin/reward-hub/rewards/${rewardId}/conditions`);
  };

  const getRewardTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BONUS: 'bg-blue-100 text-blue-700 border-blue-200',
      REFERRAL: 'bg-purple-100 text-purple-700 border-purple-200',
      DISCOUNT: 'bg-green-100 text-green-700 border-green-200',
      CASHBACK: 'bg-orange-100 text-orange-700 border-orange-200',
      LOYALTY: 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRewardTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      BONUS: <Gift size={24} />,
      REFERRAL: <Users size={24} />,
      DISCOUNT: <Tag size={24} />,
      CASHBACK: <Gift size={24} />,
      LOYALTY: <Gift size={24} />,
    };
    return icons[type] || <Gift size={24} />;
  };

  const getRewardClassLabel = (rewardClass: string) => {
    const labels: Record<string, string> = {
      RUNNER: 'For Runners',
      CREATOR: 'For Creators',
      ALL: 'For Everyone',
    };
    return labels[rewardClass] || rewardClass;
  };

  const getRewardClassIcon = (rewardClass: string) => {
    const icons: Record<string, React.ReactNode> = {
      RUNNER: <Briefcase size={18} />,
      CREATOR: <User size={18} />,
      ALL: <Users size={18} />,
    };
    return icons[rewardClass] || <Users size={18} />;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatConditionLogic = (condition: any): string => {
    const logic = condition.logic;
    if (!logic) return 'Unknown condition';

    const parts: string[] = [];

    // Handle simple logic (field, operator, value)
    if (logic.field && logic.operator) {
      const fieldName = logic.field.split('.')[1] || logic.field;
      const operator = getOperatorLabel(logic.operator);
      const value = logic.value;
      return `${fieldName} ${operator} ${value}`;
    }

    // Handle 'and' array
    if (logic.and && Array.isArray(logic.and)) {
      for (const rule of logic.and) {
        const fieldName = rule.field.split('.')[1] || rule.field;
        const operator = getOperatorLabel(rule.operator);
        parts.push(`${fieldName} ${operator} ${rule.value}`);
      }
      return parts.join(' AND ');
    }

    // Handle 'or' array
    if (logic.or && Array.isArray(logic.or)) {
      for (const rule of logic.or) {
        const fieldName = rule.field.split('.')[1] || rule.field;
        const operator = getOperatorLabel(rule.operator);
        parts.push(`${fieldName} ${operator} ${rule.value}`);
      }
      return parts.join(' OR ');
    }

    return 'Unknown condition';
  };

  const getOperatorLabel = (operator: string): string => {
    const operators: Record<string, string> = {
      '==': '=',
      '!=': '≠',
      '>': '>',
      '<': '<',
      '>=': '≥',
      '<=': '≤',
    };
    return operators[operator] || operator;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !reward) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reward</h2>
          <p className="text-gray-600 mb-4">{error || 'Reward not found'}</p>
          <button
            onClick={() => navigate('/admin/reward-hub')}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Back to Reward Hub
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/reward-hub')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Reward Hub</span>
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${getRewardTypeColor(reward.rewardType)}`}>
              {getRewardTypeIcon(reward.rewardType)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">{reward.rewardName}</h1>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRewardTypeColor(reward.rewardType)}`}>
                  {reward.rewardType}
                </span>
                {reward.isActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                    <CheckCircle size={14} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    <Power size={14} />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-600">ID: {reward.id}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {reward.isActive && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleConfigureConditions}
                  className="flex items-center gap-2"
                >
                  <Settings size={18} />
                  {reward.conditions ? 'Edit Conditions' : 'Configure Conditions'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeactivateModal(true)}
                  className="flex items-center gap-2"
                >
                  <Power size={18} />
                  Deactivate
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reward Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reward Details</h2>
            
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Description</label>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-4">
                  {reward.rewardDescription}
                </p>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 mb-1 block">Reward Amount</label>
                  <p className="text-2xl font-bold text-gray-900">{formatAmount(reward.rewardAmount)}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 mb-1 block">Target Audience</label>
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    {getRewardClassIcon(reward.rewardClass)}
                    {getRewardClassLabel(reward.rewardClass)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Conditions</h2>
              {reward.isActive && (
                <Button
                  variant="secondary"
                  onClick={handleConfigureConditions}
                  className="text-sm py-2 px-4"
                >
                  {reward.conditions ? 'Edit Conditions' : 'Add Conditions'}
                </Button>
              )}
            </div>
            
            {reward.conditions && reward.conditions.length > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Configured Conditions:</p>
                <div className="space-y-2">
                  {reward.conditions.map((cond) => (
                    <div key={cond.id} className="text-sm text-blue-900 bg-white rounded-lg p-3 border border-blue-100 font-mono">
                      {formatConditionLogic(cond)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">No Conditions Set</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This reward has no conditions configured. Users will be eligible for this reward without any criteria.
                    </p>
                    {reward.isActive && (
                      <button
                        onClick={handleConfigureConditions}
                        className="mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                      >
                        Configure conditions now →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status</span>
                {reward.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle size={12} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <Power size={12} />
                    Inactive
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm text-gray-900">{formatDate(reward.createdAt)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">{formatDate(reward.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {reward.isActive && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleConfigureConditions}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-secondary hover:bg-secondary/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Settings size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {reward.conditions ? 'Edit Conditions' : 'Configure Conditions'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reward.conditions ? 'Modify existing conditions' : 'Set eligibility criteria'}
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Power size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">Deactivate Reward</p>
                    <p className="text-sm text-gray-500">Stop this reward from being active</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeactivateModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deactivate Reward</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to deactivate <strong>"{reward.rewardName}"</strong>? 
                This will stop users from being able to earn this reward.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeactivateModal(false)}
                  disabled={deactivating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeactivate}
                  loading={deactivating}
                  disabled={deactivating}
                  className="flex-1"
                >
                  {deactivating ? 'Deactivating...' : 'Deactivate'}
                </Button>
              </div>
            </div>
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
