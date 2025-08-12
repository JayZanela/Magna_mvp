import { ProjectCreate, ProjectUpdate, ProjectMember, ProjectMemberUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'

export class ProjectService {
  static async getProjectById(id: number) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        _count: {
          select: { testSuites: true }
        }
      }
    })
  }

  static async getUserProjects(userId: number) {
    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        _count: {
          select: { testSuites: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const memberProjects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        owner: {
          select: { id: true, email: true, fullName: true, role: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true }
            }
          }
        },
        _count: {
          select: { testSuites: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const allProjects = [...ownedProjects, ...memberProjects]
    const uniqueProjects = allProjects.filter((project, index, self) =>
      index === self.findIndex(p => p.id === project.id)
    )

    return {
      projects: uniqueProjects,
      total: uniqueProjects.length,
      owned: ownedProjects.length,
      member: memberProjects.length
    }
  }

  static async createProject(data: ProjectCreate, ownerId: number) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
        status: 'active'
      },
      include: {
        owner: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    })

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        role: 'admin'
      }
    })

    return await this.getProjectById(project.id)
  }

  static async updateProject(id: number, data: ProjectUpdate, userId: number) {
    const project = await this.getProjectById(id)
    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    if (project.ownerId !== userId) {
      throw new Error('Apenas o proprietário pode editar este projeto')
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        updatedAt: new Date()
      }
    })

    return await this.getProjectById(updatedProject.id)
  }

  static async deleteProject(id: number, userId: number) {
    const project = await this.getProjectById(id)
    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    if (project.ownerId !== userId) {
      throw new Error('Apenas o proprietário pode excluir este projeto')
    }

    const hasTestSuites = await prisma.testSuite.count({
      where: { projectId: id }
    })

    if (hasTestSuites > 0) {
      throw new Error('Não é possível excluir um projeto que possui suítes de teste. Remova as suítes primeiro.')
    }

    await prisma.projectMember.deleteMany({
      where: { projectId: id }
    })

    return await prisma.project.delete({
      where: { id }
    })
  }

  static async getProjectMembers(projectId: number, userId: number) {
    const project = await this.getProjectById(projectId)
    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    const isOwnerOrMember = project.ownerId === userId || 
      project.members.some(member => member.userId === userId)

    if (!isOwnerOrMember) {
      throw new Error('Você não tem permissão para ver os membros deste projeto')
    }

    return project.members
  }

  static async addMember(projectId: number, memberData: ProjectMember, requesterId: number) {
    const project = await this.getProjectById(projectId)
    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    if (project.ownerId !== requesterId) {
      throw new Error('Apenas o proprietário pode adicionar membros')
    }

    const userExists = await prisma.user.findUnique({
      where: { id: memberData.userId }
    })
    if (!userExists) {
      throw new Error('Usuário não encontrado')
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberData.userId
        }
      }
    })

    if (existingMember) {
      throw new Error('Usuário já é membro deste projeto')
    }

    return await prisma.projectMember.create({
      data: {
        projectId,
        userId: memberData.userId,
        role: memberData.role
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    })
  }

  static async updateMemberRole(projectId: number, memberId: number, roleData: ProjectMemberUpdate, requesterId: number) {
    const project = await this.getProjectById(projectId)
    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    if (project.ownerId !== requesterId) {
      throw new Error('Apenas o proprietário pode alterar roles dos membros')
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId
        }
      }
    })

    if (!member) {
      throw new Error('Membro não encontrado neste projeto')
    }

    if (memberId === requesterId) {
      throw new Error('Você não pode alterar seu próprio role')
    }

    return await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId
        }
      },
      data: { role: roleData.role },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true }
        }
      }
    })
  }

  static async removeMember(projectId: number, memberId: number, requesterId: number) {
    const project = await this.getProjectById(projectId)
    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    if (project.ownerId !== requesterId) {
      throw new Error('Apenas o proprietário pode remover membros')
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId
        }
      }
    })

    if (!member) {
      throw new Error('Membro não encontrado neste projeto')
    }

    if (memberId === requesterId) {
      throw new Error('Você não pode remover a si mesmo do projeto')
    }

    return await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId
        }
      }
    })
  }

  static async userHasProjectAccess(projectId: number, userId: number): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId }
        }
      }
    })

    if (!project) {
      return false
    }

    return project.ownerId === userId || project.members.length > 0
  }
}