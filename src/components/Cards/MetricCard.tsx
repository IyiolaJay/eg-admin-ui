import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type MetricVariant = 'default' | 'success' | 'warning' | 'danger';
export type ChangeDirection = 'up' | 'down' | 'neutral';

export interface MetricChange {
  value: number;
  direction: ChangeDirection;
}

export interface MetricCardProps {
  title: string;
  value: number | string;
  change?: MetricChange;
  icon?: React.ReactNode;
  variant?: MetricVariant;
  loading?: boolean;
  error?: string;
  onClick?: () => void;
}

const variantStyles: Record<MetricVariant, { icon: string; accent: string }> = {
  default: {
    icon: 'text-secondary bg-secondary/10',
    accent: 'border-secondary',
  },
  success: {
    icon: 'text-success bg-success/10',
    accent: 'border-success',
  },
  warning: {
    icon: 'text-warning bg-warning/10',
    accent: 'border-warning',
  },
  danger: {
    icon: 'text-danger bg-danger/10',
    accent: 'border-danger',
  },
};

const getChangeColor = (direction: ChangeDirection): string => {
  switch (direction) {
    case 'up':
      return 'text-success bg-success/10';
    case 'down':
      return 'text-danger bg-danger/10';
    case 'neutral':
      return 'text-gray-600 bg-gray-100';
  }
};

const getChangeIcon = (direction: ChangeDirection) => {
  switch (direction) {
    case 'up':
      return <TrendingUp size={14} />;
    case 'down':
      return <TrendingDown size={14} />;
    case 'neutral':
      return <Minus size={14} />;
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'default',
  loading = false,
  error,
  onClick,
}) => {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center text-center">
        <div className="text-danger mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-xs text-gray-600 mb-2">{error}</p>
        <button
          onClick={onClick}
          className="text-xs text-secondary hover:text-secondary/80 font-medium focus-ring rounded px-2 py-1"
        >
          Retry
        </button>
      </div>
    );
  }

  const containerClasses = [
    'bg-white',
    'rounded-lg',
    'shadow-sm',
    'border-2',
    styles.accent,
    'p-4',
    'transition-all',
    'duration-200',
    isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : '',
  ].filter(Boolean).join(' ');

  return (
    <article
      className={containerClasses}
      onClick={onClick}
      role={isClickable ? 'button' : 'region'}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`} aria-hidden="true">
            {icon}
          </div>
        )}
        {change && (
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${getChangeColor(
              change.direction
            )}`}
            aria-live="polite"
            aria-label={`Change: ${change.value > 0 ? '+' : ''}${change.value}%`}
          >
            {getChangeIcon(change.direction)}
            <span>
              {change.value > 0 ? '+' : ''}
              {change.value}%
            </span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs text-gray-600 mb-1 font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </article>
  );
};
