# Instruções para Criação de Funcionalidades Backend

## Estrutura Padrão da API

### 1. Arquitetura em Camadas

```
src/app/api/[recurso]/
├── route.ts          # Rotas HTTP (GET, POST, PUT, DELETE)
├── [recurso].controller.ts  # Controllers com lógica de controle
└── [recurso].service.ts     # Services com regras de negócio
```

### 2. Estrutura de Tipagem

#### Validações (src/lib/validations.ts)
```typescript
import { z } from 'zod'

export const recursoCreateSchema = z.object({
  campo1: z.string().min(1, 'Mensagem de erro'),
  campo2: z.string().email('Email deve ter um formato válido'),
  campo3: z.enum(['valor1', 'valor2', 'valor3']).default('valor1'),
  campo4: z.boolean().default(true),
})

export const recursoUpdateSchema = z.object({
  campo1: z.string().min(1, 'Mensagem de erro').optional(),
  campo2: z.string().email('Email deve ter um formato válido').optional(),
  campo3: z.enum(['valor1', 'valor2', 'valor3']).optional(),
  campo4: z.boolean().optional(),
})

export type RecursoCreate = z.infer<typeof recursoCreateSchema>
export type RecursoUpdate = z.infer<typeof recursoUpdateSchema>
```

#### Modelos (src/lib/database/models.ts)
```typescript
export interface Recurso {
  id: number
  campo1: string
  campo2: string
  campo3: 'valor1' | 'valor2' | 'valor3'
  campo4: boolean
  createdAt: Date
  updatedAt: Date
}

export const RecursoModel = new DatabaseOperations<Recurso>('recurso')
```

### 3. Estrutura do Service

#### Ordem das Funções:
1. **Subfunções auxiliares** (funções privadas/internas)
2. **Funções core** (funções principais usadas externamente)

```typescript
import { RecursoCreate, RecursoUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'

export class RecursoService {
  // 1. SUBFUNÇÕES - Funções auxiliares (vêm primeiro)
  static async getRecursoById(id: number) {
    return await prisma.recurso.findUnique({ where: { id: id } })
  }

  static async getRecursoByEmail(email: string) {
    return await prisma.recurso.findUnique({ where: { email: email } })
  }

  static async getRecursosCount(): Promise<number> {
    return await prisma.recurso.count()
  }

  // 2. FUNÇÕES CORE - Funções principais (vêm depois)
  static async getAllRecursos() {
    const execFindAll = await prisma.recurso.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const execCountFind = await this.getRecursosCount()

    return {
      execFindAll,
      execCountFind,
    }
  }

  static async createRecurso(data: RecursoCreate) {
    // Validações de negócio
    const existingRecurso = await this.getRecursoByEmail(data.email)
    if (existingRecurso) {
      throw new Error('Recurso with this email already exists')
    }
    
    // Preparar dados para criação
    const dataCreate = {
      campo1: data.campo1,
      campo2: data.campo2,
      campo3: data.campo3,
      campo4: data.campo4,
    }
    
    return await prisma.recurso.create({ data: dataCreate })
  }

  static async updateRecurso(id: number, data: RecursoUpdate) {
    const existingRecurso = await this.getRecursoById(id)
    if (!existingRecurso) {
      throw new Error('Recurso not found')
    }

    // Validações específicas
    if (data.campo2 && data.campo2 !== existingRecurso.campo2) {
      const emailExists = await this.getRecursoByEmail(data.campo2)
      if (emailExists) {
        throw new Error('Email already in use')
      }
    }

    return await prisma.recurso.update({ where: { id: id }, data: data })
  }

  static async deleteRecurso(id: number) {
    const existingRecurso = await this.getRecursoById(id)
    if (!existingRecurso) {
      throw new Error('Recurso not found')
    }

    return await prisma.recurso.delete({ where: { id: id } })
  }
}
```

### 4. Estrutura do Controller

#### Padrão de Validação com Zod:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { RecursoService } from './recurso.service'
import { recursoCreateSchema, recursoUpdateSchema } from '@/lib/validations'
import { z } from 'zod'

export class RecursoController {
  static async getRecursos(): Promise<NextResponse> {
    try {
      const recursos = await RecursoService.getAllRecursos()
      return NextResponse.json(recursos)
    } catch (error) {
      console.error('Error fetching recursos:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recursos' },
        { status: 500 }
      )
    }
  }

  static async getRecursoById(id: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid recurso ID' },
          { status: 400 }
        )
      }

      const recurso = await RecursoService.getRecursoById(id)
      
      if (!recurso) {
        return NextResponse.json(
          { error: 'Recurso not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(recurso)
    } catch (error) {
      console.error('Error fetching recurso:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recurso' },
        { status: 500 }
      )
    }
  }

  static async createRecurso(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = recursoCreateSchema.parse(body)
      
      const recurso = await RecursoService.createRecurso(validatedData)
      
      return NextResponse.json(recurso, { status: 201 })
    } catch (error) {
      console.error('Error creating recurso:', error)
      
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
        { error: 'Failed to create recurso' },
        { status: 500 }
      )
    }
  }

  static async updateRecurso(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid recurso ID' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = recursoUpdateSchema.parse(body)
      
      const recurso = await RecursoService.updateRecurso(id, validatedData)
      
      return NextResponse.json(recurso)
    } catch (error) {
      console.error('Error updating recurso:', error)
      
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
        { error: 'Failed to update recurso' },
        { status: 500 }
      )
    }
  }

  static async deleteRecurso(id: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid recurso ID' },
          { status: 400 }
        )
      }

      const recurso = await RecursoService.deleteRecurso(id)
      
      return NextResponse.json(recurso)
    } catch (error) {
      console.error('Error deleting recurso:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to delete recurso' },
        { status: 500 }
      )
    }
  }
}
```

### 5. Estrutura de Rotas (route.ts)

```typescript
import { NextRequest } from 'next/server'
import { RecursoController } from './recurso.controller'

export async function GET() {
  return await RecursoController.getRecursos()
}

export async function POST(request: NextRequest) {
  return await RecursoController.createRecurso(request)
}
```

### 6. Regras Importantes

#### Validação:
- **SEMPRE** usar Zod para validação de dados
- Importar schemas do `@/lib/validations`
- Tratar erros de validação no controller
- Retornar detalhes dos erros para facilitar debug

#### Services:
- **Subfunções primeiro**: funções auxiliares/privadas
- **Funções core depois**: funções principais usadas externamente
- Validações de negócio no service
- Usar Prisma diretamente para operações de banco

#### Controllers:
- Validação de entrada com Zod
- Tratamento de erros específico (ZodError, Error genérico)
- Códigos HTTP apropriados (200, 201, 400, 404, 500)
- Logs de erro para debug

#### Tipos:
- Interface principal no `models.ts`
- Schemas de validação no `validations.ts`
- Types inferidos dos schemas Zod
- Usar enums para valores fixos