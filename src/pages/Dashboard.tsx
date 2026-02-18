import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, MetricCard, DisputesTable, type Dispute } from '../components';
import { fetchDashboardMetrics, type DashboardMetrics } from '../services/analytics';
import { fetchDisputes } from '../services/disputes';
import {
  AlertTriangle,
  PlusCircle,
  Clock,
  Ban,
  UserPlus,
  CalendarClock,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputesLoading, setDisputesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputesError, setDisputesError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const userRole = sessionStorage.getItem('userRole') || 'admin';
  const userName = userRole === 'super_admin' ? 'Super Admin' : 'Admin';

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardMetrics(2); // Get 2 days of data for comparison
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard metrics');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDisputes = async () => {
    try {
      setDisputesLoading(true);
      setDisputesError(null);
      // Fetch disputes assigned to current user - filter by assignedTo if needed
      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;
      const response = await fetchDisputes({ 
        limit: 5,
        assignedTo: userRole === 'super_admin' ? undefined : userId 
      });
      setDisputes(response.disputes);
    } catch (err) {
      setDisputesError('Failed to load disputes');
      console.error('Error loading disputes:', err);
    } finally {
      setDisputesLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    loadDisputes();
  }, []);

  const formatLastUpdated = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const handleRefresh = () => {
    loadMetrics();
    loadDisputes();
  };

  const handleDisputeClick = (dispute: Dispute) => {
    navigate(`/admin/disputes/${dispute.id}`);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {userName}</h1>
            <p className="text-gray-600 mt-1">Monitor platform activities and key metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Last updated: {formatLastUpdated()}</span>
            <button
              onClick={handleRefresh}
              disabled={loading || disputesLoading}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring text-sm font-medium"
            >
              {loading || disputesLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* High Priority Metrics */}
        <MetricCard
          title="Total Disputes"
          value={metrics?.disputes.total ?? 0}
          change={metrics?.disputes.change}
          icon={<AlertTriangle size={20} />}
          variant="warning"
          loading={loading}
          error={error || undefined}
          onClick={() => console.log('Navigate to disputes')}
        />

        <MetricCard
          title="Expired Errands"
          value={metrics?.expiredErrands?.total ?? 0}
          change={metrics?.expiredErrands?.change}
          icon={<CalendarClock size={20} />}
          variant="danger"
          loading={loading}
          error={error || undefined}
          onClick={() => console.log('Navigate to expired errands')}
        />

        {/* Errand Analytics */}
        <MetricCard
          title="Created Today"
          value={metrics?.errandsCreatedToday.total ?? 0}
          change={metrics?.errandsCreatedToday.change}
          icon={<PlusCircle size={20} />}
          variant="success"
          loading={loading}
          error={error || undefined}
        />

        <MetricCard
          title="In Progress"
          value={metrics?.errandsInProgress.total ?? 0}
          change={metrics?.errandsInProgress.change}
          icon={<Clock size={20} />}
          variant="default"
          loading={loading}
          error={error || undefined}
        />

        <MetricCard
          title="Cancelled Today"
          value={metrics?.errandsCancelled.total ?? 0}
          change={metrics?.errandsCancelled.change}
          icon={<Ban size={20} />}
          variant="danger"
          loading={loading}
          error={error || undefined}
        />

        {/* User Metrics */}
        <MetricCard
          title="New Sign-ups"
          value={metrics?.signupsToday.total ?? 0}
          change={metrics?.signupsToday.change}
          icon={<UserPlus size={20} />}
          variant="success"
          loading={loading}
          error={error || undefined}
        />
      </div>

      {/* Disputes Assigned to Me */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Workbench</h2>
          <p className="text-sm text-gray-600 mt-1">
            Disputes currently assigned to you for resolution
          </p>
        </div>
        {disputesError ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-danger mb-4">
              <AlertTriangle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Disputes</h3>
            <p className="text-gray-600 mb-4">{disputesError}</p>
            <button
              onClick={loadDisputes}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <DisputesTable
            disputes={disputes}
            loading={disputesLoading}
            onDisputeClick={handleDisputeClick}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
