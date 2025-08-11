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
            error: 'Too many login attempts', 
            message: `Try again in ${rateLimitResult.timeLeft} seconds` 
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
      const body = await request.json()
      const validatedData = refreshTokenSchema.parse(body)
      
      const result = await AuthService.refreshAccessToken(validatedData.refreshToken)
      
      return NextResponse.json(result)
    } catch (error) {
      console.error('Error refreshing token:', error)
      
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
        { error: 'Failed to refresh token' },
        { status: 500 }
      )
    }
  }

  static async logout(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = refreshTokenSchema.parse(body)
      
      await AuthService.logout(validatedData.refreshToken)
      
      return NextResponse.json({ message: 'Logged out successfully' })
    } catch (error) {
      console.error('Error logging out user:', error)
      
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
        { error: 'Failed to logout user' },
        { status: 500 }
      )
    }
  }
}