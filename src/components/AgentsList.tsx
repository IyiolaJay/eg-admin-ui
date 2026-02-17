import React from 'react';
import { Phone, Mail, User, CheckCircle, XCircle, Calendar, MapPin, Shield, ChevronRight } from 'lucide-react';
import { Pagination } from './Pagination';
import type { Agent } from '../types/agent';

interface AgentsListProps {
  agents: Agent[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onAgentClick?: (agent: Agent) => void;
}

export const AgentsList: React.FC<AgentsListProps> = ({
  agents,
  loading = false,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onAgentClick,
}) => {
  const getStatusBadge = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <XCircle size={12} />
          Inactive
        </span>
      );
    }
    
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
          <CheckCircle size={12} />
          Verified
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
        <Shield size={12} />
        Pending
      </span>
    );
  };

  const getAuthMethodBadge = (authMethod: string) => {
    const labels: Record<string, string> = {
      PHONE: 'Phone',
      EMAIL: 'Email',
      GOOGLE: 'Google',
      APPLE: 'Apple',
    };
    return labels[authMethod] || authMethod;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (agent: Agent) => {
    if (agent.firstName && agent.lastName) {
      return `${agent.firstName[0]}${agent.lastName[0]}`;
    }
    return agent.phoneNumber.slice(-2);
  };

  const getDisplayName = (agent: Agent) => {
    if (agent.firstName && agent.lastName) {
      return `${agent.firstName} ${agent.lastName}`;
    }
    return 'Unnamed Agent';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-secondary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          There are no agents registered in the system at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Agents List - Vertical Layout */}
      <div className="space-y-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onAgentClick?.(agent)}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-secondary/30 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                {agent.profileImageUrl ? (
                  <img
                    src={agent.profileImageUrl}
                    alt={getDisplayName(agent)}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-secondary">
                    {getInitials(agent)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Name and Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-secondary transition-colors">
                        {getDisplayName(agent)}
                      </h3>
                      {getStatusBadge(agent.isActive, agent.isVerified)}
                    </div>
                    
                    {/* Contact Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={14} />
                        {agent.phoneNumber}
                      </span>
                      
                      {agent.email && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Mail size={14} />
                            {agent.email}
                          </span>
                        </>
                      )}
                      
                      {agent.country && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} />
                            {agent.country}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {/* Auth Method */}
                      <span className="text-gray-500">
                        Via {getAuthMethodBadge(agent.authMethod)}
                      </span>
                      
                      <span className="text-gray-300">|</span>
                      
                      {/* Referral Code */}
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <span className="font-medium">Ref:</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                          {agent.referralCode}
                        </span>
                      </span>
                      
                      <span className="text-gray-300">|</span>
                      
                      {/* Date */}
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <Calendar size={14} />
                        Joined {formatDate(agent.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-secondary transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};
