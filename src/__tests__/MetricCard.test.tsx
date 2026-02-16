import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetricCard } from '../components/Cards/MetricCard';
import { AlertTriangle } from 'lucide-react';

describe('MetricCard', () => {
  it('should render metric card with all props', () => {
    render(
      <MetricCard
        title="Test Metric"
        value={100}
        change={{ value: 10, direction: 'up' }}
        icon={<AlertTriangle size={24} />}
        variant="success"
      />
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(
      <MetricCard
        title="Test Metric"
        value={100}
        loading={true}
      />
    );

    expect(screen.queryByText('Test Metric')).not.toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
  });

  it('should render error state with retry button', () => {
    const onRetry = vi.fn();
    render(
      <MetricCard
        title="Test Metric"
        value={100}
        error="Failed to load"
        onClick={onRetry}
      />
    );

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should handle click on clickable card', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(
      <MetricCard
        title="Test Metric"
        value={100}
        onClick={onClick}
      />
    );

    const card = screen.getByRole('button');
    await user.click(card);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard interaction on clickable card', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(
      <MetricCard
        title="Test Metric"
        value={100}
        onClick={onClick}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render different variants correctly', () => {
    const { rerender } = render(
      <MetricCard
        title="Test Metric"
        value={100}
        variant="success"
        icon={<AlertTriangle size={24} />}
      />
    );

    let card = screen.getByRole('region');
    expect(card.className).toContain('border-success/20');

    rerender(
      <MetricCard
        title="Test Metric"
        value={100}
        variant="danger"
        icon={<AlertTriangle size={24} />}
      />
    );

    card = screen.getByRole('region');
    expect(card.className).toContain('border-danger/20');
  });

  it('should display change indicators with correct direction', () => {
    const { rerender } = render(
      <MetricCard
        title="Test Metric"
        value={100}
        change={{ value: 10, direction: 'up' }}
      />
    );

    expect(screen.getByText('+10%')).toBeInTheDocument();

    rerender(
      <MetricCard
        title="Test Metric"
        value={100}
        change={{ value: -5, direction: 'down' }}
      />
    );

    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('should format numbers with locale separator', () => {
    render(
      <MetricCard
        title="Test Metric"
        value={1234}
      />
    );

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should render string values as-is', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="1.2K"
      />
    );

    expect(screen.getByText('1.2K')).toBeInTheDocument();
  });
});
