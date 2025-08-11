# Instruções MVP - Sistema de Autenticação

## 🎯 Escopo MVP - Apenas o Essencial

### Funcionalidades Core (4 endpoints):
1. **Register** - Registro de usuário
2. **Login** - Autenticação 
3. **Logout** - Encerrar sessão
4. **Refresh** - Renovar token

### Segurança Básica:
- **Middleware de autenticação** (obrigatório)
- **Rate limiting** simples e efetivo
- **Hash de senhas** com bcrypt

---

## 📦 Dependências Necessárias

```bash
npm install bcryptjs jsonwebtoken cookie
npm install -D @types/bcryptjs @types/jsonwebtoken @types/cookie
```

---

## 🔐 Tecnologias Core

### 1. Hash de Senhas - bcrypt
```typescript
import bcrypt from 'bcryptjs'

// Hash (registro)
const hashedPassword = await bcrypt.hash(password, 12)

// Verificação (login)
const isValid = await bcrypt.compare(password, hashedPassword)
```

### 2. JWT - Access + Refresh Tokens
```typescript
import jwt from 'jsonwebtoken'

// Access Token (15 minutos)
const accessToken = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET!,
  { expiresIn: '15m' }
)

// Refresh Token (7 dias)
const refreshToken = jwt.sign(
  { userId, type: 'refresh' },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: '7d' }
)
```

---

## 📁 Estrutura da API /auth

```
src/app/api/auth/
├── register/route.ts     # POST - Criar conta
├── signin/route.ts       # POST - Fazer login
├── logout/route.ts       # POST - Fazer logout
└── refresh/route.ts      # POST - Renovar token
```

---

## 🛡️ Middleware de Autenticação (OBRIGATÓRIO)

### Localização: `src/lib/auth/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function withAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Extrair token do header Authorization
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      
      // Verificar token
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
      
      // Adicionar dados do usuário ao request
      (request as any).user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }
      
      return handler(request, context)
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
  }
}

// Uso nas rotas protegidas
export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest) => {
    // Sua lógica aqui - req.user está disponível
    const user = (req as any).user
    return NextResponse.json({ message: `Olá ${user.email}` })
  })(request)
}
```

---

## ⚡ Rate Limiting - Simples e Efetivo

### Localização: `src/lib/auth/rateLimit.ts`

```typescript
interface RateLimitEntry {
  count: number
  resetTime: number
  blockedUntil?: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(ip: string): { allowed: boolean, timeLeft?: number } {
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
```

---

## 📝 Validações Zod - MVP

### Adicionar ao `src/lib/validations.ts`:

```typescript
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres')
})

export const signinSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório')
})

export type RegisterData = z.infer<typeof registerSchema>
export type SigninData = z.infer<typeof signinSchema>
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>
```

---

## 🗄️ Modelo de Dados - Extensão Mínima

### Adicionar ao `src/lib/database/models.ts`:

```typescript
// Adicionar à interface User existente:
export interface User {
  // ... campos existentes
  lastLoginAt?: Date
}

// Nova interface para refresh tokens
export interface RefreshToken {
  id: number
  userId: number
  token: string
  expiresAt: Date
  createdAt: Date
}

// Novo modelo
export const RefreshTokenModel = new DatabaseOperations<RefreshToken>('refreshToken')
```

---

## 🚀 Estrutura dos Services

### 1. AuthService - `src/app/api/auth/auth.service.ts`

```typescript
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { RegisterData, SigninData } from '@/lib/validations'

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
      data: { userId, token, expiresAt }
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
    const existingUser = await this.getUserByEmail(data.email)
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
        isActive: true
      }
    })

    const { accessToken } = this.generateTokens(user.id, user.email, user.role)
    const refreshTokenRecord = await this.createRefreshToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      accessToken,
      refreshToken: refreshTokenRecord.token
    }
  }

  static async signin(data: SigninData) {
    const user = await this.getUserByEmail(data.email)
    if (!user) {
      throw new Error('Email ou senha inválidos')
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error('Email ou senha inválidos')
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const { accessToken } = this.generateTokens(user.id, user.email, user.role)
    const refreshTokenRecord = await this.createRefreshToken(user.id)

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      accessToken,
      refreshToken: refreshTokenRecord.token
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any
      
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: { token: refreshToken, userId: payload.userId }
      })

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new Error('Refresh token inválido ou expirado')
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      const { accessToken } = this.generateTokens(user.id, user.email, user.role)
      
      return { accessToken }
    } catch (error) {
      throw new Error('Refresh token inválido')
    }
  }

  static async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    })
  }
}
```

---

## 🔧 Variáveis de Ambiente

```env
# .env.local
JWT_SECRET=seu-jwt-secret-super-forte-aqui-com-pelo-menos-32-caracteres
JWT_REFRESH_SECRET=seu-refresh-secret-diferente-e-ainda-mais-forte
```

---

## 📋 Checklist de Implementação

### ✅ Preparação:
- [ ] Instalar dependências (bcryptjs, jsonwebtoken, cookie)
- [ ] Configurar variáveis de ambiente
- [ ] Atualizar modelo User com lastLoginAt
- [ ] Criar modelo RefreshToken no Prisma

### ✅ Core:
- [ ] Criar AuthService com as 4 funções principais
- [ ] Criar controllers para cada endpoint
- [ ] Implementar validações Zod
- [ ] Criar middleware de autenticação

### ✅ Segurança:
- [ ] Implementar rate limiting
- [ ] Testar bloqueio após 5 requests/min
- [ ] Validar tokens JWT
- [ ] Testar refresh de tokens

### ✅ Testes:
- [ ] Testar registro de usuário
- [ ] Testar login/logout
- [ ] Testar refresh token
- [ ] Testar rate limiting (5 req = bloqueio)

---

## 🎯 Resultado Final MVP

- ✅ **4 endpoints** funcionais e seguros
- ✅ **Middleware de auth** para proteger rotas
- ✅ **Rate limiting** agressivo (5 req/min = 5min bloqueado)
- ✅ **JWT** com refresh token
- ✅ **bcrypt** para senhas
- ✅ **Validações** com Zod
- ✅ **Seguindo arquitetura** do projeto (Service → Controller → Route)

**Simples, seguro e pronto para produção MVP!**