import { createContext, ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { UserResponseDto, LoginDto } from '@/lib/api';

interface AuthResult {
  success: boolean;
  token?: string;
  user?: UserResponseDto;
}

interface AuthContextType {
  user: UserResponseDto | undefined;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  loginError: Error | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
