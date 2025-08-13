import { ScenarioCreate, ScenarioUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { SuiteService } from '../suites/suite.service'

export class CenarioService {
  static async getScenarioById(id: number) {
    return await prisma.testScenario.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, email: true, fullName: true, role: true },
        },
        assignee: {
          select: { id: true, email: true, fullName: true, role: true },
        },
        suite: {
          select: { id: true, name: true, projectId: true },
        },
        executions: {
          select: {
            id: true,
            executionRound: true,
            status: true,
            createdAt: true,
            completedAt: true,
            executor: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { executionRound: 'desc' },
        },
        _count: {
          select: { executions: true },
        },
      },
    })
  }

  static async getSuiteScenarios(suiteId: number, userId: number) {
    const { hasAccess } = await SuiteService.validateSuiteAccess(
      suiteId,
      userId
    )
    if (!hasAccess) {
      throw new Error(
        'Voc� n�o tem permiss�o para acessar os cen�rios desta suite'
      )
    }

    const scenarios = await prisma.testScenario.findMany({
      where: { suiteId },
      include: {
        creator: {
          select: { id: true, email: true, fullName: true },
        },
        assignee: {
          select: { id: true, email: true, fullName: true },
        },
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { scenarioOrder: 'asc' },
    })

    return {
      scenarios,
      total: scenarios.length,
      suiteId,
    }
  }

  static async createScenario(data: ScenarioCreate, userId: number) {
    const { hasAccess } = await SuiteService.validateSuiteAccess(
      data.suiteId,
      userId
    )
    if (!hasAccess) {
      throw new Error('Voc� n�o tem permiss�o para criar cen�rios nesta suite')
    }

    const suite = await prisma.testSuite.findUnique({
      where: { id: data.suiteId },
      select: { projectId: true },
    })

    if (!suite) {
      throw new Error('Suite n�o encontrada')
    }

    if (data.assignedTo) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assignedTo },
      })
      if (!assignedUser) {
        throw new Error('Usu�rio atribu�do n�o encontrado')
      }
    }

    const maxOrder = await prisma.testScenario.findFirst({
      where: { suiteId: data.suiteId },
      orderBy: { scenarioOrder: 'desc' },
      select: { scenarioOrder: true },
    })

    const scenarioOrder =
      data.scenarioOrder || (maxOrder?.scenarioOrder || 0) + 1

    const scenario = await prisma.testScenario.create({
      data: {
        name: data.name,
        suiteId: data.suiteId,
        preconditions: data.preconditions,
        steps: data.steps,
        expectedResult: data.expectedResult,
        assignedTo: data.assignedTo,
        priority: data.priority,
        scenarioOrder,
        createdBy: userId,
        status: 'pending',
      },
    })

    return await this.getScenarioById(scenario.id)
  }

  static async updateScenario(
    id: number,
    data: ScenarioUpdate,
    userId: number
  ) {
    const scenario = await this.getScenarioById(id)
    if (!scenario) {
      throw new Error('Cen�rio n�o encontrado')
    }

    const { hasAccess } = await SuiteService.validateSuiteAccess(
      scenario.suiteId,
      userId
    )
    if (!hasAccess) {
      throw new Error('Voc� n�o tem permiss�o para editar este cen�rio')
    }

    if (data.assignedTo) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assignedTo },
      })
      if (!assignedUser) {
        throw new Error('Usu�rio atribu�do n�o encontrado')
      }
    }

    const updatedScenario = await prisma.testScenario.update({
      where: { id },
      data: {
        name: data.name,
        preconditions: data.preconditions,
        steps: data.steps,
        expectedResult: data.expectedResult,
        assignedTo: data.assignedTo,
        priority: data.priority,
        status: data.status,
        scenarioOrder: data.scenarioOrder,
        updatedAt: new Date(),
      },
    })

    return await this.getScenarioById(updatedScenario.id)
  }

  static async deleteScenario(id: number, userId: number) {
    const scenario = await this.getScenarioById(id)
    if (!scenario) {
      throw new Error('Cen�rio n�o encontrado')
    }

    const { hasAccess } = await SuiteService.validateSuiteAccess(
      scenario.suiteId,
      userId
    )
    if (!hasAccess) {
      throw new Error('Voc� n�o tem permiss�o para excluir este cen�rio')
    }

    const hasExecutions = await prisma.testExecution.count({
      where: { scenarioId: id },
    })

    if (hasExecutions > 0) {
      throw new Error(
        'N�o � poss�vel excluir um cen�rio que possui execu��es. Para manter o hist�rico, altere o status para "blocked" ou "completed".'
      )
    }

    return await prisma.testScenario.delete({
      where: { id },
    })
  }

  static async getScenarioStats(scenarioId: number, userId: number) {
    const scenario = await this.getScenarioById(scenarioId)
    if (!scenario) {
      throw new Error('Cen�rio n�o encontrado')
    }

    const { hasAccess } = await SuiteService.validateSuiteAccess(
      scenario.suiteId,
      userId
    )
    if (!hasAccess) {
      throw new Error('Voc� n�o tem permiss�o para acessar este cen�rio')
    }

    const executions = await prisma.testExecution.findMany({
      where: { scenarioId },
      select: {
        status: true,
        executionRound: true,
        createdAt: true,
        completedAt: true,
      },
    })

    const stats = {
      totalExecutions: executions.length,
      lastExecution: executions[0] || null,
      statusCount: {
        pending: executions.filter((e) => e.status === 'pending').length,
        running: executions.filter((e) => e.status === 'running').length,
        passed: executions.filter((e) => e.status === 'passed').length,
        failed: executions.filter((e) => e.status === 'failed').length,
        blocked: executions.filter((e) => e.status === 'blocked').length,
      },
      maxExecutionRound: Math.max(
        ...executions.map((e) => e.executionRound),
        0
      ),
      avgExecutionTime: this.calculateAvgExecutionTime(executions),
    }

    return stats
  }

  private static calculateAvgExecutionTime(executions: any[]): number {
    const completedExecutions = executions.filter(
      (e) => e.completedAt && e.createdAt
    )
    if (completedExecutions.length === 0) return 0

    const totalTime = completedExecutions.reduce((sum, execution) => {
      const duration =
        new Date(execution.completedAt).getTime() -
        new Date(execution.createdAt).getTime()
      return sum + duration
    }, 0)

    return Math.round(totalTime / completedExecutions.length / 1000 / 60) // em minutos
  }

  static async duplicateScenario(id: number, userId: number) {
    const originalScenario = await this.getScenarioById(id)
    if (!originalScenario) {
      throw new Error('Cen�rio n�o encontrado')
    }

    const { hasAccess } = await SuiteService.validateSuiteAccess(
      originalScenario.suiteId,
      userId
    )
    if (!hasAccess) {
      throw new Error('Voc� n�o tem permiss�o para duplicar este cen�rio')
    }

    // Validar e garantir que priority seja um valor v�lido
    const validPriorities = ['low', 'medium', 'high', 'critical'] as const
    const priority = validPriorities.includes(originalScenario.priority as any) 
      ? (originalScenario.priority as 'low' | 'medium' | 'high' | 'critical')
      : 'medium' // valor padr�o caso seja inv�lido

    const duplicateData: ScenarioCreate = {
      name: `${originalScenario.name} (C�pia)`,
      suiteId: originalScenario.suiteId,
      preconditions: originalScenario.preconditions,
      steps: originalScenario.steps,
      expectedResult: originalScenario.expectedResult,
      priority,
      assignedTo: originalScenario.assignedTo as number,
      scenarioOrder: originalScenario.scenarioOrder + 1,
    }

    return await this.createScenario(duplicateData, userId)
  }

  static async validateScenarioAccess(
    scenarioId: number,
    userId: number
  ): Promise<{ hasAccess: boolean; exists: boolean }> {
    const scenario = await prisma.testScenario.findUnique({
      where: { id: scenarioId },
      select: { suiteId: true },
    })

    if (!scenario) {
      return { hasAccess: false, exists: false }
    }

    const { hasAccess } = await SuiteService.validateSuiteAccess(
      scenario.suiteId,
      userId
    )
    return { hasAccess, exists: true }
  }
}
