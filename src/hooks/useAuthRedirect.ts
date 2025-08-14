import { useEffect } from 'react'
import { useCurrentUser } from './useAuth'

// Páginas que requerem autenticação
const PROTECTED_ROUTES = [
  '/projects',
  '/scenarios',
  '/executions',
  '/settings',
  '/dashboard'
]

// Páginas que só usuários deslogados podem acessar
const GUEST_ONLY_ROUTES = [
  '/login',
  '/register'
]

export function useAuthRedirect() {
  const { data: user, isLoading } = useCurrentUser()

  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return

    const currentPath = window.location.pathname

    // Se usuário não está logado e está em página protegida
    if (!user && PROTECTED_ROUTES.some(route => currentPath.startsWith(route))) {
      console.info('[AUTH] Usuário não autenticado em página protegida - redirecionando para home')
      window.location.href = '/'
      return
    }

    // Se usuário está logado e está em página só para guests
    if (user && GUEST_ONLY_ROUTES.some(route => currentPath.startsWith(route))) {
      console.info('[AUTH] Usuário autenticado em página de guest - redirecionando para home')
      window.location.href = '/'
      return
    }

    // Se usuário acabou de fazer login e estava numa página de guest, ir para projetos
    if (user && currentPath === '/' && sessionStorage.getItem('justLoggedIn')) {
      sessionStorage.removeItem('justLoggedIn')
      console.info('[AUTH] Usuário recém autenticado - redirecionando para projetos')
      // Podemos redirecionar para a dashboard ou projetos
      // window.location.href = '/projects' // Descomentei se quiser redirecionar automaticamente
    }
  }, [user, isLoading])

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoading
  }
}