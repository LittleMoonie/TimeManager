import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/api/auth';
import type { LoginForm } from '@/types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(token),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      window.localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      window.localStorage.removeItem('auth_token');
      queryClient.clear();
      window.location.replace('/login');
    },
  });

  const login = (credentials: LoginForm) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  const isAuthenticated = Boolean(user && token);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
};
