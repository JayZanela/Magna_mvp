import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLogout } from './useAuth'

export function useAuthManager() {
  const queryClient = useQueryClient()
  const logoutMutation = useLogout()
  const isHandlingSessionExpired = useRef(false)

  const handleSessionExpired = () => {
    // Evitar execuções múltiplas
    if (isHandlingSessionExpired.current) {
      console.info('[AUTH] Sessão expirada já está sendo tratada - ignorando')
      return
    }
    
    isHandlingSessionExpired.current = true
    console.warn('[AUTH] Sessão expirada detectada - limpando estado...')
    
    // 1. Limpar TODOS os dados do React Query IMEDIATAMENTE
    queryClient.clear()
    
    // 2. Remover dados específicos do usuário
    queryClient.removeQueries({ queryKey: ['auth', 'user'] })
    queryClient.removeQueries({ queryKey: ['projects'] })
    queryClient.removeQueries({ queryKey: ['scenarios'] })
    queryClient.removeQueries({ queryKey: ['executions'] })
    queryClient.removeQueries({ queryKey: ['suites'] })
    
    // 3. Fazer logout no servidor (limpar cookies) - SEM callback que causa loops
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        // Sempre executar após logout (sucesso ou erro)
        console.info('[AUTH] Limpeza de sessão completa')
        isHandlingSessionExpired.current = false
        
        // Redirecionar apenas se necessário
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (currentPath !== '/' && currentPath !== '/register') {
            window.location.href = '/'
          }
        }
      }
    })
  }

  const handleManualLogout = () => {
    console.info('[AUTH] Logout manual iniciado...')
    
    // Mesma limpeza que sessão expirada
    queryClient.clear()
    queryClient.invalidateQueries()
    
    // Logout no servidor
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        console.info('[AUTH] Logout manual completo')
        // Para logout manual, não redirecionamos automaticamente
        // O componente que chamou deve decidir o que fazer
      }
    })
  }

  // Escutar evento de sessão expirada
  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('auth:session-expired', handleSessionExpired)
    
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [])

  return {
    handleManualLogout,
    handleSessionExpired,
    isLoggingOut: logoutMutation.isPending
  }
}