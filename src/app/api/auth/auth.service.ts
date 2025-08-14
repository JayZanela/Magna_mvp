import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { CompanyRegisterData, SigninData } from '@/lib/validations'
import { UserService } from '../users/user.service'
import { CompanyService } from '../companies/company.service'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { SecureCookies } from '@/lib/auth/cookies'

export class AuthService {
  // SUBFUNÇÕES
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } })
  }

  static async createRefreshToken(userId: number) {
    const token = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    return await prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    })
  }

  static generateTokens(userId: number, email: string, role: string) {
    // Gerar timestamp com milissegundos + nonce para garantir uniqueness
    const now = Date.now()
    const iat = Math.floor(now / 1000)
    const nonce = randomBytes(8).toString('hex') // 16 chars hex
    const jti = `${now}-${nonce}` // JWT ID único
    
    const accessToken = jwt.sign(
      { 
        userId, 
        email, 
        role, 
        iat,
        jti // JWT ID para garantir tokens únicos
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    return { accessToken }
  }

  // FUNÇÃO DE CADASTRO RÁPIDO DE EMPRESA
  static async registerCompany(data: CompanyRegisterData, response?: NextResponse) {
    // 1. Verificar se email já existe
    const existingUser = await UserService.getUserByEmail(data.adminEmail)
    if (existingUser) {
      throw new Error('Este email já está em uso')
    }

    // 2. Criar empresa com dados mínimos
    const company = await CompanyService.createCompany({
      name: data.companyName,
      tradingName: data.tradingName,
      businessType: data.businessType,
      industry: data.industry,
      city: data.city,
      state: data.state,
      // Valores padrão generosos para trial
      maxProjects: 5,
      maxUsers: 15,
      maxStorageGb: 10,
      planType: 'trial',
      country: 'BR',
      billingDay: 1,
      paymentMethod: 'credit_card',
    })

    // 3. Criar primeiro usuário como admin
    const hashedPassword = await bcrypt.hash(data.adminPassword, 12)

    const user = await prisma.user.create({
      data: {
        email: data.adminEmail,
        fullName: data.adminName,
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
        companyId: company.id,
      },
    })

    // 4. Atualizar empresa com o criador
    await prisma.company.update({
      where: { id: company.id },
      data: { createdBy: user.id }
    })

    // 5. Gerar tokens e definir cookies seguros
    const { accessToken } = this.generateTokens(user.id, user.email, user.role)
    const refreshTokenRecord = await this.createRefreshToken(user.id)

    // Definir cookies seguros se response for fornecido
    if (response) {
      SecureCookies.setAccessToken(response, accessToken)
      SecureCookies.setRefreshToken(response, refreshTokenRecord.token)
    }

    return {
      success: true,
      message: 'Company registered successfully'
    }
  }

  static async signin(data: SigninData, response?: NextResponse) {
    const user = await UserService.getUserByEmail(data.email)
    if (!user) {
      throw new Error('Email ou senha inválidos')
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    )
    if (!isValidPassword) {
      throw new Error('Email ou senha inválidos')
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const { accessToken } = this.generateTokens(user.id, user.email, user.role)
    const refreshTokenRecord = await this.createRefreshToken(user.id)

    // Definir cookies seguros se response for fornecido
    if (response) {
      SecureCookies.setAccessToken(response, accessToken)
      SecureCookies.setRefreshToken(response, refreshTokenRecord.token)
    }

    return {
      success: true,
      message: 'Login successful'
    }
  }

  static async refreshAccessToken(refreshToken?: string, response?: NextResponse) {
    try {
      // Se não recebeu o token, tentar pegar dos cookies
      const tokenToUse = refreshToken || SecureCookies.getRefreshToken()
      
      if (!tokenToUse) {
        throw new Error('INVALID_REFRESH_TOKEN')
      }

      // PRIMEIRO: Validar se token existe no banco (previne timing attacks)
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: { token: tokenToUse },
      })

      if (!tokenRecord) {
        console.warn(`[SECURITY] Tentativa de refresh com token inexistente: ${tokenToUse.substring(0, 10)}...`)
        throw new Error('INVALID_REFRESH_TOKEN')
      }

      if (tokenRecord.expiresAt < new Date()) {
        console.warn(`[SECURITY] Tentativa de refresh com token expirado: ${tokenToUse.substring(0, 10)}...`)
        // Limpar token expirado
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })
        throw new Error('EXPIRED_REFRESH_TOKEN')
      }

      // SEGUNDO: Verificar JWT apenas após validar DB
      let payload: any
      try {
        payload = jwt.verify(tokenToUse, process.env.JWT_REFRESH_SECRET!) as any
      } catch (jwtError) {
        console.warn(`[SECURITY] JWT inválido para token no banco: ${tokenToUse.substring(0, 10)}...`)
        // Token no banco mas JWT inválido - possível comprometimento
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })
        throw new Error('CORRUPTED_REFRESH_TOKEN')
      }

      // Validar se userId do token e JWT coincidem
      if (tokenRecord.userId !== payload.userId) {
        console.error(`[SECURITY] ALERTA: userId mismatch! DB: ${tokenRecord.userId}, JWT: ${payload.userId}`)
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })
        throw new Error('TOKEN_MISMATCH')
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user || !user.isActive) {
        console.warn(`[SECURITY] Refresh para usuário inativo/inexistente: ${payload.userId}`)
        await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })
        throw new Error('USER_NOT_FOUND')
      }

      // TOKEN ROTATION: Invalidar token atual e criar novo
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })
      const newRefreshTokenRecord = await this.createRefreshToken(user.id)

      const { accessToken } = this.generateTokens(
        user.id,
        user.email,
        user.role
      )

      // Definir novos cookies seguros se response for fornecido
      if (response) {
        SecureCookies.setAccessToken(response, accessToken)
        SecureCookies.setRefreshToken(response, newRefreshTokenRecord.token)
      }

      console.info(`[AUTH] Token refresh realizado com sucesso para usuário ${user.id}`)
      
      return { 
        success: true,
        message: 'Token refreshed successfully'
      }
    } catch (error) {
      if (error instanceof Error && (error.message.startsWith('INVALID_') || 
          error.message.startsWith('EXPIRED_') || 
          error.message.startsWith('CORRUPTED_') ||
          error.message.startsWith('TOKEN_') ||
          error.message.startsWith('USER_'))) {
        throw error
      }
      console.error('[SECURITY] Erro inesperado no refresh:', error)
      throw new Error('REFRESH_ERROR')
    }
  }

  static async logout(refreshToken?: string, response?: NextResponse) {
    // Se não recebeu o token, tentar pegar dos cookies
    const tokenToUse = refreshToken || SecureCookies.getRefreshToken()
    
    if (!tokenToUse) {
      throw new Error('INVALID_LOGOUT_TOKEN')
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { token: tokenToUse },
    })

    if (!tokenRecord) {
      console.warn(`[SECURITY] Tentativa de logout com token inexistente: ${tokenToUse.substring(0, 10)}...`)
      throw new Error('INVALID_LOGOUT_TOKEN')
    }

    await prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    })

    // Limpar cookies se response for fornecido
    if (response) {
      SecureCookies.clearTokens(response)
    }

    console.info(`[AUTH] Logout realizado com sucesso para token ${tokenToUse.substring(0, 10)}...`)
  }
}
