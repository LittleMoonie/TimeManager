import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UsersService } from '@/lib/api'
import type { LoginForm, User } from '@/types'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      // This needs to be implemented in the backend
      return {} as User;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(token),
  })

  const loginMutation = useMutation({
    mutationFn: UsersService.loginUser,
    onSuccess: data => {
      window.localStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['auth', 'user'], data.user)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: UsersService.logoutUser,
    onSuccess: () => {
      window.localStorage.removeItem('auth_token')
      queryClient.clear()
      window.location.replace('/login')
    },
  })

  const login = (credentials: LoginForm) => {
    return loginMutation.mutateAsync({ requestBody: credentials })
  }

  const logout = () => {
    return logoutMutation.mutateAsync()
  }

  const isAuthenticated = Boolean(user && token)

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
  }
}
