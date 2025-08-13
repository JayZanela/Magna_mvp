import { CommentCreate, CommentUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { ExecutionService } from '../execucoes/execucoes.service'

export class CommentService {
  static async getCommentById(id: number) {
    return await prisma.executionComment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true },
        },
        execution: {
          select: {
            id: true,
            executionRound: true,
            scenario: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })
  }

  static async getExecutionComments(executionId: number, userId: number) {
    const { hasAccess } = await ExecutionService.validateExecutionAccess(
      executionId,
      userId
    )
    if (!hasAccess) {
      throw new Error(
        'Você não tem permissão para acessar os comentários desta execução'
      )
    }

    const comments = await prisma.executionComment.findMany({
      where: { executionId },
      include: {
        user: {
          select: { id: true, fullName: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return {
      comments,
      total: comments.length,
      executionId,
    }
  }

  static async createComment(data: CommentCreate, userId: number) {
    const { hasAccess } = await ExecutionService.validateExecutionAccess(
      data.executionId,
      userId
    )
    if (!hasAccess) {
      throw new Error('Você não tem permissão para comentar nesta execução')
    }

    const execution = await prisma.testExecution.findUnique({
      where: { id: data.executionId },
      select: { id: true, status: true },
    })

    if (!execution) {
      throw new Error('Execução não encontrada')
    }

    const comment = await prisma.executionComment.create({
      data: {
        executionId: data.executionId,
        userId: userId,
        comment: data.comment,
        createdAt: new Date(),
      },
    })

    return await this.getCommentById(comment.id)
  }

  static async updateComment(id: number, data: CommentUpdate, userId: number) {
    const comment = await this.getCommentById(id)
    if (!comment) {
      throw new Error('Comentário não encontrado')
    }

    if (comment.user.id !== userId) {
      throw new Error('Você só pode editar seus próprios comentários')
    }

    const timeSinceCreation = Date.now() - new Date(comment.createdAt).getTime()
    const maxEditTime = 15 * 60 * 1000 // 15 minutos

    if (timeSinceCreation > maxEditTime) {
      throw new Error(
        'Comentários só podem ser editados nos primeiros 15 minutos após criação'
      )
    }

    const updatedComment = await prisma.executionComment.update({
      where: { id },
      data: {
        comment: data.comment,
      },
    })

    return await this.getCommentById(updatedComment.id)
  }

  static async deleteComment(id: number, userId: number) {
    const comment = await this.getCommentById(id)
    if (!comment) {
      throw new Error('Comentário não encontrado')
    }

    if (comment.user.id !== userId) {
      throw new Error('Você só pode excluir seus próprios comentários')
    }

    const timeSinceCreation = Date.now() - new Date(comment.createdAt).getTime()
    const maxDeleteTime = 30 * 60 * 1000 // 30 minutos

    if (timeSinceCreation > maxDeleteTime) {
      throw new Error(
        'Comentários só podem ser excluídos nos primeiros 30 minutos após criação'
      )
    }

    await prisma.executionComment.delete({
      where: { id },
    })

    return { message: 'Comentário excluído com sucesso' }
  }

  static async getCommentsByUser(userId: number, requesterId: number) {
    if (userId !== requesterId) {
      throw new Error('Você só pode visualizar seus próprios comentários')
    }

    const comments = await prisma.executionComment.findMany({
      where: { userId },
      include: {
        execution: {
          select: {
            id: true,
            executionRound: true,
            scenario: {
              select: {
                id: true,
                name: true,
                suite: {
                  select: {
                    name: true,
                    project: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      comments,
      total: comments.length,
      userId,
    }
  }

  static async getExecutionCommentStats(executionId: number, userId: number) {
    const { hasAccess } = await ExecutionService.validateExecutionAccess(
      executionId,
      userId
    )
    if (!hasAccess) {
      throw new Error(
        'Você não tem permissão para acessar estatísticas desta execução'
      )
    }

    const comments = await prisma.executionComment.findMany({
      where: { executionId },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
      },
    })

    const stats = {
      totalComments: comments.length,
      uniqueCommenters: [...new Set(comments.map((c) => c.user.id))].length,
      firstComment:
        comments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0] || null,
      lastComment:
        comments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0] || null,
      commentsByUser: comments.reduce((acc: any, comment) => {
        const userKey = comment.user.fullName
        acc[userKey] = (acc[userKey] || 0) + 1
        return acc
      }, {}),
      executionId,
    }

    return stats
  }

  static async getRecentComments(userId: number, limit: number = 10) {
    const comments = await prisma.executionComment.findMany({
      where: {
        execution: {
          scenario: {
            suite: {
              project: {
                OR: [{ ownerId: userId }, { members: { some: { userId } } }],
              },
            },
          },
        },
      },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
        execution: {
          select: {
            id: true,
            executionRound: true,
            scenario: {
              select: {
                id: true,
                name: true,
                suite: {
                  select: {
                    name: true,
                    project: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return {
      comments,
      total: comments.length,
      userId,
    }
  }

  static async validateCommentAccess(
    commentId: number,
    userId: number
  ): Promise<{ hasAccess: boolean; exists: boolean; isOwner: boolean }> {
    const comment = await prisma.executionComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        executionId: true,
      },
    })

    if (!comment) {
      return { hasAccess: false, exists: false, isOwner: false }
    }

    const { hasAccess } = await ExecutionService.validateExecutionAccess(
      comment.executionId,
      userId
    )
    const isOwner = comment.userId === userId

    return { hasAccess, exists: true, isOwner }
  }
}
