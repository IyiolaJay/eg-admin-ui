import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'error',
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles: Record<string, string[]> = {
    error: ['bg-red-600', 'text-white'],
    success: ['bg-green-600', 'text-white'],
    info: ['bg-blue-600', 'text-white'],
  };

  const toastClasses = [
    'fixed',
    'top-4',
    'right-4',
    'z-50',
    'px-6',
    'py-4',
    'rounded-lg',
    'shadow-lg',
    'flex',
    'items-center',
    'gap-3',
    'animate-slide-in',
    ...typeStyles[type],
  ].join(' ');

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={toastClasses}
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        aria-label="Close notification"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
