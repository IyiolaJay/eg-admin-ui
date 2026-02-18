import { paymentApiClient, extractApiErrorMessage } from '../api/client';
import { ENDPOINTS } from '../api/config';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  availableBalance?: number; // Optional for backward compatibility
  accountNumber: number | null;
  accountName: string | null;
  bank: string | null;
  accountProvider: string | null;
  virtualAccountNumber: number | null;
  virtualAccountName: string;
  virtualBank: string;
  virtualAccountProvider: string;
  staticEnabled: boolean;
  currency: string;
  metadata?: {
    type?: string;
    purpose?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface WalletsPaginatedContent {
  data: Wallet[];
  offset: number;
  limit: number;
  totalPages: number;
  totalElements: number;
}

interface WalletsApiResponse {
  success: boolean;
  message: string;
  content: WalletsPaginatedContent | null;
  error: string | null;
}

interface WalletApiResponse {
  success: boolean;
  message: string;
  content: Wallet | null;
  error: string | null;
}

/**
 * Fetch all commission wallets with virtual bank filter
 * Uses: GET /api/v1/wallets?offset=1&limit=20&virtualBank=internal
 */
export async function fetchWallets(): Promise<Wallet[]> {
  try {
    console.log('Fetching wallets from endpoint:', '/wallets?offset=1&limit=20&virtualBank=internal');
    const response = await paymentApiClient.get<WalletsApiResponse>('/wallets?offset=1&limit=20&virtualBank=internal');
    
    console.log('Wallets API Response:', response.data);

    if (response.data.success && response.data.content && response.data.content.data) {
      const wallets = response.data.content.data;
      console.log(`Successfully loaded ${wallets.length} wallets`);
      return wallets;
    }

    console.warn('Wallets response success but no content:', response.data.message);
    return [];
  } catch (error) {
    console.error('Error fetching wallets:', error);
    throw new Error(extractApiErrorMessage(error));
  }
}

/**
 * Fetch wallet by ID
 */
export async function fetchWalletById(id: string): Promise<Wallet> {
  try {
    const response = await paymentApiClient.get<WalletApiResponse>(
      ENDPOINTS.WALLET_DETAILS(id)
    );

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new Error(response.data.message || 'Failed to fetch wallet details');
  } catch (error) {
    throw new Error(extractApiErrorMessage(error));
  }
}
