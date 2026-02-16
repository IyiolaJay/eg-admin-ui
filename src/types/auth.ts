export type UserRole = 'admin' | 'super_admin';

export interface LoginResponse {
  ok: boolean;
  role?: UserRole;
  token?: string;
  error?: 'invalid_credentials' | 'account_locked';
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}
