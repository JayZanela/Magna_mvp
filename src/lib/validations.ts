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

export type UserCreate = z.infer<typeof userCreateSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>