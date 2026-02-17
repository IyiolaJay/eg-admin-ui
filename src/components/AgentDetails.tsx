import React from 'react';
import { X, Phone, Mail, MapPin, Calendar, Clock, Shield, CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { Button } from './Button';
import type { Agent } from '../types/agent';

interface AgentDetailsProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentDetails: React.FC<AgentDetailsProps> = ({
  agent,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

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

  const getInitials = () => {
    if (agent.firstName && agent.lastName) {
      return `${agent.firstName[0]}${agent.lastName[0]}`;
    }
    return agent.phoneNumber.slice(-2);
  };

  const getDisplayName = () => {
    if (agent.firstName && agent.lastName) {
      return `${agent.firstName} ${agent.lastName}`;
    }
    return 'Unnamed Agent';
  };

  const getAuthMethodLabel = (authMethod: string) => {
    const labels: Record<string, string> = {
      PHONE: 'Phone Authentication',
      EMAIL: 'Email Authentication',
      GOOGLE: 'Google Sign-In',
      APPLE: 'Apple Sign-In',
    };
    return labels[authMethod] || authMethod;
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(agent.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h2 className="text-xl font-bold text-gray-900">Agent Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Agent Header */}
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                {agent.profileImageUrl ? (
                  <img
                    src={agent.profileImageUrl}
                    alt={getDisplayName()}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-secondary">
                    {getInitials()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {getDisplayName()}
                </h3>
                <p className="text-gray-500 font-mono text-sm">ID: {agent.id}</p>
                <div className="flex items-center gap-2 mt-2">
                  {agent.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                      <Shield size={12} />
                      Unverified
                    </span>
                  )}
                  
                  {agent.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                      <CheckCircle size={12} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      <XCircle size={12} />
                      Inactive
                    </span>
                  )}
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
                    <Phone size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900">{agent.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Mail size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {agent.email || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <MapPin size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-sm font-medium text-gray-900">
                      {agent.country || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Shield size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Auth Method</p>
                    <p className="text-sm font-medium text-gray-900">{getAuthMethodLabel(agent.authMethod)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-secondary/5 rounded-xl p-6 border border-secondary/10">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Referral Code
              </h4>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-lg tracking-wider text-secondary border border-secondary/20">
                  {agent.referralCode}
                </code>
                <Button
                  variant="outline"
                  onClick={copyReferralCode}
                  className="flex flex-row items-center gap-2"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </Button>
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
                    <Calendar size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(agent.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Clock size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {agent.lastLogin ? formatDate(agent.lastLogin) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                className="flex-1"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
