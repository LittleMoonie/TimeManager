import type { LoginForm, User } from '@/types'
import { UsersService } from './index'

export const authService = {
  login: async (credentials: LoginForm): Promise<{ user: User; token: string }> => {
    const response = await UsersService.userControllerLoginUser(credentials);
    return response;
  },

  logout: async (): Promise<void> => {
    await UsersService.userControllerLogoutUser();
    window.localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<User> => {
    // This needs to be implemented in the backend
    return {} as User;
  },
};

export type AuthService = typeof authService
