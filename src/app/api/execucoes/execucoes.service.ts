import { ExecutionCreate, ExecutionUpdate, ExecutionStart } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { CenarioService } from '../cenarios/cenarios.service'

export class ExecutionService {
  static async getExecutionById(id: number) {
    return await prisma.testExecution.findUnique({
      where: { id },
      include: {
        executor: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        scenario: {
          select: { id: true, name: true, suiteId: true, suite: { select: { projectId: true } } }
        },
        attachments: {
          include: {
            uploader: {
              select: { id: true, fullName: true }
            }
          },
          orderBy: { uploadedAt: 'desc' }
        },
        comments: {
          include: {
            user: {
              select: { id: true, fullName: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { attachments: true, comments: true }
        }
      }
    })
  }

  static async getScenarioExecutions(scenarioId: number, userId: number) {
    const { hasAccess } = await CenarioService.validateScenarioAccess(scenarioId, userId)
    if (!hasAccess) {
      throw new Error('Você não tem permissão para acessar as execuções deste cenário')
    }

    const executions = await prisma.testExecution.findMany({
      where: { scenarioId },
      include: {
        executor: {
          select: { id: true, fullName: true }
        },
        _count: {
          select: { attachments: true, comments: true }
        }
      },
      orderBy: [
        { executionRound: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return {
      executions,
      total: executions.length,
      scenarioId,
      latestRound: executions[0]?.executionRound || 0
    }
  }

  static async startExecution(data: ExecutionStart, userId: number) {
    const { hasAccess } = await CenarioService.validateScenarioAccess(data.scenarioId, userId)
    if (!hasAccess) {
      throw new Error('Você não tem permissão para executar este cenário')
    }

    const scenario = await prisma.testScenario.findUnique({
      where: { id: data.scenarioId }
    })

    if (!scenario) {
      throw new Error('Cenário não encontrado')
    }

    const lastExecution = await prisma.testExecution.findFirst({
      where: { scenarioId: data.scenarioId },
      orderBy: { executionRound: 'desc' }
    })

    const nextRound = (lastExecution?.executionRound || 0) + 1

    const execution = await prisma.testExecution.create({
      data: {
        scenarioId: data.scenarioId,
        executorId: userId,
        executionRound: nextRound,
        status: 'running',
        testData: data.testData,
        startedAt: new Date(),
        notes: `Execução iniciada automaticamente (Rodada ${nextRound})`
      }
    })

    await prisma.testScenario.update({
      where: { id: data.scenarioId },
      data: { 
        status: 'in_progress',
        updatedAt: new Date()
      }
    })

    return await this.getExecutionById(execution.id)
  }

  static async updateExecution(id: number, data: ExecutionUpdate, userId: number) {
    const execution = await this.getExecutionById(id)
    if (!execution) {
      throw new Error('Execução não encontrada')
    }

    const { hasAccess } = await CenarioService.validateScenarioAccess(execution.scenario.id, userId)
    if (!hasAccess) {
      throw new Error('Você não tem permissão para editar esta execução')
    }

    const updateData: any = {
      status: data.status,
      notes: data.notes,
      testData: data.testData,
    }

    if (data.status === 'passed' || data.status === 'failed' || data.status === 'blocked') {
      updateData.completedAt = new Date()
    }

    const updatedExecution = await prisma.testExecution.update({
      where: { id },
      data: updateData
    })

    await this.updateScenarioStatusBasedOnExecutions(execution.scenario.id)

    return await this.getExecutionById(updatedExecution.id)
  }

  private static async updateScenarioStatusBasedOnExecutions(scenarioId: number) {
    const latestExecution = await prisma.testExecution.findFirst({
      where: { scenarioId },
      orderBy: [
        { executionRound: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    if (!latestExecution) return

    let scenarioStatus = 'pending'

    switch (latestExecution.status) {
      case 'running':
        scenarioStatus = 'in_progress'
        break
      case 'passed':
        scenarioStatus = 'completed'
        break
      case 'failed':
      case 'blocked':
        const hasPassedExecution = await prisma.testExecution.findFirst({
          where: { scenarioId, status: 'passed' }
        })
        scenarioStatus = hasPassedExecution ? 'completed' : 'blocked'
        break
    }

    await prisma.testScenario.update({
      where: { id: scenarioId },
      data: { 
        status: scenarioStatus,
        updatedAt: new Date()
      }
    })
  }

  static async deleteExecution(id: number, userId: number) {
    const execution = await this.getExecutionById(id)
    if (!execution) {
      throw new Error('Execução não encontrada')
    }

    const { hasAccess } = await CenarioService.validateScenarioAccess(execution.scenario.id, userId)
    if (!hasAccess) {
      throw new Error('Você não tem permissão para excluir esta execução')
    }

    if (execution.status !== 'pending') {
      throw new Error('Só é possível excluir execuções com status "pending". Para manter o histórico, altere o status para "blocked".')
    }

    const hasComments = await prisma.executionComment.count({
      where: { executionId: id }
    })

    const hasAttachments = await prisma.attachment.count({
      where: { executionId: id }
    })

    if (hasComments > 0 || hasAttachments > 0) {
      throw new Error('Não é possível excluir uma execução que possui comentários ou anexos. Para manter o histórico, altere o status para "blocked".')
    }

    await prisma.testExecution.delete({
      where: { id }
    })

    await this.updateScenarioStatusBasedOnExecutions(execution.scenario.id)

    return { message: 'Execução excluída com sucesso' }
  }

  static async getExecutionHistory(scenarioId: number, userId: number) {
    const { hasAccess } = await CenarioService.validateScenarioAccess(scenarioId, userId)
    if (!hasAccess) {
      throw new Error('Você não tem permissão para acessar o histórico deste cenário')
    }

    const executions = await prisma.testExecution.findMany({
      where: { scenarioId },
      include: {
        executor: {
          select: { id: true, fullName: true }
        },
        _count: {
          select: { attachments: true, comments: true }
        }
      },
      orderBy: [
        { executionRound: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    const summary = {
      totalExecutions: executions.length,
      totalRounds: Math.max(...executions.map(e => e.executionRound), 0),
      statusDistribution: {
        pending: executions.filter(e => e.status === 'pending').length,
        running: executions.filter(e => e.status === 'running').length,
        passed: executions.filter(e => e.status === 'passed').length,
        failed: executions.filter(e => e.status === 'failed').length,
        blocked: executions.filter(e => e.status === 'blocked').length,
      },
      firstExecution: executions[0] || null,
      lastExecution: executions[executions.length - 1] || null,
    }

    return {
      executions,
      summary,
      scenarioId
    }
  }

  static async retryExecution(originalExecutionId: number, userId: number) {
    const originalExecution = await this.getExecutionById(originalExecutionId)
    if (!originalExecution) {
      throw new Error('Execução original não encontrada')
    }

    const { hasAccess } = await CenarioService.validateScenarioAccess(originalExecution.scenario.id, userId)
    if (!hasAccess) {
      throw new Error('Você não tem permissão para reexecutar este cenário')
    }

    const startData: ExecutionStart = {
      scenarioId: originalExecution.scenario.id,
      testData: originalExecution.testData || undefined
    }

    const newExecution = await this.startExecution(startData, userId)

    await prisma.testExecution.update({
      where: { id: newExecution.id },
      data: {
        notes: `Reexecução baseada na execução #${originalExecution.executionRound}. ${originalExecution.notes || ''}`.trim()
      }
    })

    return newExecution
  }

  static async validateExecutionAccess(executionId: number, userId: number): Promise<{ hasAccess: boolean, exists: boolean }> {
    const execution = await prisma.testExecution.findUnique({
      where: { id: executionId },
      select: { scenarioId: true }
    })

    if (!execution) {
      return { hasAccess: false, exists: false }
    }

    const { hasAccess } = await CenarioService.validateScenarioAccess(execution.scenarioId, userId)
    return { hasAccess, exists: true }
  }
}