export interface ErrandDetails {
  id: string;
  creatorId: string;
  title: string;
  details: string;
  initialAmount: number;
  errandPalId: string;
  status: 'POSTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  currency: string;
  latitude: number;
  longitude: number;
  address: string;
  completedAt: string | null;
  locationDescription: string;
  cancelledAt: string | null;
  hasRequirements: boolean;
  urgency: string;
  createdAt: string;
  charges: {
    platformFee: number;
    commission: number;
    vat: number;
  };
  payoutAmount: number;
  finalAmount: number;
  totalAmount: number;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'customer' | 'runner' | 'agent' | 'admin';
  rating?: number;
  totalErrands?: number;
  joinedAt: string;
}

export interface DisputeDetails {
  dispute: {
    id: string;
    errandId: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    assignedTo: string;
  };
  errand: ErrandDetails;
  creator: UserProfile;
  runner: UserProfile;
}

const mockCreators: UserProfile[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    avatar: undefined,
    role: 'customer',
    rating: 4.8,
    totalErrands: 45,
    joinedAt: '2025-06-15T10:00:00.000Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 234-5678',
    avatar: undefined,
    role: 'customer',
    rating: 4.9,
    totalErrands: 78,
    joinedAt: '2025-03-22T10:00:00.000Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: 'Michael Brown',
    email: 'michael.b@email.com',
    phone: '+1 (555) 345-6789',
    avatar: undefined,
    role: 'customer',
    rating: 4.5,
    totalErrands: 23,
    joinedAt: '2025-08-10T10:00:00.000Z',
  },
];

const mockRunners: UserProfile[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174011',
    name: 'David Wilson',
    email: 'david.w@email.com',
    phone: '+1 (555) 456-7890',
    avatar: undefined,
    role: 'runner',
    rating: 4.7,
    totalErrands: 156,
    joinedAt: '2025-01-05T10:00:00.000Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174012',
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '+1 (555) 567-8901',
    avatar: undefined,
    role: 'runner',
    rating: 4.9,
    totalErrands: 203,
    joinedAt: '2024-11-20T10:00:00.000Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174013',
    name: 'James Martinez',
    email: 'james.m@email.com',
    phone: '+1 (555) 678-9012',
    avatar: undefined,
    role: 'runner',
    rating: 4.6,
    totalErrands: 89,
    joinedAt: '2025-04-12T10:00:00.000Z',
  },
];

const mockErrands: Record<string, ErrandDetails> = {
  'err-001': {
    id: 'err-001',
    creatorId: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Buy groceries',
    details: 'Need to buy milk, eggs, bread, and some vegetables from the local supermarket',
    initialAmount: 100,
    errandPalId: '123e4567-e89b-12d3-a456-426614174011',
    status: 'IN_PROGRESS',
    currency: 'USD',
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 Main St, Anytown, USA',
    completedAt: null,
    locationDescription: 'Apartment 4B, ring the bell',
    cancelledAt: null,
    hasRequirements: false,
    urgency: '2026-02-15T10:00:00.000Z',
    createdAt: '2026-02-14T17:26:34.116Z',
    charges: {
      platformFee: 10,
      commission: 5,
      vat: 2,
    },
    payoutAmount: 83,
    finalAmount: 100,
    totalAmount: 117.5,
    updatedAt: '2026-02-14T17:26:34.116Z',
  },
  'err-002': {
    id: 'err-002',
    creatorId: '123e4567-e89b-12d3-a456-426614174002',
    title: 'Pick up dry cleaning',
    details: 'Pick up dry cleaning from ABC Dry Cleaners on 5th Avenue',
    initialAmount: 50,
    errandPalId: '123e4567-e89b-12d3-a456-426614174012',
    status: 'COMPLETED',
    currency: 'USD',
    latitude: 40.7128,
    longitude: -74.006,
    address: '456 Oak Ave, Springfield',
    completedAt: '2026-02-13T14:30:00.000Z',
    locationDescription: 'Leave at front desk',
    cancelledAt: null,
    hasRequirements: true,
    urgency: '2026-02-14T18:00:00.000Z',
    createdAt: '2026-02-12T09:15:22.000Z',
    charges: {
      platformFee: 5,
      commission: 2.5,
      vat: 1,
    },
    payoutAmount: 41.5,
    finalAmount: 50,
    totalAmount: 58.5,
    updatedAt: '2026-02-13T14:30:00.000Z',
  },
  'err-003': {
    id: 'err-003',
    creatorId: '123e4567-e89b-12d3-a456-426614174003',
    title: 'Walk my dog',
    details: 'Need someone to walk my golden retriever for 1 hour in the park',
    initialAmount: 30,
    errandPalId: '123e4567-e89b-12d3-a456-426614174013',
    status: 'POSTED',
    currency: 'USD',
    latitude: 34.0522,
    longitude: -118.2437,
    address: '789 Pine St, Los Angeles',
    completedAt: null,
    locationDescription: 'Meet at the dog park entrance',
    cancelledAt: null,
    hasRequirements: false,
    urgency: '2026-02-16T09:00:00.000Z',
    createdAt: '2026-02-15T20:45:10.000Z',
    charges: {
      platformFee: 3,
      commission: 1.5,
      vat: 0.5,
    },
    payoutAmount: 25,
    finalAmount: 30,
    totalAmount: 35,
    updatedAt: '2026-02-15T20:45:10.000Z',
  },
};

export async function fetchDisputeDetails(disputeId: string): Promise<DisputeDetails> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const disputeNum = parseInt(disputeId.replace(/\D/g, '')) || 1;
  const errandIndex = (disputeNum - 1) % 3;
  const creatorIndex = (disputeNum - 1) % 3;
  const runnerIndex = (disputeNum - 1) % 3;
  
  const errandKeys = Object.keys(mockErrands);
  const errandKey = errandKeys[errandIndex];
  const errand = mockErrands[errandKey];
  
  const mockDisputes = [
    {
      dispute: {
        id: disputeId,
        errandId: errandKey,
        title: errand.title,
        description: 'Dispute regarding the execution of this errand',
        status: 'in_progress' as const,
        priority: 'high' as const,
        createdAt: '2026-02-14T10:00:00.000Z',
        assignedTo: 'admin',
      },
      errand,
      creator: mockCreators[creatorIndex],
      runner: mockRunners[runnerIndex],
    },
    {
      dispute: {
        id: disputeId,
        errandId: errandKey,
        title: errand.title,
        description: 'Customer reported issue with errand completion',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: '2026-02-15T14:30:00.000Z',
        assignedTo: 'admin',
      },
      errand,
      creator: mockCreators[creatorIndex],
      runner: mockRunners[runnerIndex],
    },
    {
      dispute: {
        id: disputeId,
        errandId: errandKey,
        title: errand.title,
        description: 'Payment dispute related to this errand',
        status: 'resolved' as const,
        priority: 'low' as const,
        createdAt: '2026-02-10T09:00:00.000Z',
        assignedTo: 'admin',
      },
      errand,
      creator: mockCreators[creatorIndex],
      runner: mockRunners[runnerIndex],
    },
  ];
  
  return mockDisputes[disputeNum % 3];
}
