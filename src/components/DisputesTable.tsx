import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Inbox, SearchX } from 'lucide-react';
import { Pagination } from './Pagination';

interface Admin {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface Dispute {
  id: string;
  disputeTitle: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_REVIEW' | 'PENDING_INFORMATION' | 'RESOLVED' | 'ESCALATED';
  module: 'ERRAND' | 'USER' | 'PAYMENT' | 'REWARD' | 'OTHER';
  disputeItemId: string;
  raisedBy: string;
  assignedTo: string | null;
  resolution: string | null;
  metadata?: {
    evidence?: string[];
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  admin?: Admin;
}

interface DisputesTableProps {
  disputes: Dispute[];
  loading?: boolean;
  onDisputeClick?: (dispute: Dispute) => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export const DisputesTable: React.FC<DisputesTableProps> = ({ 
  disputes, 
  loading = false, 
  onDisputeClick,
  hasFilters = false,
  onClearFilters,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate pagination
  const totalItems = disputes.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDisputes = disputes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const getStatusBadge = (status: Dispute['status']) => {
    const statusConfig = {
      OPEN: {
        label: 'Open',
        icon: <AlertTriangle size={14} />,
        classes: 'bg-warning/10 text-warning border-warning/20',
      },
      IN_REVIEW: {
        label: 'In Review',
        icon: <Clock size={14} />,
        classes: 'bg-blue-50 text-blue-600 border-blue-200',
      },
      PENDING_INFORMATION: {
        label: 'Pending Info',
        icon: <Clock size={14} />,
        classes: 'bg-purple-50 text-purple-600 border-purple-200',
      },
      RESOLVED: {
        label: 'Resolved',
        icon: <CheckCircle size={14} />,
        classes: 'bg-success/10 text-success border-success/20',
      },
      ESCALATED: {
        label: 'Escalated',
        icon: <AlertTriangle size={14} />,
        classes: 'bg-danger/10 text-danger border-danger/20',
      },
    };

    const config = statusConfig[status];
    const classes = [
      'inline-flex',
      'items-center',
      'gap-1.5',
      'px-2.5',
      'py-1',
      'rounded-full',
      'text-xs',
      'font-medium',
      'border',
      config.classes,
    ].join(' ');

    return (
      <span className={classes}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Dispute['priority']) => {
    const priorityConfig = {
      LOW: {
        label: 'Low',
        classes: 'bg-gray-100 text-gray-700',
      },
      MEDIUM: {
        label: 'Medium',
        classes: 'bg-blue-50 text-blue-600',
      },
      HIGH: {
        label: 'High',
        classes: 'bg-warning/10 text-warning',
      },
      URGENT: {
        label: 'Urgent',
        classes: 'bg-danger/10 text-danger',
      },
    };

    const config = priorityConfig[priority];
    const classes = [
      'inline-flex',
      'items-center',
      'px-2',
      'py-0.5',
      'rounded',
      'text-xs',
      'font-medium',
      config.classes,
    ].join(' ');

    return <span className={classes}>{config.label}</span>;
  };

  const getModuleBadge = (module: Dispute['module']) => {
    const moduleConfig = {
      ERRAND: { label: 'Errand', classes: 'bg-indigo-50 text-indigo-600' },
      USER: { label: 'User', classes: 'bg-teal-50 text-teal-600' },
      PAYMENT: { label: 'Payment', classes: 'bg-pink-50 text-pink-600' },
      REWARD: { label: 'Reward', classes: 'bg-amber-50 text-amber-600' },
      OTHER: { label: 'Other', classes: 'bg-gray-100 text-gray-600' },
    };

    const config = moduleConfig[module];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            {/* Table header skeleton */}
            <div className="flex gap-4 mb-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
            {/* Table rows skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center py-4 border-t border-gray-100">
                <div className="h-12 bg-gray-100 rounded flex-1"></div>
                <div className="h-12 bg-gray-100 rounded flex-1"></div>
                <div className="h-12 bg-gray-100 rounded flex-1"></div>
                <div className="h-12 bg-gray-100 rounded flex-1"></div>
                <div className="h-12 bg-gray-100 rounded flex-1"></div>
                <div className="h-12 bg-gray-100 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty State - No disputes at all
  if (disputes.length === 0 && !hasFilters) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Inbox size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No disputes yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There are no disputes in the system at the moment. Disputes will appear here when customers raise them.
          </p>
        </div>
      </div>
    );
  }

  // Empty State - No results with filters
  if (disputes.length === 0 && hasFilters) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No disputes found</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            We couldn't find any disputes matching your current filters. Try adjusting your search criteria.
          </p>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Dispute
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Module
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedDisputes.map((dispute) => (
              <tr 
                key={dispute.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer group" 
                onClick={() => onDisputeClick?.(dispute)}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-secondary transition-colors line-clamp-1" title={dispute.disputeTitle}>
                      {dispute.disputeTitle}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      ID: {dispute.id.slice(0, 8)}... • {dispute.disputeItemId.slice(0, 8)}...
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getModuleBadge(dispute.module)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(dispute.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(dispute.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDate(dispute.createdAt)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {dispute.admin ? (
                    <span className="text-sm text-gray-600">{dispute.admin.firstName} {dispute.admin.lastName}</span>
                  ) : dispute.assignedTo ? (
                    <span className="text-sm text-gray-600">{dispute.assignedTo}</span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    className="text-secondary hover:text-secondary/80 font-medium focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded px-2 py-1 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDisputeClick?.(dispute);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
