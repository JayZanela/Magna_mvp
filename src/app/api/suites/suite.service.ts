import { SuiteCreate, SuiteUpdate, SuiteMove } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { ProjectService } from '../projects/project.service'

interface SuiteWithHierarchy {
  id: number
  name: string
  description?: string | null
  projectId: number
  parentId?: number | null
  suiteOrder: number
  createdAt: Date
  children?: SuiteWithHierarchy[]
  scenarios?: any[]
  _count?: {
    children: number
    scenarios: number
  }
}

export class SuiteService {
  static async getSuiteById(id: number, includeChildren = true) {
    const include: any = {
      project: {
        select: { id: true, name: true, ownerId: true }
      },
      parent: {
        select: { id: true, name: true, parentId: true }
      },
      scenarios: {
        select: { id: true, name: true, status: true, priority: true }
      },
      _count: {
        select: { children: true, scenarios: true }
      }
    }

    if (includeChildren) {
      include.children = {
        include: {
          _count: { select: { children: true, scenarios: true } }
        },
        orderBy: { suiteOrder: 'asc' }
      }
    }

    return await prisma.testSuite.findUnique({
      where: { id },
      include
    })
  }

  static async getProjectSuites(projectId: number, userId: number) {
    const hasAccess = await ProjectService.userHasProjectAccess(projectId, userId)
    if (!hasAccess) {
      throw new Error('Você não tem permissão para acessar as suites deste projeto')
    }

    const suites = await prisma.testSuite.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { children: true, scenarios: true }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { suiteOrder: 'asc' }
      ]
    })

    return this.buildSuiteTree(suites)
  }

  static buildSuiteTree(suites: any[]): SuiteWithHierarchy[] {
    const suiteMap = new Map<number, SuiteWithHierarchy>()
    const rootSuites: SuiteWithHierarchy[] = []

    suites.forEach(suite => {
      suiteMap.set(suite.id, { ...suite, children: [] })
    })

    suites.forEach(suite => {
      const suiteNode = suiteMap.get(suite.id)!
      
      if (suite.parentId) {
        const parent = suiteMap.get(suite.parentId)
        if (parent) {
          parent.children!.push(suiteNode)
        }
      } else {
        rootSuites.push(suiteNode)
      }
    })

    return rootSuites
  }

  static async createSuite(data: SuiteCreate, userId: number) {
    const canEdit = await ProjectService.userCanEditProject(data.projectId, userId)
    if (!canEdit) {
      throw new Error('Você não tem permissão para criar suites neste projeto')
    }

    if (data.parentId) {
      const parentSuite = await this.getSuiteById(data.parentId, false)
      if (!parentSuite) {
        throw new Error('Suite pai não encontrada')
      }
      if (parentSuite.projectId !== data.projectId) {
        throw new Error('Suite pai deve pertencer ao mesmo projeto')
      }
    }

    const maxOrder = await prisma.testSuite.findFirst({
      where: { 
        projectId: data.projectId,
        parentId: data.parentId || null
      },
      orderBy: { suiteOrder: 'desc' },
      select: { suiteOrder: true }
    })

    const suiteOrder = data.suiteOrder || (maxOrder?.suiteOrder || 0) + 1

    const suite = await prisma.testSuite.create({
      data: {
        name: data.name,
        description: data.description,
        projectId: data.projectId,
        parentId: data.parentId,
        suiteOrder
      }
    })

    return await this.getSuiteById(suite.id)
  }

  static async updateSuite(id: number, data: SuiteUpdate, userId: number) {
    const suite = await this.getSuiteById(id, false)
    if (!suite) {
      throw new Error('Suite não encontrada')
    }

    const canEdit = await ProjectService.userCanEditProject(suite.projectId, userId)
    if (!canEdit) {
      throw new Error('Você não tem permissão para editar esta suite')
    }

    const updatedSuite = await prisma.testSuite.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        suiteOrder: data.suiteOrder
      }
    })

    return await this.getSuiteById(updatedSuite.id)
  }

  static async moveSuite(id: number, moveData: SuiteMove, userId: number) {
    const suite = await this.getSuiteById(id, false)
    if (!suite) {
      throw new Error('Suite não encontrada')
    }

    const canEdit = await ProjectService.userCanEditProject(suite.projectId, userId)
    if (!canEdit) {
      throw new Error('Você não tem permissão para mover esta suite')
    }

    if (moveData.newParentId !== undefined) {
      if (moveData.newParentId === null) {
        // Movendo para raiz
      } else {
        const newParent = await this.getSuiteById(moveData.newParentId, false)
        if (!newParent) {
          throw new Error('Nova suite pai não encontrada')
        }
        if (newParent.projectId !== suite.projectId) {
          throw new Error('Nova suite pai deve pertencer ao mesmo projeto')
        }

        const wouldCreateCycle = await this.wouldCreateCycle(id, moveData.newParentId)
        if (wouldCreateCycle) {
          throw new Error('Esta operação criaria um ciclo na hierarquia')
        }
      }
    }

    const updateData: any = {}
    
    if (moveData.newParentId !== undefined) {
      updateData.parentId = moveData.newParentId
    }

    if (moveData.newOrder !== undefined) {
      updateData.suiteOrder = moveData.newOrder
      
      await this.reorderSuites(
        suite.projectId, 
        moveData.newParentId !== undefined ? moveData.newParentId : suite.parentId,
        id,
        moveData.newOrder
      )
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.testSuite.update({
        where: { id },
        data: updateData
      })
    }

    return await this.getSuiteById(id)
  }

  static async wouldCreateCycle(suiteId: number, newParentId: number): Promise<boolean> {
    if (suiteId === newParentId) {
      return true
    }

    const descendants = await this.getAllDescendants(suiteId)
    return descendants.some(descendant => descendant.id === newParentId)
  }

  static async getAllDescendants(suiteId: number): Promise<any[]> {
    const descendants: any[] = []
    
    const children = await prisma.testSuite.findMany({
      where: { parentId: suiteId },
      select: { id: true }
    })

    for (const child of children) {
      descendants.push(child)
      const childDescendants = await this.getAllDescendants(child.id)
      descendants.push(...childDescendants)
    }

    return descendants
  }

  static async reorderSuites(projectId: number, parentId: number | null, movingSuiteId: number, newOrder: number) {
    const siblings = await prisma.testSuite.findMany({
      where: { 
        projectId,
        parentId: parentId || null,
        id: { not: movingSuiteId }
      },
      orderBy: { suiteOrder: 'asc' }
    })

    const updates: any[] = []
    let currentOrder = 0

    for (let i = 0; i <= siblings.length; i++) {
      if (currentOrder === newOrder) {
        currentOrder++
      }
      
      if (i < siblings.length) {
        updates.push(
          prisma.testSuite.update({
            where: { id: siblings[i].id },
            data: { suiteOrder: currentOrder }
          })
        )
        currentOrder++
      }
    }

    await prisma.$transaction(updates)
  }

  static async deleteSuite(id: number, userId: number) {
    const suite = await this.getSuiteById(id)
    if (!suite) {
      throw new Error('Suite não encontrada')
    }

    const canEdit = await ProjectService.userCanEditProject(suite.projectId, userId)
    if (!canEdit) {
      throw new Error('Você não tem permissão para excluir esta suite')
    }

    const hasScenarios = await prisma.testScenario.count({
      where: { suiteId: id }
    })

    if (hasScenarios > 0) {
      throw new Error('Não é possível excluir uma suite que possui cenários de teste. Remova os cenários primeiro.')
    }

    const hasChildren = await prisma.testSuite.count({
      where: { parentId: id }
    })

    if (hasChildren > 0) {
      throw new Error('Não é possível excluir uma suite que possui subsuites. Remova as subsuites primeiro.')
    }

    return await prisma.testSuite.delete({
      where: { id }
    })
  }

  static async getSuiteBreadcrumb(id: number): Promise<any[]> {
    const breadcrumb: any[] = []
    let currentSuite = await prisma.testSuite.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, parentId: true } },
        project: { select: { id: true, name: true } }
      }
    })

    while (currentSuite) {
      breadcrumb.unshift({
        id: currentSuite.id,
        name: currentSuite.name,
        type: 'suite'
      })

      if (currentSuite.parent) {
        currentSuite = await prisma.testSuite.findUnique({
          where: { id: currentSuite.parent.id },
          include: {
            parent: { select: { id: true, name: true, parentId: true } },
            project: { select: { id: true, name: true } }
          }
        })
      } else {
        breadcrumb.unshift({
          id: currentSuite.project.id,
          name: currentSuite.project.name,
          type: 'project'
        })
        break
      }
    }

    return breadcrumb
  }

  static async validateSuiteAccess(suiteId: number, userId: number): Promise<{ hasAccess: boolean, exists: boolean }> {
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      select: { projectId: true }
    })

    if (!suite) {
      return { hasAccess: false, exists: false }
    }

    const hasAccess = await ProjectService.userHasProjectAccess(suite.projectId, userId)
    return { hasAccess, exists: true }
  }
}