import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, UserPlus, Check, XCircle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Toast } from './Toast';
import { createUser, checkEmailAvailability, checkUsernameAvailability, checkPhoneAvailability } from '../services/users';
import type { CreateUserRequest, UserRole } from '../types/user';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  role?: string;
}

interface FieldAvailability {
  username: boolean | null;
  email: boolean | null;
  phoneNumber: boolean | null;
}

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'admin',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [availability, setAvailability] = useState<FieldAvailability>({
    username: null,
    email: null,
    phoneNumber: null,
  });
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  
  // Refs to store timeout IDs for debounce cleanup
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({
    username: null,
    email: null,
    phoneNumber: null,
  });

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = useCallback(async (field: keyof FieldAvailability, value: string) => {
    // Skip if value is empty or doesn't meet minimum requirements
    if (!value) {
      setAvailability(prev => ({ ...prev, [field]: null }));
      return;
    }
    
    // For username, require at least 3 characters
    if (field === 'username' && value.length < 3) {
      setAvailability(prev => ({ ...prev, [field]: null }));
      return;
    }
    
    // For email, require valid format
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setAvailability(prev => ({ ...prev, [field]: null }));
      return;
    }
    
    setChecking(prev => ({ ...prev, [field]: true }));
    
    try {
      let isAvailable = false;
      
      switch (field) {
        case 'username':
          isAvailable = await checkUsernameAvailability(value);
          break;
        case 'email':
          isAvailable = await checkEmailAvailability(value);
          break;
        case 'phoneNumber':
          isAvailable = await checkPhoneAvailability(value);
          break;
      }
      
      setAvailability(prev => ({ ...prev, [field]: isAvailable }));
    } catch {
      setAvailability(prev => ({ ...prev, [field]: null }));
    } finally {
      setChecking(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  const debouncedCheckAvailability = useCallback((field: keyof FieldAvailability, value: string) => {
    // Clear existing timeout for this field
    if (timeoutsRef.current[field]) {
      clearTimeout(timeoutsRef.current[field]!);
    }
    
    // Set new timeout
    timeoutsRef.current[field] = setTimeout(() => {
      checkAvailability(field, value);
    }, DEBOUNCE_DELAY);
  }, [checkAvailability]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if fields are available
    if (availability.username === false || availability.email === false || availability.phoneNumber === false) {
      setToast({ message: 'Please fix the availability issues before submitting', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      await createUser(formData);
      onSuccess();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to create user',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // For availability-checkable fields, trigger debounced check
    if (field === 'username' || field === 'email' || field === 'phoneNumber') {
      // Reset availability status while typing
      setAvailability(prev => ({ ...prev, [field]: null }));
      // Trigger debounced check
      debouncedCheckAvailability(field, value);
    }
    
    // Clear error when field changes
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getAvailabilityStatus = (field: keyof FieldAvailability) => {
    const status = availability[field];
    const value = formData[field];
    
    // Don't show anything if field is empty or doesn't meet minimum requirements
    if (!value) return null;
    if (field === 'username' && value.length < 3) return null;
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
    
    if (checking[field]) {
      return (
        <span className="flex items-center gap-1 text-gray-400 text-sm">
          <Loader2 size={14} className="animate-spin" />
          Checking availability...
        </span>
      );
    }
    
    if (status === true) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-sm">
          <Check size={14} />
          Available
        </span>
      );
    }
    
    if (status === false) {
      return (
        <span className="flex items-center gap-1 text-red-600 text-sm">
          <XCircle size={14} />
          Already taken
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <UserPlus size={20} className="text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                <p className="text-sm text-gray-500">Add a new admin user to the platform</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Username */}
            <div>
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={errors.username}
                placeholder="johndoe"
              />
              <div className="mt-1 h-5">
                {getAvailabilityStatus('username')}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={errors.firstName}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={errors.lastName}
                placeholder="Doe"
              />
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                placeholder="john.doe@errandgo.com"
              />
              <div className="mt-1 h-5">
                {getAvailabilityStatus('email')}
              </div>
            </div>

            {/* Phone */}
            <div>
              <Input
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                error={errors.phoneNumber}
                placeholder="+2348123456789"
              />
              <div className="mt-1 h-5">
                {getAvailabilityStatus('phoneNumber')}
              </div>
            </div>

            {/* Password */}
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              placeholder="Enter a secure password"
            />

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value as UserRole)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Toast */}
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
