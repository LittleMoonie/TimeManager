import { beforeEach, describe, it } from 'node:test';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { expect, vi } from 'vitest';

import { useAuth } from '@/hooks/useAuth';
import { AuthenticationService } from '@/lib/api';

import { AuthProvider } from '../AuthProvider';

// Mock the AuthenticationService
vi.mock('@/lib/api', () => ({
  AuthenticationService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock window.location.replace
const mockLocationReplace = vi.fn();
Object.defineProperty(window, 'location', {
  value: { replace: mockLocationReplace },
  writable: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestComponent = () => {
  const { isAuthenticated, user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
      {user && <span>User Role: {user.role?.name}</span>}
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('should initially be unauthenticated', async () => {
    (AuthenticationService.getCurrentUser as vi.Mock).mockRejectedValueOnce(
      new Error('Not authenticated'),
    );

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Authenticated: No')).toBeInTheDocument());
    expect(screen.queryByText('User Role:')).not.toBeInTheDocument();
  });

  it('should authenticate and display user role on successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      companyId: 'company1',
      roleId: 'role1',
      role: { id: 'role1', name: 'MANAGER', companyId: 'company1' },
      statusId: 'status1',
      createdAt: '2023-01-01',
    };

    (AuthenticationService.getCurrentUser as vi.Mock).mockRejectedValueOnce(
      new Error('Not authenticated'),
    );
    (AuthenticationService.login as vi.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: 'fake-token',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText('Authenticated: No')).toBeInTheDocument());

    screen.getByRole('button', { name: /Login/i }).click();

    await waitFor(() => expect(screen.getByText('Authenticated: Yes')).toBeInTheDocument());
    expect(screen.getByText('User Role: MANAGER')).toBeInTheDocument();
  });

  it('should logout successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      companyId: 'company1',
      roleId: 'role1',
      role: { id: 'role1', name: 'EMPLOYEE', companyId: 'company1' },
      statusId: 'status1',
      createdAt: '2023-01-01',
    };

    (AuthenticationService.getCurrentUser as vi.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: 'fake-token',
    });
    (AuthenticationService.logout as vi.Mock).mockResolvedValueOnce(undefined);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText('Authenticated: Yes')).toBeInTheDocument());
    expect(screen.getByText('User Role: EMPLOYEE')).toBeInTheDocument();

    screen.getByRole('button', { name: /Logout/i }).click();

    await waitFor(() => expect(screen.getByText('Authenticated: No')).toBeInTheDocument());
    expect(screen.queryByText('User Role:')).not.toBeInTheDocument();
  });
});
