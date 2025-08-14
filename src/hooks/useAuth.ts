import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { LoginCredentials, RegisterData, User } from '@/lib/types'

export const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: authApi.getCurrentUser,
    retry: false,
    enabled: typeof window !== 'undefined' // Only run on client
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user })
      queryClient.clear()
    },
  })
}

export function useRefreshToken() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', data.refreshToken)
      }
    },
  })
}