import apiClient, { extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';

export interface ErrandRequirement {
  id: string;
  errandId: string;
  instruction: string;
  type: string;
  referenceUrl: string | null;
  referenceText: string;
  status: string;
  lastStatusUpdate: string;
  acceptedAt: string | null;
  submittedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ErrandUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string;
  isVerified: boolean;
  profileImageUrl: string | null;
  callPhone: string | null;
}

export interface ErrandCharges {
  platformFee: number;
  commission: number;
  vat: number;
}

export interface Errand {
  id: string;
  creatorId: string;
  title: string;
  details: string;
  initialAmount: number;
  errandPalId: string | null;
  status: string;
  currency: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  completedAt: string | null;
  locationDescription: string | null;
  cancelledAt: string | null;
  hasRequirements: boolean;
  urgency: string | null;
  createdAt: string;
  charges: ErrandCharges;
  payoutAmount: number;
  finalAmount: number;
  totalAmount: number;
  updatedAt: string;
  requirements: ErrandRequirement[];
  creator: ErrandUser;
  errandPal: ErrandUser | null;
  totalBids: number;
  bids: any[];
  paymentStatus: string;
  referenceImageUrls: string[];
}

interface ErrandApiResponse {
  success: boolean;
  message: string;
  content: Errand | null;
  error: string | null;
}

/**
 * Fetch errand by ID
 */
export async function fetchErrandById(id: string): Promise<Errand> {
  try {
    const response = await apiClient.get<ErrandApiResponse>(
      ENDPOINTS.ERRAND_DETAILS(id)
    );
    
    if (response.data.success && response.data.content) {
      return response.data.content;
    }
    
    throw new Error(response.data.message || 'Failed to fetch errand details');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}
