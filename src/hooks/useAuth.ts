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
    enabled: typeof window !== 'undefined', // Only run on client
    refetchOnWindowFocus: false, // Evitar refetch desnecessário
    refetchOnReconnect: false, // Evitar refetch desnecessário
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      // SEMPRE buscar dados atualizados via /me após login
      // Isso garante consistência e dados completos (incluindo empresa)
      await queryClient.refetchQueries({ queryKey: AUTH_KEYS.user })
      
      // Marcar que o usuário acabou de fazer login para redirecionamento
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justLoggedIn', 'true')
      }
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async () => {
      // SEMPRE buscar dados atualizados via /me após registro
      // Isso garante consistência e dados completos (incluindo empresa)
      await queryClient.refetchQueries({ queryKey: AUTH_KEYS.user })
      
      // Marcar que o usuário acabou de se registrar
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('justLoggedIn', 'true')
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Limpeza completa e agressiva do cache
      queryClient.clear()
      queryClient.invalidateQueries()
      
      // Remover especificamente dados sensíveis
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user })
      queryClient.removeQueries({ queryKey: ['projects'] })
      queryClient.removeQueries({ queryKey: ['scenarios'] })
      queryClient.removeQueries({ queryKey: ['executions'] })
      queryClient.removeQueries({ queryKey: ['suites'] })
      
      console.info('[AUTH] Cache limpo após logout')
    },
    onError: (error) => {
      console.error('[AUTH] Erro no logout, limpando cache mesmo assim:', error)
      // Mesmo com erro, limpar o cache local
      queryClient.clear()
    }
  })
}

export function useRefreshToken() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: async () => {
      // SEMPRE buscar dados atualizados via /me após refresh
      // Isso garante consistência e dados completos (incluindo empresa)
      await queryClient.refetchQueries({ queryKey: AUTH_KEYS.user })
    },
  })
}