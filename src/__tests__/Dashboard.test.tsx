import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import * as dashboardMock from '../services/mock/dashboardMock';

// Mock the dashboard service
vi.mock('../services/mock/dashboardMock', () => ({
  fetchDashboardMetrics: vi.fn(),
}));

const mockMetrics = {
  disputes: {
    total: 100,
    change: { value: 10, direction: 'up' as const },
  },
  failedOperations: {
    total: 50,
    change: { value: -5, direction: 'down' as const },
  },
  errandsCreatedToday: {
    total: 200,
    change: { value: 15, direction: 'up' as const },
  },
  errandsInProgress: {
    total: 150,
    change: { value: 0, direction: 'neutral' as const },
  },
  errandsCancelled: {
    total: 25,
    change: { value: -3, direction: 'down' as const },
  },
  signupsToday: {
    total: 75,
    change: { value: 20, direction: 'up' as const },
  },
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with loading state initially', () => {
    vi.mocked(dashboardMock.fetchDashboardMetrics).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Welcome, (Admin|Super Admin)/i })).toBeInTheDocument();
    expect(screen.getByText('Monitor platform activities and key metrics')).toBeInTheDocument();
  });

  it('should render metrics after loading', async () => {
    vi.mocked(dashboardMock.fetchDashboardMetrics).mockResolvedValue(mockMetrics);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Disputes')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('should display refresh button', async () => {
    vi.mocked(dashboardMock.fetchDashboardMetrics).mockResolvedValue(mockMetrics);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it('should fetch metrics on mount', async () => {
    vi.mocked(dashboardMock.fetchDashboardMetrics).mockResolvedValue(mockMetrics);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(dashboardMock.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
    });
  });
});
