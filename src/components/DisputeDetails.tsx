import React, { useEffect, useState } from 'react';
import { X, MapPin, Clock, DollarSign, Phone, Mail, Star, Calendar, AlertTriangle } from 'lucide-react';
import { fetchDisputeDetails, type DisputeDetails as DisputeDetailsType } from '../services/mock/errandMock';

interface DisputeDetailsProps {
  disputeId: string | null;
  onClose: () => void;
}

export const DisputeDetails: React.FC<DisputeDetailsProps> = ({ disputeId, onClose }) => {
  const [details, setDetails] = useState<DisputeDetailsType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (disputeId) {
      setLoading(true);
      fetchDisputeDetails(disputeId)
        .then((data) => {
          setDetails(data);
        })
        .catch((err) => {
          console.error('Error loading dispute details:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [disputeId]);

  if (!disputeId) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; classes: string }> = {
      POSTED: { label: 'Posted', classes: 'bg-blue-100 text-blue-800' },
      ACCEPTED: { label: 'Accepted', classes: 'bg-purple-100 text-purple-800' },
      IN_PROGRESS: { label: 'In Progress', classes: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Completed', classes: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
      EXPIRED: { label: 'Expired', classes: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
    return (
      <span className={['px-2 py-1 rounded-full text-xs font-medium', config.classes].join(' ')}>
        {config.label}
      </span>
    );
  };

  const UserProfileCard: React.FC<{ user: DisputeDetailsType['creator'] | DisputeDetailsType['runner']; type: 'creator' | 'runner' }> = ({ user, type }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-semibold text-lg">
          {user.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{user.name}</h4>
          <p className="text-sm text-gray-500 capitalize">{type}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail size={14} className="text-gray-400" />
          <span className="text-gray-600 truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} className="text-gray-400" />
          <span className="text-gray-600">{user.phone}</span>
        </div>
        {user.rating && (
          <div className="flex items-center gap-2 text-sm">
            <Star size={14} className="text-yellow-500" />
            <span className="text-gray-600">{user.rating} rating</span>
          </div>
        )}
        {user.totalErrands && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle size={14} className="text-gray-400" />
            <span className="text-gray-600">{user.totalErrands} errands completed</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-gray-600">Joined {formatDate(user.joinedAt)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : details ? (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Dispute Details</h2>
                  <p className="text-sm text-gray-500">ID: #{details.dispute.id}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UserProfileCard user={details.creator} type="creator" />
                  <UserProfileCard user={details.runner} type="runner" />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Errand Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{details.errand.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{details.errand.details}</p>
                      </div>
                      {getStatusBadge(details.errand.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(details.errand.initialAmount, details.errand.currency)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium text-gray-900">{formatDate(details.errand.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900">{details.errand.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle size={16} className="text-gray-400" />
                        <span className="text-gray-600">Urgency:</span>
                        <span className="font-medium text-gray-900">{formatDate(details.errand.urgency)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Payment Breakdown</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Initial Amount</span>
                          <p className="font-medium text-gray-900">{formatCurrency(details.errand.initialAmount, details.errand.currency)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Platform Fee</span>
                          <p className="font-medium text-gray-900">{formatCurrency(details.errand.charges.platformFee, details.errand.currency)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Commission + VAT</span>
                          <p className="font-medium text-gray-900">{formatCurrency(details.errand.charges.commission + details.errand.charges.vat, details.errand.currency)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Amount</span>
                          <p className="font-semibold text-gray-900">{formatCurrency(details.errand.totalAmount, details.errand.currency)}</p>
                        </div>
                      </div>
                    </div>

                    {details.errand.locationDescription && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Location Description</h5>
                        <p className="text-sm text-gray-600">{details.errand.locationDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispute Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">{details.dispute.description}</p>
                      </div>
                      <span className={[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        details.dispute.priority === 'high' ? 'bg-red-100 text-red-800' :
                        details.dispute.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      ].join(' ')}>
                        {details.dispute.priority.toUpperCase()} Priority
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(details.dispute.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Failed to load dispute details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
