import { User } from '@/lib/types'

interface JWTPayload {
  userId: number
  email: string
  role: string
  iat: number
  exp: number
  jti: string
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload) return true
  
  return payload.exp * 1000 < Date.now()
}

export function getUserFromToken(token: string): User | null {
  const payload = decodeToken(token)
  if (!payload) return null
  
  return {
    id: payload.userId,
    email: payload.email,
    fullName: '', // Não disponível no token, precisaríamos buscar
    role: payload.role,
    isActive: true,
    createdAt: new Date().toISOString()
  }
}