import type { LoginForm, User } from '@/types';
import { http } from './client';
import { delay, mockUsers } from './mockData';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export const authService = {
  login: async (credentials: LoginForm): Promise<{ user: User; token: string }> => {
    if (USE_MOCK_DATA) {
      await delay(800);
      const user = mockUsers.find((candidate) => candidate.email === credentials.email);
      if (!user || credentials.password !== 'admin123') {
        throw new Error('Invalid credentials');
      }
      return {
        user,
        token: `mock-jwt-token-${user.id}`,
      };
    }

    const response = await http.post<{ user: User; token: string }>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    if (USE_MOCK_DATA) {
      await delay(300);
      window.localStorage.removeItem('auth_token');
      return;
    }

    await http.post('/auth/logout');
    window.localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK_DATA) {
      await delay(400);
      const token = window.localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No token found');
      }

      const userId = token.replace('mock-jwt-token-', '');
      const user = mockUsers.find((candidate) => candidate.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }

    const response = await http.get<User>('/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    if (USE_MOCK_DATA) {
      await delay(400);
      const token = window.localStorage.getItem('auth_token') ?? 'mock-jwt-token-1';
      return { token };
    }

    const response = await http.post<{ token: string }>('/auth/refresh');
    return response.data;
  },
};

export type AuthService = typeof authService;
