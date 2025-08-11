import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { RegisterData, SigninData } from '@/lib/validations'
import { UserService } from '../users/user.service'

export class AuthService {
  // SUBFUNÇÕES
  /*static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } })
  }*/

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
    const accessToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    return { accessToken }
  }

  // FUNÇÕES CORE
  static async register(data: RegisterData) {
    const existingUser = await UserService.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error('Email já está em uso')
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: hashedPassword,
        role: 'tester',
        isActive: true,
      },
    })

    const { accessToken } = this.generateTokens(user.id, user.email, user.role)
    const refreshTokenRecord = await this.createRefreshToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken: refreshTokenRecord.token,
    }
  }

  static async signin(data: SigninData) {
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

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken: refreshTokenRecord.token,
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any

      const tokenRecord = await prisma.refreshToken.findFirst({
        where: { token: refreshToken, userId: payload.userId },
      })

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new Error('Refresh token inválido ou expirado')
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      const { accessToken } = this.generateTokens(
        user.id,
        user.email,
        user.role
      )

      return { accessToken }
    } catch (error) {
      throw new Error('Refresh token inválido')
    }
  }

  static async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })
  }
}
