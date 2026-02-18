import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import type { AdminUser, AuthState } from '../types/auth';
import type { AuthContextType } from '../types/auth-context';
import { getCurrentUser, isAuthenticated as checkIsAuthenticated, logout as logoutService } from '../services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const user = getCurrentUser();
    const token = sessionStorage.getItem('authToken');
    const expiresInStr = sessionStorage.getItem('expiresIn');
    
    return {
      isAuthenticated: !!token,
      user,
      accessToken: token,
      expiresIn: expiresInStr ? parseInt(expiresInStr, 10) : null,
    };
  });

  const login = useCallback((user: AdminUser, token: string, expiresIn: number) => {
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('userRole', user.role);
    sessionStorage.setItem('expiresIn', expiresIn.toString());
    
    setAuthState({
      isAuthenticated: true,
      user,
      accessToken: token,
      expiresIn,
    });
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      expiresIn: null,
    });
  }, []);

  const checkAuth = useCallback(() => {
    return checkIsAuthenticated();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the context for the hook (non-component export, but context is okay)
export { AuthContext };
