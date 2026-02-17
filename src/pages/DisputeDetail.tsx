import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { fetchDisputeById } from '../services/disputes';
import { fetchErrandById, type Errand } from '../services/errands';
import { fetchUserById, fetchUsers } from '../services/users';
import type { User as UserType } from '../types/user';
import type { Dispute } from '../components/DisputesTable';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Package,
  CreditCard,
  Gift,
  HelpCircle,
  Calendar,
  UserCircle,
  History,
  Copy,
  Check,
  Plus,
  UserPlus,
  Flag,
  Phone,
  MapPin,
  ChevronDown,
  X,
  Search,
} from 'lucide-react';

interface AuditLogEntry {
  action: string;
  timestamp: string;
  performedBy: string;
  details: string;
  previousAssignee?: string | null;
  newAssignee?: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
}

interface DisputeDetail extends Dispute {
  metadata?: {
    auditTrail?: AuditLogEntry[];
  };
}

// Status theme configuration - only used for header now
const statusThemes: Record<string, { border: string; badge: string; dot: string }> = {
  OPEN: { 
    border: 'border-l-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500'
  },
  IN_REVIEW: { 
    border: 'border-l-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500'
  },
  PENDING_INFORMATION: { 
    border: 'border-l-purple-500',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500'
  },
  RESOLVED: { 
    border: 'border-l-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500'
  },
  ESCALATED: { 
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500'
  },
};

