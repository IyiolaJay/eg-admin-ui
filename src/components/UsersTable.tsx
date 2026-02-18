import React from 'react';
import { MoreVertical, Edit, Eye, UserX, UserCheck } from 'lucide-react';
import { Pagination } from './Pagination';
import type { User } from '../types/user';

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onUserClick?: (user: User) => void;
  onDeactivate?: (userId: string) => void;
  onActivate?: (userId: string) => void;
  isSuperAdmin: boolean;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading = false,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onUserClick,
  onDeactivate,
  onActivate,
  isSuperAdmin,
}) => {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: User['role']) => {
    const roleConfig = {
      super_admin: {
        label: 'Super Admin',
        classes: 'bg-purple-100 text-purple-700 border-purple-200',
      },
      admin: {
        label: 'Admin',
        classes: 'bg-secondary/10 text-secondary border-secondary/20',
      },
    };

    const config = roleConfig[role];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.classes}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        Inactive
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleMenuClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setOpenMenuId(null);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onUserClick?.(user)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-secondary">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.isActive)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="relative" ref={openMenuId === user.id ? menuRef : undefined}>
                    <button
                      onClick={(e) => handleMenuClick(e, user.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {openMenuId === user.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={(e) => handleActionClick(e, () => onUserClick?.(user))}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex flex-row items-center gap-2"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        
                        {isSuperAdmin && (
                          <>
                            <button
                              onClick={(e) => handleActionClick(e, () => {/* Edit logic */})}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex flex-row items-center gap-2"
                            >
                              <Edit size={16} />
                              <span>Edit</span>
                            </button>
                            
                            {user.isActive ? (
                              <button
                                onClick={(e) => handleActionClick(e, () => onDeactivate?.(user.id))}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex flex-row items-center gap-2"
                              >
                                <UserX size={16} />
                                <span>Deactivate</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleActionClick(e, () => onActivate?.(user.id))}
                                className="w-full px-4 py-2 text-left text-sm text-success hover:bg-green-50 flex flex-row items-center gap-2"
                              >
                                <UserCheck size={16} />
                                <span>Activate</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
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
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
