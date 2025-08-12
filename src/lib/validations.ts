import { z } from 'zod'

export const userCreateSchema = z.object({
  email: z.string().email('Email deve ter um formato válido'),
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  passwordHash: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'manager', 'tester', 'guest']).default('tester'),
  isActive: z.boolean().default(true),
})

export const userUpdateSchema = z.object({
  email: z.string().email('Email deve ter um formato válido').optional(),
  fullName: z.string().min(1, 'Nome completo é obrigatório').optional(),
  passwordHash: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  role: z.enum(['admin', 'manager', 'tester', 'guest']).optional(),
  isActive: z.boolean().optional(),
})

// Validações de autenticação
export const registerSchema = z.object({
  email: z.string().email('Email deve ter um formato válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(2, 'Nome completo deve ter pelo menos 2 caracteres'),
})

export const signinSchema = z.object({
  email: z.string().email('Email deve ter um formato válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

// Validações de projetos
export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Nome do projeto é obrigatório'),
  description: z.string().optional(),
})

export const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Nome do projeto é obrigatório').optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'completed']).optional(),
})

export const projectMemberSchema = z.object({
  userId: z.number().int().positive('ID do usuário deve ser um número positivo'),
  role: z.enum(['admin', 'manager', 'tester']).default('tester'),
})

export const projectMemberUpdateSchema = z.object({
  role: z.enum(['admin', 'manager', 'tester']),
})

// Validações de suites de teste
export const suiteCreateSchema = z.object({
  name: z.string().min(1, 'Nome da suite é obrigatório'),
  description: z.string().optional(),
  projectId: z.number().int().positive('ID do projeto deve ser um número positivo'),
  parentId: z.number().int().positive('ID do parent deve ser um número positivo').optional(),
  suiteOrder: z.number().int().min(0, 'Ordem deve ser um número não negativo').default(0),
})

export const suiteUpdateSchema = z.object({
  name: z.string().min(1, 'Nome da suite é obrigatório').optional(),
  description: z.string().optional(),
  suiteOrder: z.number().int().min(0, 'Ordem deve ser um número não negativo').optional(),
})

export const suiteMoveSchema = z.object({
  newParentId: z.number().int().positive('ID do novo parent deve ser um número positivo').nullable().optional(),
  newOrder: z.number().int().min(0, 'Nova ordem deve ser um número não negativo').optional(),
})

// Tipos inferidos
export type UserCreate = z.infer<typeof userCreateSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type SigninData = z.infer<typeof signinSchema>
export type RefreshTokenData = z.infer<typeof refreshTokenSchema>
export type ProjectCreate = z.infer<typeof projectCreateSchema>
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>
export type ProjectMember = z.infer<typeof projectMemberSchema>
export type ProjectMemberUpdate = z.infer<typeof projectMemberUpdateSchema>
export type SuiteCreate = z.infer<typeof suiteCreateSchema>
export type SuiteUpdate = z.infer<typeof suiteUpdateSchema>
export type SuiteMove = z.infer<typeof suiteMoveSchema>