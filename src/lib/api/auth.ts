import { apiClient } from './client'
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/lib/types'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin', credentials)
    
    if (response.accessToken) {
      apiClient.setToken(response.accessToken)
    }
    
    return response
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    
    if (response.accessToken) {
      apiClient.setToken(response.accessToken)
    }
    
    return response
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
    apiClient.removeToken()
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken
    })
    
    if (response.accessToken) {
      apiClient.setToken(response.accessToken)
    }
    
    return response
  },

  async getCurrentUser(): Promise<User | null> {
    const token = apiClient.getStoredToken()
    if (!token) return null
    
    const { getUserFromToken, isTokenExpired } = await import('@/lib/auth/token')
    
    if (isTokenExpired(token)) {
      return null
    }
    
    return getUserFromToken(token)
  }
}