import { NextRequest, NextResponse } from 'next/server'
import { CenarioService } from './cenarios.service'
import { scenarioCreateSchema, scenarioUpdateSchema } from '@/lib/validations'
import { withAuth } from '@/lib/auth/middleware'

export class CenarioController {
  static async createScenario(request: NextRequest) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const body = await req.json()

        const validatedData = scenarioCreateSchema.parse(body)
        const scenario = await CenarioService.createScenario(validatedData, user.id)

        return NextResponse.json(scenario, { status: 201 })
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

        const statusCode = error.message.includes('não encontrado') || 
                          error.message.includes('não encontrada') || 
                          error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') || 
                          error.message.includes('Você não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getScenarioById(request: NextRequest, { params }: { params: { id: string } }) {
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

        const { hasAccess, exists } = await CenarioService.validateScenarioAccess(scenarioId, user.id)
        
        if (!exists) {
          return NextResponse.json(
            { error: 'Cenário não encontrado' },
            { status: 404 }
          )
        }

        if (!hasAccess) {
          return NextResponse.json(
            { error: 'Você não tem permissão para acessar este cenário' },
            { status: 403 }
          )
        }

        const scenario = await CenarioService.getScenarioById(scenarioId)
        return NextResponse.json(scenario)
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    })(request)
  }

  static async updateScenario(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const scenarioId = parseInt(params.id)
        const body = await req.json()

        if (isNaN(scenarioId)) {
          return NextResponse.json(
            { error: 'ID do cenário inválido' },
            { status: 400 }
          )
        }

        const validatedData = scenarioUpdateSchema.parse(body)
        const scenario = await CenarioService.updateScenario(scenarioId, validatedData, user.id)

        return NextResponse.json(scenario)
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

        const statusCode = error.message.includes('não encontrado') || 
                          error.message.includes('não encontrada') || 
                          error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') || 
                          error.message.includes('Você não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async deleteScenario(request: NextRequest, { params }: { params: { id: string } }) {
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

        await CenarioService.deleteScenario(scenarioId, user.id)

        return NextResponse.json(
          { message: 'Cenário excluído com sucesso' },
          { status: 200 }
        )
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrado') || 
                          error.message.includes('não encontrada') || 
                          error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') || 
                          error.message.includes('Você não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getSuiteScenarios(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const suiteId = parseInt(params.id)

        if (isNaN(suiteId)) {
          return NextResponse.json(
            { error: 'ID da suite inválido' },
            { status: 400 }
          )
        }

        const result = await CenarioService.getSuiteScenarios(suiteId, user.id)
        return NextResponse.json(result)
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async duplicateScenario(request: NextRequest, { params }: { params: { id: string } }) {
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

        const scenario = await CenarioService.duplicateScenario(scenarioId, user.id)
        return NextResponse.json(scenario, { status: 201 })
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrado') || 
                          error.message.includes('não encontrada') || 
                          error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') || 
                          error.message.includes('Você não tem permissão') ? 403 : 400

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getScenarioStats(request: NextRequest, { params }: { params: { id: string } }) {
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

        const stats = await CenarioService.getScenarioStats(scenarioId, user.id)
        return NextResponse.json(stats)
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }
}