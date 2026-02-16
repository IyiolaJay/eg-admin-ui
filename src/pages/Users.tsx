import React from 'react';
import { DashboardLayout } from '../components';
import { Users as UsersIcon } from 'lucide-react';

export const Users: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-1">Manage platform users and permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UsersIcon size={32} className="text-secondary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          This feature is coming soon. You'll be able to view, manage, and configure user accounts here.
        </p>
      </div>
    </DashboardLayout>
  );
};
