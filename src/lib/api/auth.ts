import { apiClient } from './client'
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/lib/types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin', credentials)
    
    // Tokens agora são gerenciados via cookies httpOnly pelo servidor
    // Não é mais necessário setar tokens manualmente
    
    return response
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    
    // Tokens agora são gerenciados via cookies httpOnly pelo servidor
    // Não é mais necessário setar tokens manualmente
    
    return response
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
    // Cookies são limpos pelo servidor automaticamente
  },

  async refreshToken(): Promise<AuthResponse> {
    // RefreshToken agora é enviado automaticamente via cookies httpOnly
    // Não precisamos mais acessá-lo via localStorage
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {})
    
    // Novos tokens são setados automaticamente via cookies pelo servidor
    
    return response
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Usar o novo endpoint /auth/me para obter dados do usuário atual
      // Os cookies httpOnly serão enviados automaticamente
      const response = await apiClient.get<{ user: User }>('/auth/me')
      return response.user
    } catch {
      // Se der erro (401, 403, etc), usuário não está autenticado
      return null
    }
  }
}