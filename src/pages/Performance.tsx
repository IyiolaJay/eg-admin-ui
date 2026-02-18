import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components';
import { fetchWallets, type Wallet } from '../services/wallets';
import { fetchAnalyticsByRange, fetchAnalyticsAggregate, type TrendData, type AggregateData } from '../services/analytics';
import {
  Wallet as WalletIcon,
  Users,
  Package,
  AlertTriangle,
  Ban,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Custom Tooltip Component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: { date: string };
  }>;
  label?: string;
  valueLabel?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, valueLabel }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const date = new Date(data.payload.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{date}</p>
        <p className="text-sm font-semibold text-gray-900">
          {valueLabel}: <span className="text-secondary">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Format date for X-axis
const formatXAxis = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const Performance: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range state - default to 7 days
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    console.log('Performance component mounted');
    loadWallets();
    loadAnalytics();
  }, []);

  const loadWallets = async () => {
    try {
      setWalletsLoading(true);
      console.log('Loading wallets...');
      const data = await fetchWallets();
      console.log('Loaded wallets:', data);
      console.log('Number of wallets loaded:', data.length);
      setWallets(data);
    } catch (err) {
      console.error('Error loading wallets:', err);
    } finally {
      setWalletsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setChartsLoading(true);
      setError(null);

      const [trend, aggregate] = await Promise.all([
        fetchAnalyticsByRange(startDate, endDate),
        fetchAnalyticsAggregate(),
      ]);

      setTrendData(trend.trend);
      setAggregateData(aggregate);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setChartsLoading(false);
    }
  };

  const handleDateRangeChange = () => {
    loadAnalytics();
  };

  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    // Auto-apply after setting quick range
    setTimeout(() => {
      loadAnalytics();
    }, 100);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance & Metrics</h1>
            <p className="text-gray-600 mt-1">Monitor platform performance and commission wallets</p>
          </div>
          <button
            onClick={() => {
              loadWallets();
              loadAnalytics();
            }}
            disabled={walletsLoading || chartsLoading}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={walletsLoading || chartsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Commission Wallets Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-secondary" />
          Commission Wallets
        </h2>

        {walletsLoading ? (
          <div className="flex items-center justify-center h-32 bg-white rounded-xl shadow-sm border border-gray-200">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : wallets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <WalletIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No commission wallets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-80 flex-shrink-0"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <WalletIcon className="w-5 h-5 text-secondary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Wallet Type</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {wallet.metadata?.purpose || 'N/A'}
                      </span>
                    </div>
                    {wallet.accountNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Account</span>
                        <span className="font-medium text-gray-900">{wallet.accountNumber}</span>
                      </div>
                    )}
                    {wallet.bank && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Bank</span>
                        <span className="font-medium text-gray-900">{wallet.bank}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Virtual Bank</span>
                      <span className="font-medium text-gray-900 capitalize">{wallet.virtualBank}</span>
                    </div>
                  </div>

                  {wallet.virtualAccountName && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Virtual Account</p>
                      <p className="text-sm font-medium text-gray-900">{wallet.virtualAccountName}</p>
                      {wallet.virtualAccountNumber && (
                        <p className="text-xs text-gray-500">{wallet.virtualAccountNumber}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Aggregate Summary Cards */}
      {aggregateData && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-500">New Signups</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{aggregateData.totalNewSignup}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-500">Errands Created</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{aggregateData.totalCreatedErrands}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-500">Disputes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{aggregateData.totalDispute}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-500">Cancelled</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{aggregateData.totalCancelledErrands}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-500">Expired</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{aggregateData.totalExpiredErrands}</p>
          </div>
        </div>
      )}

      {/* Date Range Picker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm"
              />
            </div>
            <button
              onClick={handleDateRangeChange}
              disabled={chartsLoading}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              Apply
            </button>
          </div>
          
          {/* Quick Range Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quick:</span>
            {[
              { label: '7D', days: 7 },
              { label: '30D', days: 30 },
              { label: '90D', days: 90 },
            ].map(({ label, days }) => (
              <button
                key={days}
                onClick={() => setQuickDateRange(days)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-secondary hover:text-secondary transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Signups Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Signups Trend
            </h3>
            {chartsLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          </div>
          {chartsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex space-x-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-8 bg-gray-200 rounded" style={{ height: `${Math.random() * 100 + 50}px` }} />
                ))}
              </div>
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip valueLabel="Signups" />} />
                <Area
                  type="monotone"
                  dataKey="totalNewSignup"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fill="url(#colorSignups)"
                  dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">No signup data available for this period</p>
            </div>
          )}
        </div>

        {/* Errands Created Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Errands Created Trend
            </h3>
            {chartsLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          </div>
          {chartsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex space-x-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-8 bg-gray-200 rounded" style={{ height: `${Math.random() * 100 + 50}px` }} />
                ))}
              </div>
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorErrands" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip valueLabel="Errands" />} />
                <Area
                  type="monotone"
                  dataKey="totalCreatedErrands"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#colorErrands)"
                  dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">No errand data available for this period</p>
            </div>
          )}
        </div>

        {/* Disputes Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Disputes Trend
            </h3>
            {chartsLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          </div>
          {chartsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex space-x-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-8 bg-gray-200 rounded" style={{ height: `${Math.random() * 100 + 50}px` }} />
                ))}
              </div>
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip valueLabel="Disputes" />} />
                <Bar
                  dataKey="totalDispute"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <AlertTriangle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">No dispute data available for this period</p>
            </div>
          )}
        </div>

        {/* Cancelled Errands Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Cancelled Errands Trend
            </h3>
            {chartsLoading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          </div>
          {chartsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse flex space-x-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-8 bg-gray-200 rounded" style={{ height: `${Math.random() * 100 + 50}px` }} />
                ))}
              </div>
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickMargin={10}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip content={<CustomTooltip valueLabel="Cancelled" />} />
                <Area
                  type="monotone"
                  dataKey="totalCancelledErrands"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fill="url(#colorCancelled)"
                  dot={{ fill: '#EF4444', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <Ban className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm">No cancellation data available for this period</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
