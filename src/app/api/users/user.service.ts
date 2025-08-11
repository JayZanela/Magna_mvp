import { UserModel } from '@/lib/database/models'
import { UserCreate, UserUpdate } from '@/lib/validations'
import { User } from '@/types'

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return await UserModel.findMany({}, { createdAt: 'desc' })
  }

  static async getUserById(id: number): Promise<User | null> {
    return await UserModel.findUnique({ id })
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return await UserModel.findUnique({ email })
  }

  static async createUser(data: UserCreate): Promise<User> {
    const existingUser = await this.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    
    return await UserModel.create(data)
  }

  static async updateUser(id: number, data: UserUpdate): Promise<User> {
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

    return await UserModel.update({ id }, data)
  }

  static async deleteUser(id: number): Promise<User> {
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    return await UserModel.delete({ id })
  }

  static async userExists(id: number): Promise<boolean> {
    return await UserModel.exists({ id })
  }

  static async getUsersCount(): Promise<number> {
    return await UserModel.count()
  }
}