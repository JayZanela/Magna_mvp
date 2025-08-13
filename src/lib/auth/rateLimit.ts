import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
  blockedUntil?: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(ip: string): { allowed: boolean, timeLeft?: number } {
  // Desabilitar rate limiting em ambiente de teste
  if (process.env.NODE_ENV === 'test') {
    return { allowed: true }
  }
  
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minuto
  const maxRequests = 5 // 5 requests por minuto
  const blockDurationMs = 5 * 60 * 1000 // 5 minutos de bloqueio
  
  const entry = rateLimitStore.get(ip)
  
  // Se está bloqueado
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    const timeLeft = Math.ceil((entry.blockedUntil - now) / 1000)
    return { allowed: false, timeLeft }
  }
  
  // Reset da janela
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true }
  }
  
  // Incrementar contador
  entry.count++
  
  // Excedeu o limite - BLOQUEAR
  if (entry.count > maxRequests) {
    entry.blockedUntil = now + blockDurationMs
    rateLimitStore.set(ip, entry)
    return { allowed: false, timeLeft: Math.ceil(blockDurationMs / 1000) }
  }
  
  return { allowed: true }
}

// Helper para pegar IP do request
export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         request.ip || 
         '127.0.0.1'
}