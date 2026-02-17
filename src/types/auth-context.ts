import type { AdminUser, AuthState } from './auth';

export interface AuthContextType extends AuthState {
  login: (user: AdminUser, token: string, expiresIn: number) => void;
  logout: () => void;
  checkAuth: () => boolean;
}
