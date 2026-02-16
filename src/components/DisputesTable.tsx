import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Pagination } from './Pagination';

export interface Dispute {
  id: string;
  errandId: string;
  title: string;
  customer: string;
  runner: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  assignedTo: string;
}

interface DisputesTableProps {
  disputes: Dispute[];
  loading?: boolean;
}

export const DisputesTable: React.FC<DisputesTableProps> = ({ disputes, loading = false }) => {
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
      pending: {
        label: 'Pending',
        icon: <Clock size={14} />,
        classes: 'bg-warning/10 text-warning border-warning/20',
      },
      in_progress: {
        label: 'In Progress',
        icon: <AlertTriangle size={14} />,
        classes: 'bg-blue-50 text-blue-600 border-blue-200',
      },
      resolved: {
        label: 'Resolved',
        icon: <CheckCircle size={14} />,
        classes: 'bg-success/10 text-success border-success/20',
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
      low: {
        label: 'Low',
        classes: 'bg-gray-100 text-gray-700',
      },
      medium: {
        label: 'Medium',
        classes: 'bg-warning/10 text-warning',
      },
      high: {
        label: 'High',
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-900 mb-1">No disputes assigned</p>
          <p className="text-sm">You don't have any disputes assigned to you at the moment.</p>
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
                Dispute ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Runner
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedDisputes.map((dispute) => (
              <tr key={dispute.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">#{dispute.id}</span>
                    <span className="text-xs text-gray-500">Errand: {dispute.errandId}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={dispute.title}>
                    {dispute.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{dispute.customer}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{dispute.runner}</span>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    className="text-secondary hover:text-secondary/80 font-medium focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 rounded px-2 py-1"
                    onClick={() => console.log('View dispute:', dispute.id)}
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
