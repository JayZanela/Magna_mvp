import { ApiResponse } from '@/lib/types'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  // Métodos legados mantidos para compatibilidade, mas não fazem nada
  setToken(token: string) {
    // Cookies são gerenciados automaticamente pelo servidor
    // Método mantido para compatibilidade
  }

  removeToken() {
    // Limpeza de cookies é feita pelo servidor via logout
    // Método mantido para compatibilidade
  }

  getStoredToken(): string | null {
    // Tokens agora estão em cookies httpOnly, não acessíveis via JavaScript
    return null
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Importante para enviar cookies httpOnly
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async uploadFile<T = any>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<T>(endpoint, {
      method: 'POST',
      credentials: 'include', // Para enviar cookies httpOnly
      body: formData,
    })
  }
}

export const apiClient = new ApiClient()