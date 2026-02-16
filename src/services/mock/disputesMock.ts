import type { Dispute } from '../../components/DisputesTable';

// Mock data for disputes assigned to the current user
const mockDisputes: Dispute[] = [
  {
    id: 'DSP-1024',
    errandId: 'ERR-5821',
    title: 'Payment not received for completed delivery',
    customer: 'Sarah Johnson',
    runner: 'Mike Peterson',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    assignedTo: 'admin',
  },
  {
    id: 'DSP-1023',
    errandId: 'ERR-5819',
    title: 'Item damaged during delivery',
    customer: 'John Davis',
    runner: 'Emily Chen',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    assignedTo: 'admin',
  },
  {
    id: 'DSP-1022',
    errandId: 'ERR-5817',
    title: 'Wrong item delivered',
    customer: 'Amanda Brown',
    runner: 'Carlos Rodriguez',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    assignedTo: 'admin',
  },
  {
    id: 'DSP-1021',
    errandId: 'ERR-5815',
    title: 'Delivery delayed by 2 hours',
    customer: 'Robert Wilson',
    runner: 'Lisa Martinez',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    assignedTo: 'admin',
  },
  {
    id: 'DSP-1020',
    errandId: 'ERR-5814',
    title: 'Runner marked delivery as complete but customer never received',
    customer: 'Maria Garcia',
    runner: 'Tom Anderson',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    assignedTo: 'admin',
  },
  {
    id: 'DSP-1019',
    errandId: 'ERR-5812',
    title: 'Refund request for cancelled errand',
    customer: 'David Lee',
    runner: 'Jennifer White',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    assignedTo: 'admin',
  },
  {
    id: 'DSP-1018',
    errandId: 'ERR-5810',
    title: 'Runner was rude and unprofessional',
    customer: 'Jessica Taylor',
    runner: 'Mark Thompson',
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    assignedTo: 'admin',
  },
  {
    id: 'DSP-1017',
    errandId: 'ERR-5808',
    title: 'Incorrect delivery address used',
    customer: 'Christopher Moore',
    runner: 'Amy Jackson',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    assignedTo: 'admin',
  },
];

/**
 * Fetch disputes assigned to the current user
 * @param assignedTo - User ID or role to filter by (default: 'admin')
 * @returns Promise resolving to array of disputes
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
    pending: disputes.filter((d) => d.status === 'pending').length,
    inProgress: disputes.filter((d) => d.status === 'in_progress').length,
    resolved: disputes.filter((d) => d.status === 'resolved').length,
    highPriority: disputes.filter((d) => d.priority === 'high').length,
  };
};
