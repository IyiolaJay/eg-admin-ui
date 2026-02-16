import { describe, it, expect } from 'vitest';
import { fetchDashboardMetrics } from '../services/mock/dashboardMock';

describe('Dashboard Mock Service', () => {
  it('should return dashboard metrics with all required fields', async () => {
    const metrics = await fetchDashboardMetrics();

    expect(metrics).toHaveProperty('disputes');
    expect(metrics).toHaveProperty('failedOperations');
    expect(metrics).toHaveProperty('errandsCreatedToday');
    expect(metrics).toHaveProperty('errandsInProgress');
    expect(metrics).toHaveProperty('errandsCancelled');
    expect(metrics).toHaveProperty('signupsToday');
  });

  it('should return valid metric data structure', async () => {
    const metrics = await fetchDashboardMetrics();

    expect(metrics.disputes).toHaveProperty('total');
    expect(metrics.disputes).toHaveProperty('change');
    expect(metrics.disputes.change).toHaveProperty('value');
    expect(metrics.disputes.change).toHaveProperty('direction');
  });

  it('should return numeric totals within expected ranges', async () => {
    const metrics = await fetchDashboardMetrics();

    expect(metrics.disputes.total).toBeGreaterThanOrEqual(50);
    expect(metrics.disputes.total).toBeLessThanOrEqual(200);

    expect(metrics.failedOperations.total).toBeGreaterThanOrEqual(10);
    expect(metrics.failedOperations.total).toBeLessThanOrEqual(80);

    expect(metrics.errandsCreatedToday.total).toBeGreaterThanOrEqual(100);
    expect(metrics.errandsCreatedToday.total).toBeLessThanOrEqual(500);
  });

  it('should return valid change directions', async () => {
    const metrics = await fetchDashboardMetrics();

    const validDirections = ['up', 'down', 'neutral'];
    
    expect(validDirections).toContain(metrics.disputes.change.direction);
    expect(validDirections).toContain(metrics.failedOperations.change.direction);
    expect(validDirections).toContain(metrics.errandsInProgress.change.direction);
  });

  it('should simulate network delay', async () => {
    const startTime = Date.now();
    await fetchDashboardMetrics();
    const endTime = Date.now();

    const duration = endTime - startTime;
    expect(duration).toBeGreaterThanOrEqual(450); // Allow some margin
  });
});
