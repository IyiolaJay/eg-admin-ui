import React from 'react';
import { DashboardLayout } from '../components';
import { XCircle } from 'lucide-react';

export const FailedOperations: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Failed Operations</h1>
        <p className="text-gray-600 mt-1">Review and retry failed system operations</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-danger" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed Operations Monitor</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          This feature is coming soon. You'll be able to monitor, debug, and retry failed operations here.
        </p>
      </div>
    </DashboardLayout>
  );
};
