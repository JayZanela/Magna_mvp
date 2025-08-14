import { UserCreate, UserUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { CompanyService } from '../companies/company.service'

export class UserService {
  static async getUserById(id: number) {
    return await prisma.user.findUnique({ where: { id: id } })
  }

  static async getUserWithCompanyById(id: number) {
    return await prisma.user.findUnique({ 
      where: { id: id },
      include: {
        company: {
          select: { 
            id: true, 
            name: true,
            planType: true
          }
        }
      }
    })
  }

  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email: email } })
  }

  static async getUsersCount(): Promise<number> {
    return await prisma.user.count()
  }

  static async getAllUsers(requesterId?: number, companyId?: number) {
    let whereCondition = {}

    // Se requesterId for fornecido, filtrar apenas usuários da mesma empresa
    if (requesterId) {
      const requester = await prisma.user.findUnique({
        where: { id: requesterId },
        select: { companyId: true, role: true }
      })

      if (!requester) {
        throw new Error('Requester not found')
      }

      whereCondition = { companyId: requester.companyId }
    } else if (companyId) {
      whereCondition = { companyId }
    }

    const execFindAll = await prisma.user.findMany({
      where: whereCondition,
      include: {
        company: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    const execCountFind = await prisma.user.count({ where: whereCondition })

    return {
      execFindAll,
      execCountFind,
    }
  }

  static async createUser(data: UserCreate, requesterId?: number) {
    const existingUser = await this.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Verificar se a empresa existe
    const company = await CompanyService.getCompanyById(data.companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    // Se houver requesterId, verificar se é admin da mesma empresa
    if (requesterId) {
      const requester = await prisma.user.findFirst({
        where: { 
          id: requesterId, 
          companyId: data.companyId,
          role: { in: ['admin'] }
        }
      })

      if (!requester) {
        throw new Error('Only company admins can create users')
      }
    }

    // Verificar limites da empresa
    const limits = await CompanyService.validateCompanyLimits(data.companyId)
    if (!limits.canAddUser) {
      throw new Error('Company has reached the maximum number of users')
    }

    const dataCreate = {
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      role: data.role,
      isActive: data.isActive,
      companyId: data.companyId,
    }
    return await prisma.user.create({ 
      data: dataCreate,
      include: {
        company: {
          select: { id: true, name: true }
        }
      }
    })
  }

  static async updateUser(id: number, data: UserUpdate, requesterId?: number) {
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    // Se houver requesterId, verificar permissões
    if (requesterId && requesterId !== id) {
      const requester = await prisma.user.findFirst({
        where: { 
          id: requesterId, 
          companyId: existingUser.companyId,
          role: { in: ['admin'] }
        }
      })

      if (!requester) {
        throw new Error('Only company admins can update other users')
      }
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.getUserByEmail(data.email)
      if (emailExists) {
        throw new Error('Email already in use')
      }
    }

    // Se está mudando de empresa, verificar permissões
    if (data.companyId && data.companyId !== existingUser.companyId) {
      if (!requesterId) {
        throw new Error('Authentication required to change company')
      }

      const requester = await prisma.user.findFirst({
        where: { 
          id: requesterId,
          role: { in: ['admin'] }
        }
      })

      if (!requester) {
        throw new Error('Only admins can change user company')
      }

      // Verificar limites da nova empresa
      const limits = await CompanyService.validateCompanyLimits(data.companyId)
      if (!limits.canAddUser) {
        throw new Error('Target company has reached the maximum number of users')
      }
    }

    return await prisma.user.update({ 
      where: { id: id }, 
      data: data,
      include: {
        company: {
          select: { id: true, name: true }
        }
      }
    })
  }

  static async deleteUser(id: number, requesterId?: number) {
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    // Se houver requesterId, verificar permissões
    if (requesterId && requesterId !== id) {
      const requester = await prisma.user.findFirst({
        where: { 
          id: requesterId, 
          companyId: existingUser.companyId,
          role: { in: ['admin'] }
        }
      })

      if (!requester) {
        throw new Error('Only company admins can delete other users')
      }

      // Não permitir que admin delete a si mesmo se for o último admin
      const adminCount = await prisma.user.count({
        where: { 
          companyId: existingUser.companyId,
          role: 'admin',
          isActive: true
        }
      })

      if (existingUser.role === 'admin' && adminCount <= 1) {
        throw new Error('Cannot delete the last admin of the company')
      }
    }

    return await prisma.user.delete({ where: { id: id } })
  }

  /*static async userExists(id: number): Promise<boolean> {
    let exists = false;

    const execExist = await prisma.user.findFirst({ where:{ id }})

    if ( execExist) 
    {
      exists = true;
    }
    return exists

  }*/
}
