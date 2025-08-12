import { NextRequest, NextResponse } from 'next/server'
import { SuiteService } from './suite.service'
import { 
  suiteCreateSchema, 
  suiteUpdateSchema, 
  suiteMoveSchema 
} from '@/lib/validations'
import { z } from 'zod'

export class SuiteController {
  static async getProjectSuites(projectId: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!projectId || isNaN(projectId)) {
        return NextResponse.json(
          { error: 'ID do projeto inválido' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      const suites = await SuiteService.getProjectSuites(projectId, user.id)
      
      return NextResponse.json({
        suites,
        total: suites.length,
        projectId
      })
    } catch (error) {
      console.error('Error fetching project suites:', error)

      if (error instanceof Error) {
        if (error.message.includes('permissão')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha ao buscar suites do projeto' },
        { status: 500 }
      )
    }
  }

  static async createSuite(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = suiteCreateSchema.parse(body)
      const user = (request as any).user
      
      const suite = await SuiteService.createSuite(validatedData, user.id)
      
      return NextResponse.json(suite, { status: 201 })
    } catch (error) {
      console.error('Error creating suite:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message.includes('permissão')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        if (error.message.includes('não encontrada') || error.message.includes('mesmo projeto')) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha ao criar suite' },
        { status: 500 }
      )
    }
  }

  static async getSuiteById(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID da suite inválido' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      const accessValidation = await SuiteService.validateSuiteAccess(id, user.id)
      
      if (!accessValidation.exists) {
        return NextResponse.json(
          { error: 'Suite não encontrada' },
          { status: 404 }
        )
      }
      
      if (!accessValidation.hasAccess) {
        return NextResponse.json(
          { error: 'Você não tem permissão para acessar esta suite' },
          { status: 403 }
        )
      }

      const suite = await SuiteService.getSuiteById(id)

      const breadcrumb = await SuiteService.getSuiteBreadcrumb(id)

      return NextResponse.json({
        ...suite,
        breadcrumb
      })
    } catch (error) {
      console.error('Error fetching suite:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar suite' },
        { status: 500 }
      )
    }
  }

  static async updateSuite(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID da suite inválido' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = suiteUpdateSchema.parse(body)
      const user = (request as any).user
      
      const suite = await SuiteService.updateSuite(id, validatedData, user.id)
      
      return NextResponse.json(suite)
    } catch (error) {
      console.error('Error updating suite:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message.includes('não encontrada')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('permissão')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha ao atualizar suite' },
        { status: 500 }
      )
    }
  }

  static async moveSuite(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID da suite inválido' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = suiteMoveSchema.parse(body)
      const user = (request as any).user
      
      const suite = await SuiteService.moveSuite(id, validatedData, user.id)
      
      return NextResponse.json(suite)
    } catch (error) {
      console.error('Error moving suite:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message.includes('não encontrada')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('permissão')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        if (error.message.includes('ciclo')) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha ao mover suite' },
        { status: 500 }
      )
    }
  }

  static async deleteSuite(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID da suite inválido' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      await SuiteService.deleteSuite(id, user.id)
      
      return NextResponse.json({ message: 'Suite excluída com sucesso' })
    } catch (error) {
      console.error('Error deleting suite:', error)

      if (error instanceof Error) {
        if (error.message.includes('não encontrada')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('permissão')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        if (error.message.includes('cenários') || error.message.includes('subsuites')) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha ao excluir suite' },
        { status: 500 }
      )
    }
  }

  static async getSuiteChildren(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID da suite inválido' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      const accessValidation = await SuiteService.validateSuiteAccess(id, user.id)
      
      if (!accessValidation.exists) {
        return NextResponse.json(
          { error: 'Suite não encontrada' },
          { status: 404 }
        )
      }
      
      if (!accessValidation.hasAccess) {
        return NextResponse.json(
          { error: 'Você não tem permissão para acessar esta suite' },
          { status: 403 }
        )
      }

      const suite = await SuiteService.getSuiteById(id, true)

      return NextResponse.json({
        children: suite.children || [],
        total: suite.children?.length || 0
      })
    } catch (error) {
      console.error('Error fetching suite children:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar filhos da suite' },
        { status: 500 }
      )
    }
  }
}