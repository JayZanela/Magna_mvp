import { NextRequest, NextResponse } from 'next/server'
import { CommentService } from './comentarios.service'
import { commentCreateSchema, commentUpdateSchema } from '@/lib/validations'
import { withAuth } from '@/lib/auth/middleware'

export class CommentController {
  static async createComment(request: NextRequest) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const body = await req.json()

        const validatedData = commentCreateSchema.parse(body)
        const comment = await CommentService.createComment(validatedData, user.id)

        return NextResponse.json(comment, { status: 201 })
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

  static async getCommentById(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const commentId = parseInt(params.id)

        if (isNaN(commentId)) {
          return NextResponse.json(
            { error: 'ID do comentário inválido' },
            { status: 400 }
          )
        }

        const { hasAccess, exists } = await CommentService.validateCommentAccess(commentId, user.id)
        
        if (!exists) {
          return NextResponse.json(
            { error: 'Comentário não encontrado' },
            { status: 404 }
          )
        }

        if (!hasAccess) {
          return NextResponse.json(
            { error: 'Você não tem permissão para acessar este comentário' },
            { status: 403 }
          )
        }

        const comment = await CommentService.getCommentById(commentId)
        return NextResponse.json(comment)
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    })(request)
  }

  static async updateComment(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const commentId = parseInt(params.id)
        const body = await req.json()

        if (isNaN(commentId)) {
          return NextResponse.json(
            { error: 'ID do comentário inválido' },
            { status: 400 }
          )
        }

        const validatedData = commentUpdateSchema.parse(body)
        const comment = await CommentService.updateComment(commentId, validatedData, user.id)

        return NextResponse.json(comment)
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
                          error.message.includes('não tem permissão') || error.message.includes('só pode') ? 403 :
                          error.message.includes('só podem ser') ? 400 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async deleteComment(request: NextRequest, { params }: { params: { id: string } }) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const commentId = parseInt(params.id)

        if (isNaN(commentId)) {
          return NextResponse.json(
            { error: 'ID do comentário inválido' },
            { status: 400 }
          )
        }

        const result = await CommentService.deleteComment(commentId, user.id)
        return NextResponse.json(result, { status: 200 })
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') || error.message.includes('só pode') ? 403 :
                          error.message.includes('só podem ser') ? 400 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getExecutionComments(request: NextRequest, { params }: { params: { id: string } }) {
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

        const result = await CommentService.getExecutionComments(executionId, user.id)
        return NextResponse.json(result)
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getUserComments(request: NextRequest) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const result = await CommentService.getCommentsByUser(user.id, user.id)
        return NextResponse.json(result)
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    })(request)
  }

  static async getExecutionCommentStats(request: NextRequest, { params }: { params: { id: string } }) {
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

        const stats = await CommentService.getExecutionCommentStats(executionId, user.id)
        return NextResponse.json(stats)
      } catch (error: any) {
        const statusCode = error.message.includes('não encontrad') || error.message.includes('não existe') ? 404 :
                          error.message.includes('não tem permissão') ? 403 : 500

        return NextResponse.json({ error: error.message }, { status: statusCode })
      }
    })(request)
  }

  static async getRecentComments(request: NextRequest) {
    return withAuth(async (req: NextRequest) => {
      try {
        const user = (req as any).user
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '10')

        if (limit > 50) {
          return NextResponse.json(
            { error: 'Limite máximo de 50 comentários por consulta' },
            { status: 400 }
          )
        }

        const result = await CommentService.getRecentComments(user.id, limit)
        return NextResponse.json(result)
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    })(request)
  }
}