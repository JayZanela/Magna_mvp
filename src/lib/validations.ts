import { string, z } from 'zod'

export const userCreateSchema = z.object({
  email: z.string().email('Email deve ter um formato válido'),
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  passwordHash: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'manager', 'tester', 'guest']).default('tester'),
  isActive: z.boolean().default(true),
  companyId: z.number().int().positive('ID da empresa deve ser um número positivo'),
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
  companyId: z.number().int().positive('ID da empresa deve ser um número positivo').optional(),
})

// Validação para cadastro rápido de empresa + primeiro usuário
export const companyRegisterSchema = z.object({
  // Dados da empresa (mínimo necessário)
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  businessType: z.enum(['software_house', 'tech_department', 'consultancy', 'other']).default('tech_department'),
  
  // Dados do primeiro usuário (admin)
  adminName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  adminEmail: z.string().email('Email deve ter um formato válido'),
  adminPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  
  // Campos opcionais para empresa
  tradingName: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
})

// Validação simples para login
export const signinSchema = z.object({
  email: z.string().email('Email deve ter um formato válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

// Validações de empresas - Versão simplificada para cadastro rápido
export const companyCreateSchema = z.object({
  name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  tradingName: z.string().optional(),
  businessType: z.enum(['software_house', 'tech_department', 'consultancy', 'other']).default('tech_department'),
  // Campos opcionais que podem ser preenchidos depois
  industry: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipcode: z.string().optional(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  subdomain: z.string().optional(),
  // Configurações com valores padrão adequados
  maxProjects: z.number().int().min(1).default(5),
  maxUsers: z.number().int().min(1).default(15),
  maxStorageGb: z.number().int().min(1).default(10),
  planType: z.enum(['trial', 'basic', 'professional', 'enterprise']).default('trial'),
  country: z.string().max(2).default('BR'),
  billingDay: z.number().int().min(1).max(28).default(1),
  paymentMethod: z.enum(['credit_card', 'bank_slip', 'pix']).default('credit_card'),
})

export const companyUpdateSchema = z.object({
  name: z.string().min(1, 'Razão social é obrigatória').optional(),
  tradingName: z.string().optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve estar no formato 00.000.000/0000-00').optional(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00').optional(),
  industry: z.string().optional(),
  businessType: z.enum(['software_house', 'tech_department', 'consultancy', 'other']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2, 'Estado deve ter no máximo 2 caracteres').optional(),
  zipcode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000').optional(),
  country: z.string().max(2, 'País deve ter 2 caracteres').optional(),
  subdomain: z.string().min(3, 'Subdomínio deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras minúsculas, números e hífens').optional(),
  isActive: z.boolean().optional(),
  trialExpiresAt: z.date().optional(),
  maxProjects: z.number().int().min(1, 'Limite de projetos deve ser pelo menos 1').optional(),
  maxUsers: z.number().int().min(1, 'Limite de usuários deve ser pelo menos 1').optional(),
  maxStorageGb: z.number().int().min(1, 'Limite de armazenamento deve ser pelo menos 1GB').optional(),
  planType: z.enum(['trial', 'basic', 'professional', 'enterprise']).optional(),
  monthlyValue: z.number().min(0, 'Valor mensal deve ser positivo').optional(),
  billingDay: z.number().int().min(1).max(28, 'Dia de vencimento deve estar entre 1 e 28').optional(),
  paymentMethod: z.enum(['credit_card', 'bank_slip', 'pix']).optional(),
  salesContact: z.string().optional(),
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
export type CompanyRegisterData = z.infer<typeof companyRegisterSchema>
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
export type CompanyCreate = z.infer<typeof companyCreateSchema>
export type CompanyUpdate = z.infer<typeof companyUpdateSchema>
