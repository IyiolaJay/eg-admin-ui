import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, MetricCard, DisputesTable, type Dispute } from '../components';
import { fetchDisputes } from '../services/disputes';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';

export interface DisputeStats {
  total: number;
  createdToday: number;
  resolved: number;
  open: number;
}

export const Disputes: React.FC = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state using offset/limit
  const [offset, setOffset] = useState(1);
  const [limit, setLimit] = useState(10);

  // Calculate stats from disputes
  const stats: DisputeStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const total = disputes.length;
    const createdToday = disputes.filter(d => {
      const createdDate = new Date(d.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    }).length;
    const resolved = disputes.filter(d => d.status === 'RESOLVED').length;
    const open = disputes.filter(d => 
      d.status === 'OPEN' || d.status === 'IN_REVIEW' || d.status === 'PENDING_INFORMATION'
    ).length;
    
    return { total, createdToday, resolved, open };
  }, [disputes]);

  const loadDisputes = async (currentOffset: number = 1, currentLimit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchDisputes({ offset: currentOffset, limit: currentLimit });
      setDisputes(response.disputes);
      setOffset(response.pagination.offset);
      setLimit(response.pagination.limit);
    } catch (err) {
      setError('Failed to load disputes');
      console.error('Error loading disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadDisputes(offset, limit);
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
            <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
            <p className="text-gray-600 mt-1">Manage and resolve customer disputes</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring text-sm font-medium"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Disputes"
          value={stats.total}
          icon={<AlertTriangle size={20} />}
          variant="warning"
          loading={loading}
        />

        <MetricCard
          title="Created Today"
          value={stats.createdToday}
          icon={<Calendar size={20} />}
          variant="success"
          loading={loading}
        />

        <MetricCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle size={20} />}
          variant="success"
          loading={loading}
        />

        <MetricCard
          title="Open"
          value={stats.open}
          icon={<Clock size={20} />}
          variant="danger"
          loading={loading}
        />
      </div>

      {/* Disputes Table */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Disputes</h2>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all customer disputes
          </p>
        </div>
        
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-danger mb-4">
              <AlertTriangle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Disputes</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadDisputes(offset, limit)}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <DisputesTable
            disputes={disputes}
            loading={loading}
            onDisputeClick={handleDisputeClick}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
