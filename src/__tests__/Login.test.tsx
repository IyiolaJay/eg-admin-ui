import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import * as authService from '../services/auth';

// Mock the auth service
vi.mock('../services/auth');

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('should render login form with all fields', () => {
    renderLogin();

    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should disable submit button when form is empty', () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when both fields are filled', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');

    expect(submitButton).not.toBeDisabled();
  });

  it('should handle successful login and navigate to dashboard', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: true,
      token: 'mock-token',
      expiresIn: 3600,
      user: {
        id: '1',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@errandgo.test',
        phoneNumber: '+1234567890',
        role: 'admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Wait for success state and navigation
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    }, { timeout: 1000 });
  });

  // CRITICAL: Test for UI crash on failed login
  it('should stay on login page and display error when login fails (no crash/refresh)', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'invalid_credentials',
      message: 'Invalid username or password. Please try again.',
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });

    // Verify error message is displayed
    expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    
    // Critical: Should NOT navigate away
    expect(mockNavigate).not.toHaveBeenCalled();
    
    // Should stay on login page - form should still be present
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    
    // Session storage should remain empty
    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('should display inline error alert for invalid credentials (no toast)', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'invalid_credentials',
      message: 'Invalid username or password. Please try again.',
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Should show inline error, not toast
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
    
    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should display error for locked account and stay on page', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'account_locked',
      message: 'Your account has been locked. Please contact support.',
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'lockeduser');
    await user.type(passwordInput, 'password');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/your account has been locked/i)).toBeInTheDocument();
    });
    
    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should display error for server error and stay on page', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'server_error',
      message: 'Server error. Please try again later.',
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
    
    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle network error and stay on page', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'network_error',
      message: 'Network error. Please check your connection.',
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
    
    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ 
      ok: true, 
      token: 'test',
      expiresIn: 3600,
      user: {
        id: '1',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@errandgo.test',
        phoneNumber: '+1234567890',
        role: 'admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }), 100)));

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Should be disabled during loading
    expect(submitButton).toBeDisabled();
  });

  it('should handle unexpected errors gracefully', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockRejectedValue(new Error('Unexpected error'));

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });
    
    // Should NOT navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should clear previous error when user starts typing again', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    
    // First attempt - failure
    mockLogin.mockResolvedValueOnce({
      ok: false,
      error: 'invalid_credentials',
      message: 'Invalid username or password. Please try again.',
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });

    // Now set up for success
    mockLogin.mockResolvedValueOnce({
      ok: true,
      token: 'mock-token',
      expiresIn: 3600,
      user: {
        id: '1',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@errandgo.test',
        phoneNumber: '+1234567890',
        role: 'admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // User corrects credentials
    await user.clear(usernameInput);
    await user.clear(passwordInput);
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'correctpass');
    await user.click(submitButton);

    // Should eventually navigate to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    }, { timeout: 1000 });
  });
});
