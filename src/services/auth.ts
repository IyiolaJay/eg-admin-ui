import type { LoginCredentials, LoginResponse } from '../types/auth';

/**
 * Mock authentication service for Phase 1
 * Simulates API delay and various response scenarios
 */
export async function login({ identifier, password }: LoginCredentials): Promise<LoginResponse> {
  // Simulate network delay (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Admin user
  if (identifier === 'admin@errandgo.test' && password === 'password123') {
    return { ok: true, role: 'admin', token: 'mock-token-admin' };
  }

  // Super admin user
  if (identifier === 'super@errandgo.test' && password === 'superpass') {
    return { ok: true, role: 'super_admin', token: 'mock-token-super' };
  }

  // Locked account scenario
  if (identifier === 'locked@errandgo.test') {
    return { ok: false, error: 'account_locked' };
  }

  // Default: invalid credentials
  return { ok: false, error: 'invalid_credentials' };
}