export const DisputeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [errand, setErrand] = useState<Errand | null>(null);
  const [raisedByUser, setRaisedByUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Assign dropdown state
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [admins, setAdmins] = useState<UserType[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      loadDisputeDetail(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAssignDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDisputeDetail = async (disputeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const disputeData = await fetchDisputeById(disputeId) as DisputeDetail;
      setDispute(disputeData);
      
      if (disputeData.module === 'ERRAND' && disputeData.disputeItemId) {
        try {
          const errandData = await fetchErrandById(disputeData.disputeItemId);
          setErrand(errandData);
        } catch (err) {
          console.error('Error fetching errand:', err);
        }
      }
      
      if (disputeData.raisedBy) {
        try {
          const userData = await fetchUserById(disputeData.raisedBy);
          setRaisedByUser(userData);
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      }
    } catch (err) {
      setError('Failed to load dispute details');
      console.error('Error loading dispute:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setAdminsLoading(true);
      const response = await fetchUsers({ limit: 50 });
      setAdmins(response.users);
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setAdminsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (dispute?.id) {
      navigator.clipboard.writeText(dispute.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAssignToMe = () => {
    setAssignDropdownOpen(false);
    // TODO: Implement assign to me API call
    console.log('Assign to me');
  };

  const handleAssignToOther = () => {
    setAssignDropdownOpen(false);
    setAssignModalOpen(true);
    loadAdmins();
  };

  const handleSelectAdmin = (adminId: string) => {
    // TODO: Implement assign to specific admin API call
    console.log('Assign to admin:', adminId);
    setAssignModalOpen(false);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.username?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    admin.firstName?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    admin.lastName?.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string, size: 'sm' | 'lg' = 'sm') => {
    const theme = statusThemes[status] || statusThemes.OPEN;
    const sizeClasses = size === 'lg' 
      ? 'px-4 py-2 text-base font-semibold' 
      : 'px-3 py-1 text-sm font-medium';
    
    const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
      OPEN: { label: 'Open', icon: <AlertTriangle size={size === 'lg' ? 18 : 14} /> },
      IN_REVIEW: { label: 'In Review', icon: <Clock size={size === 'lg' ? 18 : 14} /> },
      PENDING_INFORMATION: { label: 'Pending Info', icon: <Clock size={size === 'lg' ? 18 : 14} /> },
      RESOLVED: { label: 'Resolved', icon: <CheckCircle size={size === 'lg' ? 18 : 14} /> },
      ESCALATED: { label: 'Escalated', icon: <AlertTriangle size={size === 'lg' ? 18 : 14} /> },
    };
    
    const config = statusConfig[status] || { label: status, icon: <HelpCircle size={size === 'lg' ? 18 : 14} /> };
    
    return (
      <span className={`inline-flex items-center gap-2 rounded-full border ${theme.badge} ${sizeClasses}`}>
        <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string, size: 'sm' | 'lg' = 'sm') => {
    const priorityConfig: Record<string, { label: string; color: string }> = {
      LOW: { label: 'Low Priority', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      MEDIUM: { label: 'Medium Priority', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      HIGH: { label: 'High Priority', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      URGENT: { label: 'Urgent Priority', color: 'bg-red-100 text-red-800 border-red-200' },
    };
    
    const config = priorityConfig[priority] || { label: priority, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    const sizeClasses = size === 'lg' 
      ? 'px-4 py-2 text-base font-semibold' 
      : 'px-3 py-1 text-sm font-medium';
    
    return (
      <span className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses}`}>
        {config.label}
      </span>
    );
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'ERRAND':
        return <Package className="w-5 h-5" />;
      case 'PAYMENT':
        return <CreditCard className="w-5 h-5" />;
      case 'REWARD':
        return <Gift className="w-5 h-5" />;
      case 'USER':
        return <User className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateRelative = (dateString: string) => {
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

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATED: 'Dispute Created',
      ASSIGNED: 'Assigned to Agent',
      STATUS_UPDATED: 'Status Changed',
      RESOLVED: 'Dispute Resolved',
      ESCALATED: 'Dispute Escalated',
      UPDATED: 'Details Updated',
    };
    return labels[action] || action;
  };

  const truncateId = (id: string) => {
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dispute) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dispute</h2>
          <p className="text-gray-600 mb-4">{error || 'Dispute not found'}</p>
          <button
            onClick={() => navigate('/admin/disputes')}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Back to Disputes
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const theme = statusThemes[dispute.status] || statusThemes.OPEN;

  return (
    <DashboardLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/disputes')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Disputes</span>
      </button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unified Header + Dispute Details Card - ONLY colored border */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${theme.border} border-l-4`}>
            {/* Header Section */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{dispute.disputeTitle}</h1>
                  
                  {/* Copyable ID with timestamp */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-sm text-gray-500">ID:</span>
                      <code className="text-sm font-mono text-gray-700">{truncateId(dispute.id)}</code>
                      <button
                        onClick={handleCopyId}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy ID"
                      >
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-500" />}
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      Opened {formatDate(dispute.createdAt)}
                    </span>
                  </div>

                  {/* Large Status and Priority Badges */}
                  <div className="flex items-center gap-3">
                    {getStatusBadge(dispute.status, 'lg')}
                    {getPriorityBadge(dispute.priority, 'lg')}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!dispute.assignedTo && (
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setAssignDropdownOpen(!assignDropdownOpen)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <UserPlus size={18} />
                        Assign
                        <ChevronDown size={16} className={`transition-transform ${assignDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {assignDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <button
                            onClick={handleAssignToMe}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <UserPlus size={16} className="text-purple-600" />
                            Assign to Me
                          </button>
                          <button
                            onClick={handleAssignToOther}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <User size={16} className="text-purple-600" />
                            Assign to Other
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {dispute.status !== 'RESOLVED' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
                      <CheckCircle size={18} />
                      Resolve
                    </button>
                  )}
                  {dispute.status !== 'ESCALATED' && dispute.status !== 'RESOLVED' && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
                      <Flag size={18} />
                      Escalate
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Dispute Details Section */}
            <div className="p-6">
              {/* Description with quote style */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Description</label>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-secondary">
                  <p className="text-gray-900 text-base leading-relaxed">{dispute.description}</p>
                </div>
              </div>
              
              {/* Info Bar with Icons */}
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {getModuleIcon(dispute.module)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block">Module</label>
                    <span className="text-sm font-semibold text-gray-900">{dispute.module}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block">Created</label>
                    <span className="text-sm font-semibold text-gray-900">{formatDateRelative(dispute.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block">Updated</label>
                    <span className="text-sm font-semibold text-gray-900">{formatDateRelative(dispute.updatedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <UserCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block">Assigned To</label>
                    {dispute.assignedTo ? (
                      <span className="text-sm font-semibold text-gray-900">{dispute.assignedTo}</span>
                    ) : (
                      <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                        <Plus size={14} />
                        Assign Agent
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {dispute.resolution && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Resolution
                  </label>
                  <p className="mt-2 text-green-900 font-medium">{dispute.resolution}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Information Card - No colored border */}
          {raisedByUser && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-secondary" />
                Raised By
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getInitials(raisedByUser.firstName, raisedByUser.lastName)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {raisedByUser.firstName} {raisedByUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{raisedByUser.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                      <Phone size={14} />
                      {raisedByUser.phoneNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${raisedByUser.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {raisedByUser.isActive ? 'Active Account' : 'Inactive Account'}
                    </span>
                  </div>
                </div>
                <button className="text-secondary hover:text-secondary/80 font-medium text-sm">
                  View Profile →
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Errand Details Card - No colored border */}
          {errand && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Package className="w-5 h-5 text-secondary" />
                  Related Errand
                </h2>
                <p className="text-sm text-gray-500">Errand ID: {truncateId(errand.id)}</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Title and Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{errand.title}</h3>
                  <p className="text-gray-600">{errand.details}</p>
                </div>
                
                {/* Status and Amounts */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        errand.status === 'DISPUTED' 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {errand.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">Payment:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        errand.paymentStatus === 'UNPAID' 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {errand.paymentStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Initial Amount</label>
                      <p className="text-xl font-bold text-gray-900">
                        {errand.currency} {errand.initialAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Platform Fee</label>
                      <p className="text-xl font-bold text-gray-900">
                        {errand.currency} {errand.charges.platformFee.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 block mb-1">Total Amount</label>
                      <p className="text-xl font-bold text-secondary">
                        {errand.currency} {errand.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {errand.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{errand.address}</span>
                  </div>
                )}
                
                {/* Divider */}
                <div className="border-t border-gray-100" />
                
                {/* People Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {errand.creator && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-3 block">Errand Creator</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(errand.creator.firstName, errand.creator.lastName) || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {errand.creator.firstName && errand.creator.lastName 
                              ? `${errand.creator.firstName} ${errand.creator.lastName}`
                              : 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">{errand.creator.phoneNumber}</p>
                        </div>
                        <button className="text-secondary hover:text-secondary/80 text-sm font-medium">
                          View →
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {errand.errandPal && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-3 block">Errand Pal (Runner)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(errand.errandPal.firstName, errand.errandPal.lastName) || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {errand.errandPal.firstName && errand.errandPal.lastName 
                              ? `${errand.errandPal.firstName} ${errand.errandPal.lastName}`
                              : 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">{errand.errandPal.phoneNumber}</p>
                        </div>
                        <button className="text-secondary hover:text-secondary/80 text-sm font-medium">
                          View →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Audit Trail - No colored border */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-secondary" />
                Audit Trail
              </h2>
            </div>
            
            <div className="p-6 max-h-[500px] overflow-y-auto">
              {dispute.metadata?.auditTrail && dispute.metadata.auditTrail.length > 0 ? (
                <div className="relative">
                  {/* Progressive Stepper Line */}
                  <div className="absolute left-[18px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-secondary via-secondary/50 to-gray-200" />
                  
                  <div className="space-y-0">
                    {dispute.metadata.auditTrail.map((log, index) => {
                      const isFirst = index === 0;
                      const isLast = index === dispute.metadata!.auditTrail!.length - 1;
                      const stepNumber = dispute.metadata!.auditTrail!.length - index;
                      
                      return (
                        <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
                          {/* Progressive Stepper Circle */}
                          <div className="relative z-10 flex flex-col items-center">
                            {/* Circle with step number */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all ${
                              isFirst 
                                ? 'bg-secondary text-white ring-4 ring-secondary/20' 
                                : 'bg-white text-secondary border-2 border-secondary ring-4 ring-white'
                            }`}>
                              {stepNumber}
                            </div>
                            
                            {/* Connector line to next step */}
                            {!isLast && (
                              <div className="w-[2px] flex-1 bg-gradient-to-b from-secondary to-secondary/30 mt-1" />
                            )}
                          </div>
                          
                          {/* Content Card */}
                          <div className={`flex-1 pt-1 ${isFirst ? '-mt-1' : ''}`}>
                            <div className={`rounded-lg p-3 ${isFirst ? 'bg-secondary/5 border border-secondary/10' : 'bg-gray-50'}`}>
                              <p className={`font-semibold ${isFirst ? 'text-secondary' : 'text-gray-900'}`}>
                                {getActionLabel(log.action)}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatDate(log.timestamp)}
                              </p>
                              
                              {log.details && (
                                <p className="text-sm text-gray-600 mt-2">{log.details}</p>
                              )}
                              
                              {log.previousStatus && log.newStatus && (
                                <div className="flex items-center gap-2 mt-2 text-xs">
                                  <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                                    {log.previousStatus}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="px-2 py-0.5 bg-secondary/10 rounded text-secondary font-medium">
                                    {log.newStatus}
                                  </span>
                                </div>
                              )}
                              
                              {log.previousAssignee !== undefined && log.newAssignee && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Assigned to <span className="font-medium text-gray-700">{log.newAssignee}</span>
                                </p>
                              )}
                              
                              {log.notes && (
                                <div className="mt-2 bg-white rounded-lg p-2 border-l-2 border-secondary/30">
                                  <p className="text-xs text-gray-500 italic">{log.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2 pl-1">
                              by <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{truncateId(log.performedBy)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No audit trail available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign to Other Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Assign to Admin</h2>
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            </div>
            
            {/* Admin List */}
            <div className="flex-1 overflow-y-auto p-4">
              {adminsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
              ) : filteredAdmins.length > 0 ? (
                <div className="space-y-2">
                  {filteredAdmins.map((admin) => (
                    <button
                      key={admin.id}
                      onClick={() => handleSelectAdmin(admin.id)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(admin.firstName, admin.lastName)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{admin.username}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No admins found</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
