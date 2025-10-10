import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AuthenticationService, LoginDto, UserResponse } from '@/lib/api'

interface AuthResult {
  success: boolean;
  token?: string;
  user?: UserResponse;
}

export const useAuth = () => {
  const queryClient = useQueryClient()
  // const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserResponse | undefined>({ // Explicitly type user as UserResponse
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await AuthenticationService.getCurrentUser() as AuthResult // Cast response to AuthResult
      return response.user
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, as token is now in HttpOnly cookie
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: { requestBody: LoginDto }) => {
      const response = await AuthenticationService.login(credentials);
      return response as AuthResult;
    },
    onSuccess: (data: AuthResult) => {
      if (data.user) {
        // Token is now in HttpOnly cookie, no need to store in localStorage
        queryClient.setQueryData(['auth', 'user'], data.user)
        queryClient.invalidateQueries({ queryKey: ['auth'] })
      }
    },
  })

  const logoutMutation = useMutation({
    mutationFn: AuthenticationService.logout,
    onSuccess: () => {
      // Token is now in HttpOnly cookie, no need to remove from localStorage
      queryClient.clear()
      window.location.replace('/login')
    },
  })

  const login = (credentials: LoginDto) => {
    return loginMutation.mutateAsync({ requestBody: credentials })
  }

  const logout = () => {
    return logoutMutation.mutateAsync()
  }

  const isAuthenticated = Boolean(user) // Authenticated if user data is present

  return {
    user,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    error,
    isAuthenticated,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  }
}