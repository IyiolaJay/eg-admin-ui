import apiClient, { extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';
import type { MetricChange, ChangeDirection } from '../components/Cards/MetricCard';

export interface TrendData {
  date: string;
  totalDispute: number;
  totalCreatedErrands: number;
  totalCancelledErrands: number;
  totalExpiredErrands: number;
  totalOngoingErrands: number;
  totalNewSignup: number;
}

export interface AnalyticsTrendResponse {
  trend: TrendData[];
  startDate: string;
  endDate: string;
}

export interface AggregateData {
  totalDispute: number;
  totalCreatedErrands: number;
  totalCancelledErrands: number;
  totalExpiredErrands: number;
  totalNewSignup: number;
}

interface AnalyticsApiResponse {
  success: boolean;
  message: string;
  content: AnalyticsTrendResponse | null;
  error: string | null;
}

interface AggregateApiResponse {
  success: boolean;
  message: string;
  content: AggregateData | null;
  error: string | null;
}

interface DateAnalyticsResponse {
  success: boolean;
  message: string;
  content: TrendData | null;
  error: string | null;
}

export interface DashboardMetrics {
  disputes: {
    total: number;
    change: MetricChange;
  };
  expiredErrands: {
    total: number;
    change: MetricChange;
  };
  errandsCreatedToday: {
    total: number;
    change: MetricChange;
  };
  errandsInProgress: {
    total: number;
    change: MetricChange;
  };
  errandsCancelled: {
    total: number;
    change: MetricChange;
  };
  signupsToday: {
    total: number;
    change: MetricChange;
  };
}

/**
 * Calculate percentage change and direction between two values
 */
function calculateChange(current: number, previous: number): MetricChange {
  let value: number;
  let direction: ChangeDirection;

  if (previous === 0) {
    value = current > 0 ? 100 : 0;
    direction = current > 0 ? 'up' : 'neutral';
  } else {
    value = Math.round(((current - previous) / previous) * 100);
    if (value > 0) {
      direction = 'up';
    } else if (value < 0) {
      direction = 'down';
    } else {
      direction = 'neutral';
    }
  }

  // Use absolute value for display
  return {
    value: Math.abs(value),
    direction,
  };
}

/**
 * Fetch analytics trend data
 */
export async function fetchAnalyticsTrend(days: number = 2): Promise<AnalyticsTrendResponse> {
  try {
    const response = await apiClient.get<AnalyticsApiResponse>(
      `${ENDPOINTS.ANALYTICS_TREND}?days=${days}`
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch analytics trend');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch aggregate analytics data
 */
export async function fetchAnalyticsAggregate(): Promise<AggregateData> {
  try {
    const response = await apiClient.get<AggregateApiResponse>(
      ENDPOINTS.ANALYTICS_AGGREGATE
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch aggregate analytics');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch analytics for a specific date
 */
export async function fetchAnalyticsByDate(date: string): Promise<TrendData> {
  try {
    const response = await apiClient.get<DateAnalyticsResponse>(
      ENDPOINTS.ANALYTICS_BY_DATE(date)
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch analytics for date');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch analytics for a date range
 */
export async function fetchAnalyticsByRange(startDate: string, endDate: string): Promise<AnalyticsTrendResponse> {
  try {
    const response = await apiClient.get<AnalyticsApiResponse>(
      `${ENDPOINTS.ANALYTICS_BY_RANGE}?startDate=${startDate}&endDate=${endDate}`
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch analytics for range');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch today's analytics
 */
export async function fetchAnalyticsToday(): Promise<TrendData> {
  try {
    const response = await apiClient.get<DateAnalyticsResponse>(
      ENDPOINTS.ANALYTICS_TODAY
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch today\'s analytics');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch analytics trend data and transform to dashboard metrics
 */
export async function fetchDashboardMetrics(days: number = 2): Promise<DashboardMetrics> {
  try {
    const trendData = await fetchAnalyticsTrend(days);
    const { trend } = trendData;

    // Sort by date to get most recent first
    const sortedTrend = [...trend].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const currentDay = sortedTrend[0] || {
      totalDispute: 0,
      totalCreatedErrands: 0,
      totalCancelledErrands: 0,
      totalExpiredErrands: 0,
      totalOngoingErrands: 0,
      totalNewSignup: 0,
    };

    const previousDay = sortedTrend[1] || {
      totalDispute: 0,
      totalCreatedErrands: 0,
      totalCancelledErrands: 0,
      totalExpiredErrands: 0,
      totalOngoingErrands: 0,
      totalNewSignup: 0,
    };

    return {
      disputes: {
        total: currentDay.totalDispute,
        change: calculateChange(currentDay.totalDispute, previousDay.totalDispute),
      },
      expiredErrands: {
        total: currentDay.totalExpiredErrands,
        change: calculateChange(currentDay.totalExpiredErrands, previousDay.totalExpiredErrands),
      },
      errandsCreatedToday: {
        total: currentDay.totalCreatedErrands,
        change: calculateChange(currentDay.totalCreatedErrands, previousDay.totalCreatedErrands),
      },
      errandsInProgress: {
        total: currentDay.totalOngoingErrands,
        change: calculateChange(currentDay.totalOngoingErrands, previousDay.totalOngoingErrands),
      },
      errandsCancelled: {
        total: currentDay.totalCancelledErrands,
        change: calculateChange(currentDay.totalCancelledErrands, previousDay.totalCancelledErrands),
      },
      signupsToday: {
        total: currentDay.totalNewSignup,
        change: calculateChange(currentDay.totalNewSignup, previousDay.totalNewSignup),
      },
    };
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}
