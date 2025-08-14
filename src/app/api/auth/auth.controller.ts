import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './auth.service'
import { companyRegisterSchema, signinSchema, refreshTokenSchema } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/auth/rateLimit'
import { z } from 'zod'

export class AuthController {
  static async registerCompany(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = companyRegisterSchema.parse(body)
      
      const response = NextResponse.json({}, { status: 201 })
      const result = await AuthService.registerCompany(validatedData, response)
      
      return NextResponse.json(result, { status: 201, headers: response.headers })
    } catch (error) {
      console.error('Error registering company:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha ao cadastrar empresa' },
        { status: 500 }
      )
    }
  }

  static async signin(request: NextRequest): Promise<NextResponse> {
    try {
      // Rate limiting check
      const clientIP = getClientIP(request)
      const rateLimitResult = checkRateLimit(clientIP)
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Rate limit excedido. Tente novamente em alguns minutos.', 
            timeLeft: rateLimitResult.timeLeft
          },
          { status: 429 }
        )
      }

      const body = await request.json()
      const validatedData = signinSchema.parse(body)
      
      const response = NextResponse.json({})
      const result = await AuthService.signin(validatedData, response)
      
      return NextResponse.json(result, { headers: response.headers })
    } catch (error) {
      console.error('Error signing in user:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to sign in user' },
        { status: 500 }
      )
    }
  }

  static async refreshToken(request: NextRequest): Promise<NextResponse> {
    try {
      // Rate limiting check
      const clientIP = getClientIP(request)
      const rateLimitResult = checkRateLimit(clientIP)
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Rate limit excedido para refresh. Tente novamente em alguns minutos.', 
            timeLeft: rateLimitResult.timeLeft
          },
          { status: 429 }
        )
      }

      const body = await request.json()
      const validatedData = refreshTokenSchema.parse(body)
      
      const response = NextResponse.json({})
      const result = await AuthService.refreshAccessToken(validatedData.refreshToken, response)
      
      return NextResponse.json(result, { headers: response.headers })
    } catch (error) {
      console.error('Error refreshing token:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        // Mapear erros específicos para status HTTP apropriados
        const errorMap: Record<string, { status: number, message: string }> = {
          'INVALID_REFRESH_TOKEN': { status: 401, message: 'Token de refresh inválido' },
          'EXPIRED_REFRESH_TOKEN': { status: 401, message: 'Token de refresh expirado' },
          'CORRUPTED_REFRESH_TOKEN': { status: 401, message: 'Token de refresh corrompido' },
          'TOKEN_MISMATCH': { status: 401, message: 'Token de refresh inconsistente' },
          'USER_NOT_FOUND': { status: 401, message: 'Usuário não encontrado ou inativo' },
        }

        const errorInfo = errorMap[error.message]
        if (errorInfo) {
          return NextResponse.json(
            { error: errorInfo.message },
            { status: errorInfo.status }
          )
        }
        
        return NextResponse.json(
          { error: 'Erro interno no refresh' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha no refresh do token' },
        { status: 500 }
      )
    }
  }

  static async logout(request: NextRequest): Promise<NextResponse> {
    try {
      // Rate limiting check
      const clientIP = getClientIP(request)
      const rateLimitResult = checkRateLimit(clientIP)
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: 'Rate limit excedido para logout. Tente novamente em alguns minutos.', 
            timeLeft: rateLimitResult.timeLeft
          },
          { status: 429 }
        )
      }

      const response = NextResponse.json({ message: 'Logout realizado com sucesso' })
      
      // Tentar pegar refreshToken do body, se não existir usará cookies
      let refreshToken: string | undefined
      try {
        const body = await request.json()
        const validatedData = refreshTokenSchema.parse(body)
        refreshToken = validatedData.refreshToken
      } catch {
        // Se falhar na validação, deixar undefined para usar cookies
      }
      
      await AuthService.logout(refreshToken, response)
      
      return response
    } catch (error) {
      console.error('Error logging out user:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        // Tratar erro específico de logout
        if (error.message === 'INVALID_LOGOUT_TOKEN') {
          return NextResponse.json(
            { error: 'Token de logout inválido' },
            { status: 401 }
          )
        }
        
        return NextResponse.json(
          { error: 'Erro interno no logout' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha no logout' },
        { status: 500 }
      )
    }
  }
}