import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { login } from '../services/auth';
import { validateRequired } from '../utils/validation';
import errandgoLogo from '../assets/errandgo-logo.svg';
import mockup from '../assets/mockup1.svg';

interface FormErrors {
  username?: string;
  password?: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!validateRequired(username)) {
      newErrors.username = 'Username is required';
    }

    if (!validateRequired(password)) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await login({ username, password });

      if (response.ok) {
        setToast({ message: 'Login successful!', type: 'success' });

        // Navigate to dashboard after brief delay
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        const errorMessages: Record<string, string> = {
          invalid_credentials: 'Invalid username or password. Please try again.',
          account_locked: 'Your account has been locked. Please contact support.',
          server_error: 'Server error. Please try again later.',
          network_error: 'Network error. Please check your connection.',
        };

        setToast({
          message: errorMessages[response.error!] || response.message || 'An error occurred. Please try again.',
          type: 'error',
        });
      }
    } catch {
      setToast({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = validateRequired(username) && validateRequired(password);

  return (
    <div className="min-h-screen flex">
      {/* Brand Panel - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary to-secondary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-tertiary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary rounded-full blur-3xl" />
        </div>

        {/* Mockup Image - Blended with background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 mix-blend-overlay">
          <img src={mockup} alt="" className="h-3/4 object-contain" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <img src={errandgoLogo} alt="ErrandGo" className="h-12" />
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Management Portal
            <br />
          </h1>
          <p className="text-lg text-white/90 max-w-md">
             Admin portal for errand management.
          </p>
          <div className="space-y-4 pt-4">
            <Feature text="Comprehensive analytics dashboard" />
            <Feature text="In-House errand runner management" />
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/70 text-sm">
            &copy; 2026 ErrandGo. All rights reserved.
          </p>
        </div>
      </div>

      {/* Login Form - Right Side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Login
              </h2>
              <p className="text-gray-600">
                Enter your credentials to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5">
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={errors.username}
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                  placeholder="Enter your username"
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={loading}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 w-4 h-4 text-secondary border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                    />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a
                    href="#forgot-password"
                    className="text-secondary hover:text-secondary/80 font-medium focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded px-1"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={!isFormValid || loading}
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-2">Test Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Username: superadmin</p>
                <p>Password: SuperAdmin@2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const Feature: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 bg-tertiary rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="text-white/90">{text}</span>
  </div>
);
