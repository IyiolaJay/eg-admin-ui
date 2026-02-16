import React from 'react';
import { DashboardLayout } from '../components';
import { AlertTriangle } from 'lucide-react';

export const Disputes: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-600 mt-1">Manage and resolve customer disputes</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-warning" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Disputes Management</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          This feature is coming soon. You'll be able to view, filter, and resolve customer disputes here.
        </p>
      </div>
    </DashboardLayout>
  );
};
