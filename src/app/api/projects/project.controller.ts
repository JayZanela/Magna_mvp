import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from './project.service'
import { 
  projectCreateSchema, 
  projectUpdateSchema, 
  projectMemberSchema,
  projectMemberUpdateSchema 
} from '@/lib/validations'
import { z } from 'zod'

export class ProjectController {
  static async getProjects(request: NextRequest): Promise<NextResponse> {
    try {
      const user = (request as any).user
      const result = await ProjectService.getUserProjects(user.id)
      
      return NextResponse.json(result)
    } catch (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar projetos' },
        { status: 500 }
      )
    }
  }

  static async getProjectById(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID do projeto inválido' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      const project = await ProjectService.getProjectById(id)
      
      if (!project) {
        return NextResponse.json(
          { error: 'Projeto não encontrado' },
          { status: 404 }
        )
      }

      const hasAccess = await ProjectService.userHasProjectAccess(id, user.id)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Você não tem permissão para acessar este projeto' },
          { status: 403 }
        )
      }

      return NextResponse.json(project)
    } catch (error) {
      console.error('Error fetching project:', error)
      return NextResponse.json(
        { error: 'Falha ao buscar projeto' },
        { status: 500 }
      )
    }
  }

  static async createProject(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = projectCreateSchema.parse(body)
      const user = (request as any).user
      
      const project = await ProjectService.createProject(validatedData, user.id)
      
      return NextResponse.json(project, { status: 201 })
    } catch (error) {
      console.error('Error creating project:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
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
        { error: 'Falha ao criar projeto' },
        { status: 500 }
      )
    }
  }

  static async updateProject(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID do projeto inválido' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = projectUpdateSchema.parse(body)
      const user = (request as any).user
      
      const project = await ProjectService.updateProject(id, validatedData, user.id)
      
      return NextResponse.json(project)
    } catch (error) {
      console.error('Error updating project:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('proprietário')) {
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
        { error: 'Falha ao atualizar projeto' },
        { status: 500 }
      )
    }
  }

  static async deleteProject(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID do projeto inválido' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      await ProjectService.deleteProject(id, user.id)
      
      return NextResponse.json({ message: 'Projeto excluído com sucesso' })
    } catch (error) {
      console.error('Error deleting project:', error)

      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('proprietário')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        if (error.message.includes('suítes de teste')) {
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
        { error: 'Falha ao excluir projeto' },
        { status: 500 }
      )
    }
  }

  static async getProjectMembers(projectId: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!projectId || isNaN(projectId)) {
        return NextResponse.json(
          { error: 'ID do projeto inválido' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      const members = await ProjectService.getProjectMembers(projectId, user.id)
      
      return NextResponse.json(members)
    } catch (error) {
      console.error('Error fetching project members:', error)

      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
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
        { error: 'Falha ao buscar membros do projeto' },
        { status: 500 }
      )
    }
  }

  static async addProjectMember(projectId: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!projectId || isNaN(projectId)) {
        return NextResponse.json(
          { error: 'ID do projeto inválido' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = projectMemberSchema.parse(body)
      const user = (request as any).user
      
      const member = await ProjectService.addMember(projectId, validatedData, user.id)
      
      return NextResponse.json(member, { status: 201 })
    } catch (error) {
      console.error('Error adding project member:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('proprietário')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          )
        }
        if (error.message.includes('já é membro')) {
          return NextResponse.json(
            { error: error.message },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Falha ao adicionar membro ao projeto' },
        { status: 500 }
      )
    }
  }

  static async updateProjectMember(projectId: number, memberId: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!projectId || isNaN(projectId) || !memberId || isNaN(memberId)) {
        return NextResponse.json(
          { error: 'IDs inválidos' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = projectMemberUpdateSchema.parse(body)
      const user = (request as any).user
      
      const member = await ProjectService.updateMemberRole(projectId, memberId, validatedData, user.id)
      
      return NextResponse.json(member)
    } catch (error) {
      console.error('Error updating project member:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('proprietário') || error.message.includes('próprio role')) {
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
        { error: 'Falha ao atualizar membro do projeto' },
        { status: 500 }
      )
    }
  }

  static async removeProjectMember(projectId: number, memberId: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!projectId || isNaN(projectId) || !memberId || isNaN(memberId)) {
        return NextResponse.json(
          { error: 'IDs inválidos' },
          { status: 400 }
        )
      }

      const user = (request as any).user
      await ProjectService.removeMember(projectId, memberId, user.id)
      
      return NextResponse.json({ message: 'Membro removido do projeto com sucesso' })
    } catch (error) {
      console.error('Error removing project member:', error)

      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          return NextResponse.json(
            { error: error.message },
            { status: 404 }
          )
        }
        if (error.message.includes('proprietário') || error.message.includes('remover a si mesmo')) {
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
        { error: 'Falha ao remover membro do projeto' },
        { status: 500 }
      )
    }
  }
}