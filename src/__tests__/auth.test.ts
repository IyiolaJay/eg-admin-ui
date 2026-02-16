import { describe, it, expect } from 'vitest';
import { login } from '../services/auth';

describe('Auth Service', () => {
  it('should return success for valid admin credentials', async () => {
    const response = await login({
      identifier: 'admin@errandgo.test',
      password: 'password123',
    });

    expect(response.ok).toBe(true);
    expect(response.role).toBe('admin');
    expect(response.token).toBe('mock-token-admin');
  });

  it('should return success for valid super admin credentials', async () => {
    const response = await login({
      identifier: 'super@errandgo.test',
      password: 'superpass',
    });

    expect(response.ok).toBe(true);
    expect(response.role).toBe('super_admin');
    expect(response.token).toBe('mock-token-super');
  });

  it('should return account_locked error for locked account', async () => {
    const response = await login({
      identifier: 'locked@errandgo.test',
      password: 'anypassword',
    });

    expect(response.ok).toBe(false);
    expect(response.error).toBe('account_locked');
  });

  it('should return invalid_credentials error for wrong credentials', async () => {
    const response = await login({
      identifier: 'wrong@email.com',
      password: 'wrongpass',
    });

    expect(response.ok).toBe(false);
    expect(response.error).toBe('invalid_credentials');
  });

  it('should simulate network delay', async () => {
    const startTime = Date.now();
    await login({
      identifier: 'admin@errandgo.test',
      password: 'password123',
    });
    const endTime = Date.now();

    // Should take at least 750ms (allowing some margin for timing variance)
    expect(endTime - startTime).toBeGreaterThanOrEqual(750);
  });
});
