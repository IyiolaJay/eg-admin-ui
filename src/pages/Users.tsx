import React, { useState, useEffect } from 'react';
import { DashboardLayout, Button, Toast, UsersTable, UserDetails, CreateUserModal } from '../components';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { fetchUsers, deactivateUser, activateUser } from '../services/users';
import { isSuperAdmin } from '../services/auth';
import type { User, SortOption, UserFilters } from '../types/user';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const sortBy: SortOption = { field: 'createdAt', order: 'Desc' };
  const filters: UserFilters = {};
  
  const isSuperAdminUser = isSuperAdmin();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchUsers({
        offset: currentPage,
        limit: pageSize,
        sortBy,
        filters,
      });
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to load users',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await deactivateUser(userId);
      setToast({ message: 'User deactivated successfully', type: 'success' });
      loadUsers();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to deactivate user',
        type: 'error',
      });
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      setToast({ message: 'User activated successfully', type: 'success' });
      loadUsers();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to activate user',
        type: 'error',
      });
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setToast({ message: 'User created successfully', type: 'success' });
    loadUsers();
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage admin users and permissions</p>
        </div>
        
        {isSuperAdminUser && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              Create New User
            </span>
          </Button>
        )}
      </div>

      {users.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon size={32} className="text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            {isSuperAdminUser 
              ? "Get started by creating your first admin user."
              : "There are no admin users to display at the moment."}
          </p>
        </div>
      ) : (
        <UsersTable
          users={users}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={users.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onUserClick={handleUserClick}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          isSuperAdmin={isSuperAdminUser}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetails
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          isSuperAdmin={isSuperAdminUser}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          onUpdate={handleUserUpdate}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </DashboardLayout>
  );
};
