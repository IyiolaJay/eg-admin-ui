import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, Button, Toast } from '../components';
import { createReward } from '../services/rewards';
import type { CreateRewardRequest, RewardType, RewardClass } from '../types/reward';
import { ArrowLeft, Gift, DollarSign, FileText, Users, Tag, CheckCircle } from 'lucide-react';

const REWARD_TYPES: { value: RewardType; label: string }[] = [
  { value: 'CASHBACK', label: 'Cashback' },
  { value: 'BONUS', label: 'Bonus' },
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'REFERRAL', label: 'Referral' },
];

const REWARD_CLASSES: { value: RewardClass; label: string }[] = [
  { value: 'RUNNER', label: 'Runner' },
  { value: 'CREATOR', label: 'Creator' },
  { value: 'ALL', label: 'All Users' },
];

export const CreateReward: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateRewardRequest>({
    rewardName: '',
    rewardAmount: 0,
    rewardDescription: '',
    rewardType: 'BONUS',
    rewardClass: 'RUNNER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const validateForm = (): boolean => {
    if (!formData.rewardName.trim()) {
      setError('Reward name is required');
      return false;
    }
    if (formData.rewardAmount <= 0) {
      setError('Reward amount must be greater than 0');
      return false;
    }
    if (!formData.rewardDescription.trim()) {
      setError('Reward description is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const createdReward = await createReward(formData);
      setToast({
        message: 'Reward created successfully!',
        type: 'success',
      });
      // Navigate to condition builder after successful creation
      setTimeout(() => {
        navigate(`/admin/reward-hub/rewards/${createdReward.id}/conditions`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reward');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateRewardRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Reward</h1>
        <p className="text-gray-600 mt-1">Set up a new reward program for your users</p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-secondary">Reward Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-gray-500">Conditions</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Reward Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Gift size={16} className="text-gray-400" />
                Reward Name *
              </span>
            </label>
            <input
              type="text"
              value={formData.rewardName}
              onChange={(e) => handleChange('rewardName', e.target.value)}
              onBlur={() => handleBlur('rewardName')}
              placeholder="e.g., Weekend Bonus"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary ${
                touched.rewardName && !formData.rewardName.trim() ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {touched.rewardName && !formData.rewardName.trim() && (
              <p className="text-xs text-red-600 mt-1">Reward name is required</p>
            )}
          </div>

          {/* Reward Type and Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  Reward Type *
                </span>
              </label>
              <select
                value={formData.rewardType}
                onChange={(e) => handleChange('rewardType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                disabled={loading}
              >
                {REWARD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  Reward Class *
                </span>
              </label>
              <select
                value={formData.rewardClass}
                onChange={(e) => handleChange('rewardClass', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                disabled={loading}
              >
                {REWARD_CLASSES.map((cls) => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reward Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-400" />
                Reward Amount *
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₦
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.rewardAmount || ''}
                onChange={(e) => handleChange('rewardAmount', parseInt(e.target.value) || 0)}
                onBlur={() => handleBlur('rewardAmount')}
                placeholder="Enter amount"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary ${
                  touched.rewardAmount && formData.rewardAmount <= 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            </div>
            {touched.rewardAmount && formData.rewardAmount <= 0 && (
              <p className="text-xs text-red-600 mt-1">Amount must be greater than 0</p>
            )}
          </div>

          {/* Reward Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                Description *
              </span>
            </label>
            <textarea
              value={formData.rewardDescription}
              onChange={(e) => handleChange('rewardDescription', e.target.value)}
              onBlur={() => handleBlur('rewardDescription')}
              placeholder="Describe the reward criteria and conditions..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary resize-none ${
                touched.rewardDescription && !formData.rewardDescription.trim() ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {touched.rewardDescription && !formData.rewardDescription.trim() && (
              <p className="text-xs text-red-600 mt-1">Description is required</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Next Step: Configure Conditions</p>
                <p className="text-sm text-blue-700 mt-1">
                  After creating this reward, you'll be able to set up conditions that determine when users qualify for this reward.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/reward-hub')}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Reward & Continue'}
            </Button>
          </div>
        </form>
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
};