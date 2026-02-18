import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  XCircle,
  Users,
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Gift,
  BarChart3,
} from 'lucide-react';
import errandgoLogo from '../../assets/errandgo-logo.svg';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <LayoutDashboard size={20} />,
    allowedRoles: ['admin', 'super_admin'],
  },
  {
    label: 'Performance',
    path: '/admin/performance',
    icon: <BarChart3 size={20} />,
    allowedRoles: ['super_admin'],
  },
  {
    label: 'Disputes',
    path: '/admin/disputes',
    icon: <AlertTriangle size={20} />,
    allowedRoles: ['admin', 'super_admin'],
  },
  {
    label: 'Agents',
    path: '/admin/agents',
    icon: <UserCog size={20} />,
    allowedRoles: ['admin', 'super_admin'],
  },
  {
    label: 'Reward Hub',
    path: '/admin/reward-hub',
    icon: <Gift size={20} />,
    allowedRoles: ['super_admin'],
  },
  {
    label: 'Failed Operations',
    path: '/admin/failed-operations',
    icon: <XCircle size={20} />,
    allowedRoles: ['super_admin'],
  },
  {
    label: 'Admins',
    path: '/admin/users',
    icon: <Users size={20} />,
    allowedRoles: ['admin', 'super_admin'],
  },
];

// Helper function to filter nav items based on user role
const filterNavItems = (items: NavItem[], role: string): NavItem[] => {
  return items.filter(item => !item.allowedRoles || item.allowedRoles.includes(role));
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userRole = sessionStorage.getItem('userRole') || 'admin';
  const userName = userRole === 'super_admin' ? 'Super Admin' : 'Admin';

  // Filter nav items based on user role
  const filteredNavItems = filterNavItems(navItems, userRole);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('expiresIn');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={[
          'hidden',
          'lg:flex',
          'flex-col',
          'fixed',
          'left-0',
          'top-0',
          'h-screen',
          'bg-secondary',
          'transition-all',
          'duration-300',
          'z-40',
          isCollapsed ? 'w-20' : 'w-64',
        ].filter(Boolean).join(' ')}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!isCollapsed && (
            <Link to="/admin/dashboard" className="flex items-center">
              <img src={errandgoLogo} alt="ErrandGo" className="h-8" />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-secondary transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const active = isActive(item.path);
              const linkClasses = [
                'flex',
                'items-center',
                'gap-3',
                'px-4',
                'py-3',
                'rounded-lg',
                'text-sm',
                'font-medium',
                'transition-all',
                'duration-200',
                active ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
                isCollapsed ? 'justify-center' : '',
              ].filter(Boolean).join(' ');

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={linkClasses}
                  aria-current={active ? 'page' : undefined}
                  title={isCollapsed ? item.label : ''}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-white/10 p-4">
          {/* Notification Bell */}
          <button
            className={[
              'relative',
              'w-full',
              'p-3',
              'rounded-lg',
              'text-white/80',
              'hover:bg-white/10',
              'hover:text-white',
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-white',
              'focus:ring-offset-2',
              'focus:ring-offset-secondary',
              'mb-2',
              'flex',
              'items-center',
              'gap-3',
              'transition-colors',
              isCollapsed ? 'justify-center' : '',
            ].filter(Boolean).join(' ')}
            aria-label="Notifications"
            title={isCollapsed ? 'Notifications' : ''}
          >
            <div className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" aria-hidden="true" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium">Notifications</span>}
          </button>

          {/* User Profile */}
          <div
            className={[
              'flex',
              'items-center',
              'gap-3',
              'p-3',
              'rounded-lg',
              'bg-white/10',
              isCollapsed ? 'justify-center' : '',
            ].filter(Boolean).join(' ')}
          >
            <div className="w-10 h-10 bg-white text-secondary rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {userName.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{userName}</div>
                <div className="text-xs text-white/60 capitalize truncate">{userRole.replace('_', ' ')}</div>
              </div>
            )}
          </div>

          {/* Settings & Logout */}
          <div className="mt-2 space-y-1">
            <button
              className={[
                'w-full',
                'flex',
                'items-center',
                'gap-3',
                'px-4',
                'py-2',
                'text-sm',
                'text-white/80',
                'hover:bg-white/10',
                'hover:text-white',
                'rounded-lg',
                'transition-colors',
                isCollapsed ? 'justify-center' : '',
              ].filter(Boolean).join(' ')}
              title={isCollapsed ? 'Settings' : ''}
            >
              <Settings size={18} />
              {!isCollapsed && <span>Settings</span>}
            </button>
            <button
              onClick={handleLogout}
              className={[
                'w-full',
                'flex',
                'items-center',
                'gap-3',
                'px-4',
                'py-2',
                'text-sm',
                'text-red-400',
                'hover:bg-red-500/20',
                'hover:text-red-300',
                'rounded-lg',
                'transition-colors',
                isCollapsed ? 'justify-center' : '',
              ].filter(Boolean).join(' ')}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center">
              <img src={errandgoLogo} alt="ErrandGo" className="h-8" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" aria-hidden="true" />
            </button>
            <div className="w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40 lg:hidden overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const active = isActive(item.path);
                const linkClasses = [
                  'flex',
                  'items-center',
                  'gap-3',
                  'px-4',
                  'py-3',
                  'rounded-lg',
                  'text-sm',
                  'font-medium',
                  'transition-colors',
                  'duration-200',
                  active ? 'bg-secondary text-white' : 'text-gray-700 hover:bg-gray-100',
                ].join(' ');

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={linkClasses}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-gray-200 p-4 mt-4">
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
};
