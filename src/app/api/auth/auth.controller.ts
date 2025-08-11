import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from './auth.service'
import { registerSchema, signinSchema, refreshTokenSchema } from '@/lib/validations'
import { checkRateLimit, getClientIP } from '@/lib/auth/rateLimit'
import { z } from 'zod'

export class AuthController {
  static async register(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = registerSchema.parse(body)
      
      const result = await AuthService.register(validatedData)
      
      return NextResponse.json(result, { status: 201 })
    } catch (error) {
      console.error('Error registering user:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        // Verificar se é erro de constraint do Prisma
        if (error.message.includes('Unique constraint failed on the fields: (`email`)')) {
          return NextResponse.json(
            { error: 'Email já está em uso' },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to register user' },
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
      
      const result = await AuthService.signin(validatedData)
      
      return NextResponse.json(result)
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
      
      const result = await AuthService.refreshAccessToken(validatedData.refreshToken)
      
      return NextResponse.json(result)
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

      const body = await request.json()
      const validatedData = refreshTokenSchema.parse(body)
      
      await AuthService.logout(validatedData.refreshToken)
      
      return NextResponse.json({ message: 'Logout realizado com sucesso' })
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