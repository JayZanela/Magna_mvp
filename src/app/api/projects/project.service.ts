import { ProjectCreate, ProjectUpdate, ProjectMember, ProjectMemberUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { CompanyService } from '../companies/company.service'

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
    // Buscar usuário para obter companyId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Buscar projetos onde o owner pertence à mesma empresa
    const ownedProjects = await prisma.project.findMany({
      where: { 
        ownerId: userId,
        owner: { companyId: user.companyId }
      },
      include: {
        owner: {
          select: { id: true, email: true, fullName: true, role: true, companyId: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true, companyId: true }
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
          some: { 
            userId,
            user: { companyId: user.companyId }
          }
        }
      },
      include: {
        owner: {
          select: { id: true, email: true, fullName: true, role: true, companyId: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true, role: true, companyId: true }
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
    // Buscar usuário para obter companyId
    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { companyId: true }
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Verificar se a empresa não excedeu o limite de projetos
    const limits = await CompanyService.validateCompanyLimits(user.companyId)
    if (!limits.canAddProject) {
      throw new Error('Empresa atingiu o limite máximo de projetos')
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
        status: 'active'
      },
      include: {
        owner: {
          select: { id: true, email: true, fullName: true, role: true, companyId: true }
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

    // Buscar o usuário a ser adicionado
    const userToAdd = await prisma.user.findUnique({
      where: { id: memberData.userId },
      select: { id: true, companyId: true, email: true, fullName: true, role: true }
    })
    if (!userToAdd) {
      throw new Error('Usuário não encontrado')
    }

    // Buscar o requester para verificar se são da mesma empresa
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { companyId: true }
    })

    if (!requester) {
      throw new Error('Requester não encontrado')
    }

    // Verificar se usuário pertence à mesma empresa
    if (userToAdd.companyId !== requester.companyId) {
      throw new Error('Só é possível adicionar usuários da mesma empresa')
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
          select: { id: true, email: true, fullName: true, role: true, companyId: true }
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

  static async userCanEditProject(projectId: number, userId: number): Promise<boolean> {
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

    // Apenas owner ou admins/managers podem editar
    if (project.ownerId === userId) {
      return true
    }

    const member = project.members[0]
    return member && (member.role === 'admin' || member.role === 'manager')
  }
}