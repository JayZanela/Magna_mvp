import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
}

const defaultOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/'
}

export class SecureCookies {
  // Definir cookies no response
  static setAccessToken(response: NextResponse, token: string): void {
    const options = {
      ...defaultOptions,
      maxAge: 15 * 60 // 15 minutos
    }
    
    response.cookies.set('accessToken', token, options)
  }

  static setRefreshToken(response: NextResponse, token: string): void {
    const options = {
      ...defaultOptions,
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    }
    
    response.cookies.set('refreshToken', token, options)
  }

  // Obter cookies do request (server-side)
  static getAccessToken(): string | undefined {
    try {
      return cookies().get('accessToken')?.value
    } catch {
      return undefined
    }
  }

  static getRefreshToken(): string | undefined {
    try {
      return cookies().get('refreshToken')?.value
    } catch {
      return undefined
    }
  }

  // Limpar cookies
  static clearTokens(response: NextResponse): void {
    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/'
    }

    response.cookies.set('accessToken', '', clearOptions)
    response.cookies.set('refreshToken', '', clearOptions)
  }

  // Helper para verificar se cookies existem (server-side)
  static hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken())
  }
}