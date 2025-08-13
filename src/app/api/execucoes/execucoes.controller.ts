import { NextRequest, NextResponse } from 'next/server'
import { ExecutionService } from './execucoes.service'
import { executionUpdateSchema, executionStartSchema } from '@/lib/validations'
import { withAuth } from '@/lib/auth/middleware'

export class ExecutionController {
  static async startExecution(request: NextRequest) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const body = await req.json()

        const validatedData = executionStartSchema.parse(body)
        const execution = await ExecutionService.startExecution(validatedData, user.id)

        return NextResponse.json(execution, { status: 201 })
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return NextResponse.json(
            {
              error: 'Dados inválidos',
              details: error.errors.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
            { status: 400 }
          )
        }

        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getExecutionById(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const executionId = parseInt(params.id)

        if (isNaN(executionId)) {
          return NextResponse.json(
            { error: 'ID da execução inválido' },
            { status: 400 }
          )
        }

        const { hasAccess, exists } = await ExecutionService.validateExecutionAccess(executionId, user.id)
        
        if (!exists) {
          return NextResponse.json(
            { error: 'Execução não encontrada' },
            { status: 404 }
          )
        }

        if (!hasAccess) {
          return NextResponse.json(
            { error: 'Você não tem permissão para acessar esta execução' },
            { status: 403 }
          )
        }

        const execution = await ExecutionService.getExecutionById(executionId)
        return NextResponse.json(execution)
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    })(request)
  }

  static async updateExecution(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const executionId = parseInt(params.id)
        const body = await req.json()

        if (isNaN(executionId)) {
          return NextResponse.json(
            { error: 'ID da execução inválido' },
            { status: 400 }
          )
        }

        const validatedData = executionUpdateSchema.parse(body)
        const execution = await ExecutionService.updateExecution(executionId, validatedData, user.id)

        return NextResponse.json(execution)
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return NextResponse.json(
            {
              error: 'Dados inválidos',
              details: error.errors.map((err: any) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
            { status: 400 }
          )
        }

        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async deleteExecution(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const executionId = parseInt(params.id)

        if (isNaN(executionId)) {
          return NextResponse.json(
            { error: 'ID da execução inválido' },
            { status: 400 }
          )
        }

        const result = await ExecutionService.deleteExecution(executionId, user.id)
        return NextResponse.json(result, { status: 200 })
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getScenarioExecutions(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const scenarioId = parseInt(params.id)

        if (isNaN(scenarioId)) {
          return NextResponse.json(
            { error: 'ID do cenário inválido' },
            { status: 400 }
          )
        }

        const result = await ExecutionService.getScenarioExecutions(scenarioId, user.id)
        return NextResponse.json(result)
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getExecutionHistory(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const scenarioId = parseInt(params.id)

        if (isNaN(scenarioId)) {
          return NextResponse.json(
            { error: 'ID do cenário inválido' },
            { status: 400 }
          )
        }

        const result = await ExecutionService.getExecutionHistory(scenarioId, user.id)
        return NextResponse.json(result)
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async retryExecution(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const executionId = parseInt(params.id)

        if (isNaN(executionId)) {
          return NextResponse.json(
            { error: 'ID da execução inválido' },
            { status: 400 }
          )
        }

        const execution = await ExecutionService.retryExecution(executionId, user.id)
        return NextResponse.json(execution, { status: 201 })
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }
}