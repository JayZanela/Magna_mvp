import { prisma } from '@/lib/db'

export interface WhereCondition {
  [key: string]: any
}

export interface DatabaseOperations<T> {
  tableName: string
}

export class DatabaseOperations<T> {
  constructor(private _tableName: string) {}

  async findMany(where?: WhereCondition, orderBy?: any, limit?: number): Promise<T[]> {
    const model = (prisma as any)[this.tableName]
    return await model.findMany({
      where,
      orderBy,
      take: limit,
    })
  }

  async findUnique(where: WhereCondition): Promise<T | null> {
    const model = (prisma as any)[this.tableName]
    return await model.findUnique({
      where,
    })
  }

  async findFirst(where: WhereCondition): Promise<T | null> {
    const model = (prisma as any)[this.tableName]
    return await model.findFirst({
      where,
    })
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const model = (prisma as any)[this.tableName]
    return await model.create({
      data,
    })
  }

  async update(where: WhereCondition, data: Partial<T>): Promise<T> {
    const model = (prisma as any)[this.tableName]
    return await model.update({
      where,
      data,
    })
  }

  async delete(where: WhereCondition): Promise<T> {
    const model = (prisma as any)[this.tableName]
    return await model.delete({
      where,
    })
  }

  async deleteMany(where: WhereCondition): Promise<{ count: number }> {
    const model = (prisma as any)[this.tableName]
    return await model.deleteMany({
      where,
    })
  }

  async count(where?: WhereCondition): Promise<number> {
    const model = (prisma as any)[this.tableName]
    return await model.count({
      where,
    })
  }

  async exists(where: WhereCondition): Promise<boolean> {
    const count = await this.count(where)
    return count > 0
  }
}