import { CompanyCreate, CompanyUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'

export class CompanyService {
  static async getCompanyById(id: number) {
    return await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, email: true, fullName: true, role: true, isActive: true }
        },
        _count: {
          select: { users: true }
        }
      }
    })
  }

  static async getCompanyBySubdomain(subdomain: string) {
    return await prisma.company.findUnique({
      where: { subdomain },
      include: {
        users: {
          select: { id: true, email: true, fullName: true, role: true, isActive: true }
        }
      }
    })
  }

  static async getAllCompanies() {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = await prisma.company.count()

    return {
      companies,
      total
    }
  }

  static async createCompany(data: CompanyCreate, createdBy?: number) {
    // Validar CNPJ único se fornecido
    if (data.cnpj) {
      const existingCnpj = await prisma.company.findUnique({
        where: { cnpj: data.cnpj }
      })
      if (existingCnpj) {
        throw new Error('CNPJ já está cadastrado')
      }
    }

    // Validar subdomínio único se fornecido
    if (data.subdomain) {
      const existingSubdomain = await prisma.company.findUnique({
        where: { subdomain: data.subdomain }
      })
      if (existingSubdomain) {
        throw new Error('Subdomínio já está em uso')
      }
    }

    // Configurar trial de 30 dias
    const trialExpiresAt = new Date()
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 30)

    const company = await prisma.company.create({
      data: {
        ...data,
        trialExpiresAt,
        createdBy
      },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    return company
  }

  static async updateCompany(id: number, data: CompanyUpdate, userId: number) {
    const company = await this.getCompanyById(id)
    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    // Verificar se usuário tem permissão (deve ser admin da empresa)
    const user = await prisma.user.findFirst({
      where: { 
        id: userId, 
        companyId: id,
        role: { in: ['admin'] }
      }
    })

    if (!user) {
      throw new Error('Apenas administradores da empresa podem editar')
    }

    // Validar CNPJ único se fornecido e diferente do atual
    if (data.cnpj && data.cnpj !== company.cnpj) {
      const existingCnpj = await prisma.company.findUnique({
        where: { cnpj: data.cnpj }
      })
      if (existingCnpj) {
        throw new Error('CNPJ já está cadastrado')
      }
    }

    // Validar subdomínio único se fornecido e diferente do atual
    if (data.subdomain && data.subdomain !== company.subdomain) {
      const existingSubdomain = await prisma.company.findUnique({
        where: { subdomain: data.subdomain }
      })
      if (existingSubdomain) {
        throw new Error('Subdomínio já está em uso')
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    return updatedCompany
  }

  static async deleteCompany(id: number, userId: number) {
    const company = await this.getCompanyById(id)
    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    // Verificar se usuário tem permissão (deve ser admin da empresa)
    const user = await prisma.user.findFirst({
      where: { 
        id: userId, 
        companyId: id,
        role: { in: ['admin'] }
      }
    })

    if (!user) {
      throw new Error('Apenas administradores da empresa podem excluir')
    }

    // Verificar se há usuários na empresa
    const userCount = await prisma.user.count({
      where: { companyId: id }
    })

    if (userCount > 0) {
      throw new Error('Não é possível excluir uma empresa que possui usuários. Remova todos os usuários primeiro.')
    }

    return await prisma.company.delete({
      where: { id }
    })
  }

  static async getCompanyUsers(companyId: number, requesterId: number) {
    // Verificar se requester pertence à empresa
    const requester = await prisma.user.findFirst({
      where: { id: requesterId, companyId }
    })

    if (!requester) {
      throw new Error('Você não tem permissão para ver os usuários desta empresa')
    }

    const users = await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return users
  }

  static async validateCompanyLimits(companyId: number) {
    const company = await this.getCompanyById(companyId)
    if (!company) {
      throw new Error('Empresa não encontrada')
    }

    const userCount = await prisma.user.count({
      where: { companyId, isActive: true }
    })

    const projectCount = await prisma.project.count({
      where: {
        owner: { companyId }
      }
    })

    return {
      users: {
        current: userCount,
        limit: company.maxUsers,
        available: company.maxUsers - userCount
      },
      projects: {
        current: projectCount,
        limit: company.maxProjects,
        available: company.maxProjects - projectCount
      },
      canAddUser: userCount < company.maxUsers,
      canAddProject: projectCount < company.maxProjects
    }
  }

  static async userHasCompanyAccess(companyId: number, userId: number): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId }
    })

    return !!user
  }

  static async userCanManageCompany(companyId: number, userId: number): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { 
        id: userId, 
        companyId,
        role: { in: ['admin'] }
      }
    })

    return !!user
  }
}