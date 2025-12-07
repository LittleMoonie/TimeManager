import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AuthenticationService, LoginDto, UserResponseDto } from '@/lib/api';

interface AuthResponse {
  token?: string;
  user?: UserResponseDto;
  success: boolean;
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useQuery<UserResponseDto | undefined>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      return await AuthenticationService.getCurrentUser();
    },
    retry: false,
    staleTime: 60 * 1000, // 1 minute
    enabled: true, // Always enabled, as token is now in HttpOnly cookie
    refetchOnWindowFocus: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { requestBody: LoginDto }): Promise<AuthResponse> => {
      return await AuthenticationService.login(credentials).then((response) => ({
        success: true,
        user: response.user,
        token: response.token,
      }));
    },
    onSuccess: (data: AuthResponse) => {
      if (data.user) {
        queryClient.setQueryData(['auth', 'user'], data.user);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        window.location.replace('/app');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthenticationService.logout,
    onSuccess: () => {
      // Token is now in HttpOnly cookie, no need to remove from localStorage
      queryClient.clear();
      window.location.replace('/login');
    },
  });

  const login = (credentials: LoginDto) => {
    return loginMutation.mutateAsync({ requestBody: credentials });
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  const isAuthenticated = Boolean(user && !error); // Authenticated if user data is present and no error

  return {
    user,
    isUserLoading,
    isLoading: isUserLoading || loginMutation.isPending || logoutMutation.isPending,
    error,
    isAuthenticated,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
};
