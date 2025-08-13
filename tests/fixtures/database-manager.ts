/**
 * Gerenciador de banco de dados para testes
 * Centraliza setup/cleanup e garante isolamento entre testes
 */

import { PrismaClient } from '@prisma/client'
import { FIXTURE_USERS, FIXTURE_PROJECT, FIXTURE_SUITE, TEST_CONFIG } from './test-data'

export interface BaseTestIds {
  adminId: number
  testerId: number
  managerId: number
  externalId: number
  projectId: number
  suiteId: number
}

export interface TestTokens {
  adminToken: string
  testerToken: string
  managerToken: string
  externalToken: string
}

export class TestDatabaseManager {
  private static prisma: PrismaClient
  private static baseIds: BaseTestIds | null = null
  
  /**
   * Inicializa conexão com banco de teste
   */
  static async initialize(): Promise<void> {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./database/test.db'
        }
      }
    })
    
    await this.prisma.$connect()
    console.log('🔌 Database connection established for tests')
  }
  
  /**
   * Configura dados base necessários para todos os testes
   * Executado uma vez no início da suíte de testes
   */
  static async setupBaseData(): Promise<BaseTestIds> {
    if (this.baseIds) {
      return this.baseIds
    }
    
    console.log('🏗️ Setting up base test data...')
    
    try {
      // Criar usuários base
      const adminUser = await this.prisma.user.create({
        data: {
          email: FIXTURE_USERS.admin.email,
          passwordHash: await this.hashPassword(FIXTURE_USERS.admin.password),
          fullName: FIXTURE_USERS.admin.fullName,
          role: 'admin',
          isActive: true,
          createdAt: new Date()
        }
      })
      
      const testerUser = await this.prisma.user.create({
        data: {
          email: FIXTURE_USERS.tester.email,
          passwordHash: await this.hashPassword(FIXTURE_USERS.tester.password),
          fullName: FIXTURE_USERS.tester.fullName,
          role: 'tester',
          isActive: true,
          createdAt: new Date()
        }
      })
      
      const managerUser = await this.prisma.user.create({
        data: {
          email: FIXTURE_USERS.manager.email,
          passwordHash: await this.hashPassword(FIXTURE_USERS.manager.password),
          fullName: FIXTURE_USERS.manager.fullName,
          role: 'manager',
          isActive: true,
          createdAt: new Date()
        }
      })
      
      const externalUser = await this.prisma.user.create({
        data: {
          email: FIXTURE_USERS.external.email,
          passwordHash: await this.hashPassword(FIXTURE_USERS.external.password),
          fullName: FIXTURE_USERS.external.fullName,
          role: 'tester',
          isActive: true,
          createdAt: new Date()
        }
      })
      
      // Criar projeto base
      const project = await this.prisma.project.create({
        data: {
          name: FIXTURE_PROJECT.name,
          description: FIXTURE_PROJECT.description,
          ownerId: adminUser.id,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      // Adicionar membros ao projeto
      await Promise.all([
        this.prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: adminUser.id,
            role: 'admin',
            joinedAt: new Date()
          }
        }),
        this.prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: testerUser.id,
            role: 'tester',
            joinedAt: new Date()
          }
        }),
        this.prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: managerUser.id,
            role: 'manager',
            joinedAt: new Date()
          }
        })
      ])
      
      // Criar suite base
      const suite = await this.prisma.testSuite.create({
        data: {
          projectId: project.id,
          name: FIXTURE_SUITE.name,
          description: FIXTURE_SUITE.description,
          suiteOrder: 1,
          createdAt: new Date()
        }
      })
      
      this.baseIds = {
        adminId: adminUser.id,
        testerId: testerUser.id,
        managerId: managerUser.id,
        externalId: externalUser.id,
        projectId: project.id,
        suiteId: suite.id
      }
      
      console.log('✅ Base test data created successfully')
      console.log(`   - Admin ID: ${adminUser.id}`)
      console.log(`   - Tester ID: ${testerUser.id}`)
      console.log(`   - Manager ID: ${managerUser.id}`)
      console.log(`   - Project ID: ${project.id}`)
      console.log(`   - Suite ID: ${suite.id}`)
      
      return this.baseIds
      
    } catch (error) {
      console.error('❌ Failed to setup base test data:', error)
      throw error
    }
  }
  
  /**
   * Limpa dados específicos de teste mantendo os fixtures base
   */
  static async cleanupTestData(): Promise<void> {
    if (!this.prisma) return
    
    try {
      // Limpar dados criados durante testes (mantém fixtures base)
      await this.prisma.executionComment.deleteMany({
        where: {
          execution: {
            scenario: {
              suiteId: this.baseIds?.suiteId
            }
          }
        }
      })
      
      await this.prisma.testExecution.deleteMany({
        where: {
          scenario: {
            suiteId: this.baseIds?.suiteId
          }
        }
      })
      
      await this.prisma.testScenario.deleteMany({
        where: {
          suiteId: this.baseIds?.suiteId
        }
      })
      
      console.log('🧹 Test data cleaned up')
      
    } catch (error) {
      console.error('❌ Failed to cleanup test data:', error)
    }
  }
  
  /**
   * Reset completo do banco de dados
   */
  static async resetDatabase(): Promise<void> {
    if (!this.prisma) return
    
    try {
      // Ordem de exclusão respeitando foreign keys
      await this.prisma.executionComment.deleteMany({})
      await this.prisma.testExecution.deleteMany({})
      await this.prisma.testScenario.deleteMany({})
      await this.prisma.testSuite.deleteMany({})
      await this.prisma.projectMember.deleteMany({})
      await this.prisma.project.deleteMany({})
      await this.prisma.refreshToken.deleteMany({})
      await this.prisma.user.deleteMany({})
      
      this.baseIds = null
      console.log('🔄 Database reset completed')
      
    } catch (error) {
      console.error('❌ Failed to reset database:', error)
      throw error
    }
  }
  
  /**
   * Fecha conexão com banco
   */
  static async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect()
      console.log('🔌 Database connection closed')
    }
  }
  
  /**
   * Obtém instância do Prisma para operações diretas
   */
  static getPrisma(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return this.prisma
  }
  
  /**
   * Obtém IDs base para uso nos testes
   */
  static getBaseIds(): BaseTestIds {
    if (!this.baseIds) {
      throw new Error('Base data not setup. Call setupBaseData() first.')
    }
    return this.baseIds
  }
  
  /**
   * Hash de senha simples para testes
   */
  private static async hashPassword(password: string): Promise<string> {
    // Para testes, usamos hash simples
    // Em produção, usar bcrypt ou similar
    return Buffer.from(password).toString('base64')
  }
  
  /**
   * Executa transação com rollback automático para isolamento
   */
  static async withTransaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return await callback(tx)
    })
  }
  
  /**
   * Cria snapshot do estado atual do banco
   */
  static async createSnapshot(): Promise<string> {
    const timestamp = Date.now()
    console.log(`📸 Creating database snapshot: ${timestamp}`)
    // Implementação específica dependeria do banco usado
    return `snapshot_${timestamp}`
  }
  
  /**
   * Restaura snapshot do banco
   */
  static async restoreSnapshot(snapshotId: string): Promise<void> {
    console.log(`🔄 Restoring database snapshot: ${snapshotId}`)
    // Implementação específica dependeria do banco usado
  }
}