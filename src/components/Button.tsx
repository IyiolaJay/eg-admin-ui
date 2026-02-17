import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'outline' | 'danger' | 'success';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = [
    'relative',
    'px-6',
    'py-2.5',
    'text-base',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:cursor-not-allowed',
    'disabled:opacity-60',
    fullWidth ? 'w-full' : '',
  ].filter(Boolean);

  const variantClasses: Record<string, string[]> = {
    primary: [
      'bg-secondary',
      'text-white',
      'hover:bg-secondary/90',
      'active:bg-secondary/80',
      'focus:ring-secondary',
    ],
    secondary: [
      'bg-tertiary',
      'text-gray-900',
      'border',
      'border-gray-300',
      'hover:bg-tertiary/80',
      'active:bg-tertiary/70',
      'focus:ring-secondary',
    ],
    text: [
      'text-secondary',
      'hover:bg-secondary/10',
      'active:bg-secondary/20',
      'focus:ring-secondary',
    ],
    outline: [
      'bg-white',
      'text-gray-700',
      'border',
      'border-gray-300',
      'hover:bg-gray-50',
      'active:bg-gray-100',
      'focus:ring-secondary',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'active:bg-red-800',
      'focus:ring-red-500',
    ],
    success: [
      'bg-green-600',
      'text-white',
      'hover:bg-green-700',
      'active:bg-green-800',
      'focus:ring-green-500',
    ],
  };

  const allClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={allClasses}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>
        {children}
      </span>
    </button>
  );
};
