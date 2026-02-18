import React from 'react';
import { X, UserX, UserCheck, Edit, Mail, Phone, User, Shield, Calendar, Clock } from 'lucide-react';
import { Button } from './Button';
import type { User as UserType } from '../types/user';

interface UserDetailsProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  isSuperAdmin: boolean;
  onDeactivate?: (userId: string) => void;
  onActivate?: (userId: string) => void;
  onUpdate?: (user: UserType) => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  isOpen,
  onClose,
  isSuperAdmin,
  onDeactivate,
  onActivate,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role: UserType['role']) => {
    return role === 'super_admin' ? 'Super Administrator' : 'Administrator';
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
            <h2 className="text-xl font-bold text-gray-900">Admin Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Header */}
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-secondary">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-500">@{user.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    user.role === 'super_admin' 
                      ? 'bg-purple-100 text-purple-700 border-purple-200' 
                      : 'bg-secondary/10 text-secondary border-secondary/20'
                  }`}>
                    {getRoleLabel(user.role)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    user.isActive 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Mail size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Phone size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{user.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Account Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <User size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm font-medium text-gray-900">{user.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Shield size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Calendar size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Clock size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isSuperAdmin && (
              <div className="flex flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="flex flex-row items-center gap-2"
                  onClick={() => {/* Edit logic */}}
                >
                  <Edit size={18} />
                  <span>Edit Admin</span>
                </Button>
                
                {user.isActive ? (
                  <Button
                    variant="danger"
                    className="flex flex-row items-center gap-2"
                    onClick={() => onDeactivate?.(user.id)}
                  >
                    <UserX size={18} />
                    <span>Deactivate Admin</span>
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    className="flex flex-row items-center gap-2"
                    onClick={() => onActivate?.(user.id)}
                  >
                    <UserCheck size={18} />
                    <span>Activate Admin</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
