import { string, z } from 'zod'

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
  passwordHash: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .optional(),
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
  userId: z
    .number()
    .int()
    .positive('ID do usuário deve ser um número positivo'),
  role: z.enum(['admin', 'manager', 'tester']).default('tester'),
})

export const projectMemberUpdateSchema = z.object({
  role: z.enum(['admin', 'manager', 'tester']),
})

// Validações de suites de teste
export const suiteCreateSchema = z.object({
  name: z.string().min(1, 'Nome da suite é obrigatório'),
  description: z.string().optional(),
  projectId: z
    .number()
    .int()
    .positive('ID do projeto deve ser um número positivo'),
  parentId: z
    .number()
    .int()
    .positive('ID do parent deve ser um número positivo')
    .optional(),
  suiteOrder: z
    .number()
    .int()
    .min(0, 'Ordem deve ser um número não negativo')
    .default(0),
})

export const suiteUpdateSchema = z.object({
  name: z.string().min(1, 'Nome da suite é obrigatório').optional(),
  description: z.string().optional(),
  suiteOrder: z
    .number()
    .int()
    .min(0, 'Ordem deve ser um número não negativo')
    .optional(),
})

export const suiteMoveSchema = z.object({
  newParentId: z
    .number()
    .int()
    .positive('ID do novo parent deve ser um número positivo')
    .nullable()
    .optional(),
  newOrder: z
    .number()
    .int()
    .min(0, 'Nova ordem deve ser um número não negativo')
    .optional(),
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

// Validações de cenários de teste
export const scenarioCreateSchema = z.object({
  name: z.string().min(1, 'Nome do cenário é obrigatório'),
  suiteId: z.number().int().positive('ID da suite deve ser um número positivo'),
  preconditions: z.string().nullable(),
  steps: z.string().nullable(),
  expectedResult: z.string().nullable(),
  assignedTo: z
    .number()
    .int()
    .positive('ID do usuário deve ser um número positivo')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  scenarioOrder: z
    .number()
    .int()
    .min(0, 'Ordem deve ser um número não negativo')
    .default(0),
})

export const scenarioUpdateSchema = z.object({
  name: z.string().min(1, 'Nome do cenário é obrigatório').optional(),
  preconditions: z.string().optional(),
  steps: z.string().optional(),
  expectedResult: z.string().optional(),
  assignedTo: z
    .number()
    .int()
    .positive('ID do usuário deve ser um número positivo')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
  scenarioOrder: z
    .number()
    .int()
    .min(0, 'Ordem deve ser um número não negativo')
    .optional(),
})

// Validações de execuções de teste
export const executionCreateSchema = z.object({
  scenarioId: z
    .number()
    .int()
    .positive('ID do cenário deve ser um número positivo'),
  notes: z.string().optional(),
  testData: z.string().optional(),
})

export const executionUpdateSchema = z.object({
  status: z.enum(['pending', 'running', 'passed', 'failed', 'blocked']),
  notes: z.string().optional(),
  testData: z.string().optional(),
  completedAt: z.date().optional(),
})

export const executionStartSchema = z.object({
  scenarioId: z
    .number()
    .int()
    .positive('ID do cenário deve ser um número positivo'),
  testData: z.string().optional(),
})

// Validações de comentários
export const commentCreateSchema = z.object({
  executionId: z
    .number()
    .int()
    .positive('ID da execução deve ser um número positivo'),
  comment: z.string().min(1, 'Comentário não pode estar vazio'),
})

export const commentUpdateSchema = z.object({
  comment: z.string().min(1, 'Comentário não pode estar vazio'),
})

// Validações de anexos
export const attachmentCreateSchema = z.object({
  executionId: z
    .number()
    .int()
    .positive('ID da execução deve ser um número positivo'),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
  filePath: z.string().min(1, 'Caminho do arquivo é obrigatório'),
  fileType: z.string().optional(),
  fileSize: z
    .number()
    .int()
    .min(0, 'Tamanho do arquivo deve ser não negativo')
    .optional(),
})

// Tipos inferidos para as novas validações
export type ScenarioCreate = z.infer<typeof scenarioCreateSchema>
export type ScenarioUpdate = z.infer<typeof scenarioUpdateSchema>
export type ExecutionCreate = z.infer<typeof executionCreateSchema>
export type ExecutionUpdate = z.infer<typeof executionUpdateSchema>
export type ExecutionStart = z.infer<typeof executionStartSchema>
export type CommentCreate = z.infer<typeof commentCreateSchema>
export type CommentUpdate = z.infer<typeof commentUpdateSchema>
export type AttachmentCreate = z.infer<typeof attachmentCreateSchema>
