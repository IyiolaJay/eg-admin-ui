import type { Dispute } from '../../components/DisputesTable';

// Mock data for disputes - matches new API format with admin details
const mockDisputes: Dispute[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    disputeTitle: 'Payment not received after errand completion',
    description: 'User requested cancellation with reason: Payment not received after errand completion',
    priority: 'HIGH',
    status: 'OPEN',
    module: 'ERRAND',
    disputeItemId: '660e8400-e29b-41d4-a716-446655440001',
    raisedBy: '770e8400-e29b-41d4-a716-446655440002',
    assignedTo: null,
    resolution: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    disputeTitle: 'Incorrect reward calculation',
    description: 'Expected 500 points but only received 300 points',
    priority: 'MEDIUM',
    status: 'IN_REVIEW',
    module: 'REWARD',
    disputeItemId: '660e8400-e29b-41d4-a716-446655440004',
    raisedBy: '770e8400-e29b-41d4-a716-446655440005',
    assignedTo: 'admin-123',
    resolution: null,
    admin: {
      id: 'admin-123',
      username: 'john.doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@errandgo.com',
      phoneNumber: '+1234567890',
      role: 'ADMIN',
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    disputeTitle: 'Item damaged during delivery',
    description: 'The delivered item was damaged during transportation',
    priority: 'HIGH',
    status: 'OPEN',
    module: 'ERRAND',
    disputeItemId: '660e8400-e29b-41d4-a716-446655440007',
    raisedBy: '770e8400-e29b-41d4-a716-446655440008',
    assignedTo: 'admin-001',
    resolution: null,
    admin: {
      id: 'admin-001',
      username: 'jane.smith',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@errandgo.com',
      phoneNumber: '+1234567891',
      role: 'ADMIN',
    },
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    disputeTitle: 'Wrong item delivered',
    description: 'Customer received a different item than what was ordered',
    priority: 'MEDIUM',
    status: 'PENDING_INFORMATION',
    module: 'ERRAND',
    disputeItemId: '660e8400-e29b-41d4-a716-446655440010',
    raisedBy: '770e8400-e29b-41d4-a716-446655440011',
    assignedTo: 'admin-001',
    resolution: null,
    admin: {
      id: 'admin-001',
      username: 'jane.smith',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@errandgo.com',
      phoneNumber: '+1234567891',
      role: 'ADMIN',
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    disputeTitle: 'Delivery delayed by 2 hours',
    description: 'Runner was 2 hours late for delivery',
    priority: 'LOW',
    status: 'RESOLVED',
    module: 'ERRAND',
    disputeItemId: '660e8400-e29b-41d4-a716-446655440013',
    raisedBy: '770e8400-e29b-41d4-a716-446655440014',
    assignedTo: 'admin-001',
    resolution: 'Compensation provided to customer',
    admin: {
      id: 'admin-001',
      username: 'jane.smith',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@errandgo.com',
      phoneNumber: '+1234567891',
      role: 'ADMIN',
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    disputeTitle: 'Payment dispute - incorrect amount charged',
    description: 'Customer was charged more than the agreed amount',
    priority: 'URGENT',
    status: 'ESCALATED',
    module: 'PAYMENT',
    disputeItemId: '660e8400-e29b-41d4-a716-446655440016',
    raisedBy: '770e8400-e29b-41d4-a716-446655440017',
    assignedTo: 'super-admin-001',
    resolution: null,
    admin: {
      id: 'super-admin-001',
      username: 'mike.johnson',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@errandgo.com',
      phoneNumber: '+1234567892',
      role: 'SUPER_ADMIN',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440018',
    disputeTitle: 'User account access issue',
    description: 'User cannot access their account after password reset',
    priority: 'MEDIUM',
    status: 'OPEN',
    module: 'USER',
    disputeItemId: '770e8400-e29b-41d4-a716-446655440019',
    raisedBy: '770e8400-e29b-41d4-a716-446655440019',
    assignedTo: null,
    resolution: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    disputeTitle: 'Refund not processed',
    description: 'Customer is waiting for refund for 5 days',
    priority: 'HIGH',
    status: 'IN_REVIEW',
    module: 'PAYMENT',
    disputeItemId: '660e8400-e29b-41d4-a716-446655440021',
    raisedBy: '770e8400-e29b-41d4-a716-446655440022',
    assignedTo: 'admin-789',
    resolution: null,
    admin: {
      id: 'admin-789',
      username: 'sarah.wilson',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@errandgo.com',
      phoneNumber: '+1234567893',
      role: 'ADMIN',
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
];

/**
 * Fetch disputes with pagination and filters (mock implementation)
 */
export const fetchMockDisputes = async (
  offset: number = 0,
  limit: number = 10,
  filters?: {
    status?: string;
    priority?: string;
    module?: string;
    assignedTo?: string;
  }
): Promise<{ items: Dispute[]; offset: number; limit: number; total: number }> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...mockDisputes];

  // Apply filters
  if (filters?.status) {
    filtered = filtered.filter((d) => d.status === filters.status);
  }
  if (filters?.priority) {
    filtered = filtered.filter((d) => d.priority === filters.priority);
  }
  if (filters?.module) {
    filtered = filtered.filter((d) => d.module === filters.module);
  }
  if (filters?.assignedTo) {
    filtered = filtered.filter((d) => d.assignedTo === filters.assignedTo);
  }

  // Apply pagination
  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    offset,
    limit,
    total,
  };
};

/**
 * Fetch disputes assigned to the current user
 */
export const fetchMyDisputes = async (assignedTo: string = 'admin'): Promise<Dispute[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter disputes by assigned user
  const filteredDisputes = mockDisputes.filter((dispute) => dispute.assignedTo === assignedTo);

  return filteredDisputes;
};

/**
 * Get dispute count by status
 */
export const getDisputeStats = (disputes: Dispute[]) => {
  return {
    total: disputes.length,
    open: disputes.filter((d) => d.status === 'OPEN').length,
    inReview: disputes.filter((d) => d.status === 'IN_REVIEW').length,
    pendingInfo: disputes.filter((d) => d.status === 'PENDING_INFORMATION').length,
    resolved: disputes.filter((d) => d.status === 'RESOLVED').length,
    escalated: disputes.filter((d) => d.status === 'ESCALATED').length,
    highPriority: disputes.filter((d) => d.priority === 'HIGH' || d.priority === 'URGENT').length,
  };
};

/**
 * Get mock dispute stats for dashboard
 */
export const getMockDisputeStats = () => {
  return {
    total: mockDisputes.length,
    createdToday: 3,
    resolved: mockDisputes.filter((d) => d.status === 'RESOLVED').length,
    open: mockDisputes.filter((d) => d.status === 'OPEN' || d.status === 'IN_REVIEW' || d.status === 'PENDING_INFORMATION').length,
  };
};
