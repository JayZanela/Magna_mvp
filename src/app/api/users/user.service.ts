import { UserCreate, UserUpdate } from '@/lib/validations'
import { prisma } from '@/lib/db'

export class UserService {
  static async getUserById(id: number) {
    return await prisma.user.findUnique({ where: { id: id } })
  }

  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email: email } })
  }

  static async getUsersCount(): Promise<number> {
    return await prisma.user.count()
  }

  static async getAllUsers() {
    const execFindAll = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const execCountFind = await this.getUsersCount()

    return {
      execFindAll,
      execCountFind,
    }
  }

  static async createUser(data: UserCreate) {
    const existingUser = await this.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    const dataCreate = {
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      role: data.role,
      isActive: data.isActive,
    }
    return await prisma.user.create({ data: dataCreate })
  }

  static async updateUser(id: number, data: UserUpdate) {
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.getUserByEmail(data.email)
      if (emailExists) {
        throw new Error('Email already in use')
      }
    }

    return await prisma.user.update({ where: { id: id }, data: data })
  }

  static async deleteUser(id: number) {
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new Error('User not found')
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
