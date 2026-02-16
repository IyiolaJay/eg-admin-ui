import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import * as authService from '../services/auth';

// Mock the auth service
vi.mock('../services/auth');

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
  });

  it('should render login form with all fields', () => {
    renderLogin();

    expect(screen.getByPlaceholderText(/admin@errandgo.test/i)).toBeInTheDocument();
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

    const emailInput = screen.getByPlaceholderText(/admin@errandgo.test/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'admin@errandgo.test');
    await user.type(passwordInput, 'password123');

    expect(submitButton).not.toBeDisabled();
  });

  it('should show validation error for empty email', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/admin@errandgo.test/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    // Fill password only
    await user.type(passwordInput, 'test');
    
    // Attempt to fill email with just spaces (simulating empty after trim)
    await user.type(emailInput, ' ');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Button should be disabled when identifier is empty/whitespace
    expect(submitButton).toBeDisabled();
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/admin@errandgo.test/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'invalid@email');
    await user.type(passwordInput, 'password');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);

    expect(passwordInput.type).toBe('text');

    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: true,
      role: 'admin',
      token: 'mock-token',
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText(/admin@errandgo.test/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'admin@errandgo.test');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identifier: 'admin@errandgo.test',
        password: 'password123',
      });
    });

    expect(sessionStorage.getItem('authToken')).toBe('mock-token');
    expect(sessionStorage.getItem('userRole')).toBe('admin');
  });

  it('should display error toast for invalid credentials', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'invalid_credentials',
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText(/admin@errandgo.test/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'wrong@email.com');
    await user.type(passwordInput, 'wrongpass');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('should display error toast for locked account', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockResolvedValue({
      ok: false,
      error: 'account_locked',
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText(/admin@errandgo.test/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'locked@errandgo.test');
    await user.type(passwordInput, 'password');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(await screen.findByText(/your account has been locked/i)).toBeInTheDocument();
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true, role: 'admin', token: 'test' }), 1000)));

    renderLogin();

    const emailInput = screen.getByPlaceholderText(/admin@errandgo.test/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'admin@errandgo.test');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    expect(submitButton).toBeDisabled();
  });
});
