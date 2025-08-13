/**
 * Funções utilitárias para testes
 * Centraliza operações comuns e reduz duplicação de código
 */

import request from 'supertest'
import { TestDatabaseManager, BaseTestIds, TestTokens } from './database-manager'
import { 
  FIXTURE_USERS, 
  FIXTURE_SCENARIOS, 
  FIXTURE_EXECUTION_DATA,
  FIXTURE_COMMENTS,
  TEST_CONFIG,
  TestScenario 
} from './test-data'

export interface TestErrorReport {
  test: string
  input: any
  expected: any
  actual: any
  error: string
  stack: string
  fixture: string
  timestamp: string
}

export interface TestContext {
  tokens: TestTokens
  baseIds: BaseTestIds
  baseUrl: string
}

export class TestHelpers {
  private static errorReports: TestErrorReport[] = []
  
  /**
   * Obtém contexto completo para testes (tokens + IDs)
   */
  static async getTestContext(): Promise<TestContext> {
    const baseIds = await TestDatabaseManager.setupBaseData()
    const tokens = await this.getAllTokens()
    
    return {
      tokens,
      baseIds,
      baseUrl: TEST_CONFIG.baseUrl
    }
  }
  
  /**
   * Autentica usuário e retorna token JWT
   */
  static async authenticateUser(userType: keyof typeof FIXTURE_USERS): Promise<string> {
    const user = FIXTURE_USERS[userType]
    
    const response = await request(TEST_CONFIG.baseUrl)
      .post('/api/auth/signin')
      .send({
        email: user.email,
        password: user.password
      })
      .expect(200)
    
    return response.body.accessToken
  }
  
  /**
   * Obtém todos os tokens de uma vez
   */
  static async getAllTokens(): Promise<TestTokens> {
    const [adminToken, testerToken, managerToken, externalToken] = await Promise.all([
      this.authenticateUser('admin'),
      this.authenticateUser('tester'),  
      this.authenticateUser('manager'),
      this.authenticateUser('external')
    ])
    
    return {
      adminToken,
      testerToken,
      managerToken,
      externalToken
    }
  }
  
  /**
   * Cria cenário de teste com dados padrão + overrides
   */
  static async createTestScenario(
    token: string,
    suiteId: number,
    scenarioType: keyof typeof FIXTURE_SCENARIOS = 'login',
    overrides: Partial<TestScenario> = {}
  ): Promise<number> {
    const scenarioData = {
      ...FIXTURE_SCENARIOS[scenarioType],
      ...overrides,
      suiteId
    }
    
    const response = await request(TEST_CONFIG.baseUrl)
      .post('/api/cenarios')
      .set('Authorization', `Bearer ${token}`)
      .send(scenarioData)
      .expect(201)
    
    return response.body.id
  }
  
  /**
   * Cria execução de teste
   */
  static async createTestExecution(
    token: string,
    scenarioId: number,
    overrides: any = {}
  ): Promise<number> {
    const executionData = {
      scenarioId,
      testData: FIXTURE_EXECUTION_DATA.testData,
      ...overrides
    }
    
    const response = await request(TEST_CONFIG.baseUrl)
      .post('/api/execucoes')
      .set('Authorization', `Bearer ${token}`)
      .send(executionData)
      .expect(201)
    
    return response.body.id
  }
  
  /**
   * Finaliza execução com status específico
   */
  static async finishExecution(
    token: string,
    executionId: number,
    status: 'passed' | 'failed' | 'blocked',
    notes?: string
  ): Promise<void> {
    const updateData = {
      status,
      notes: notes || (status === 'passed' ? FIXTURE_COMMENTS.success : FIXTURE_COMMENTS.failure),
      completedAt: new Date().toISOString()
    }
    
    await request(TEST_CONFIG.baseUrl)
      .put(`/api/execucoes/${executionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData)
      .expect(200)
  }
  
  /**
   * Adiciona comentário a uma execução
   */
  static async addComment(
    token: string,
    executionId: number,
    commentType: keyof typeof FIXTURE_COMMENTS = 'success',
    customComment?: string
  ): Promise<number> {
    const commentData = {
      executionId,
      comment: customComment || FIXTURE_COMMENTS[commentType]
    }
    
    const response = await request(TEST_CONFIG.baseUrl)
      .post('/api/comentarios')
      .set('Authorization', `Bearer ${token}`)
      .send(commentData)
      .expect(201)
    
    return response.body.id
  }
  
  /**
   * Cria fluxo completo: cenário → execução → comentário
   */
  static async createCompleteTestFlow(
    context: TestContext,
    scenarioType: keyof typeof FIXTURE_SCENARIOS = 'login',
    executionStatus: 'passed' | 'failed' | 'blocked' = 'passed'
  ): Promise<{
    scenarioId: number
    executionId: number
    commentId: number
  }> {
    // Criar cenário
    const scenarioId = await this.createTestScenario(
      context.tokens.testerToken,
      context.baseIds.suiteId,
      scenarioType
    )
    
    // Criar execução
    const executionId = await this.createTestExecution(
      context.tokens.testerToken,
      scenarioId
    )
    
    // Finalizar execução
    await this.finishExecution(
      context.tokens.testerToken,
      executionId,
      executionStatus
    )
    
    // Adicionar comentário
    const commentId = await this.addComment(
      context.tokens.testerToken,
      executionId,
      executionStatus === 'passed' ? 'success' : 'failure'
    )
    
    return { scenarioId, executionId, commentId }
  }
  
  /**
   * Valida estrutura padrão de resposta da API
   */
  static validateApiResponse(response: any, expectedFields: string[]): boolean {
    for (const field of expectedFields) {
      if (!(field in response)) {
        this.recordError('API Response Validation', {
          expectedFields,
          actualFields: Object.keys(response)
        }, `Missing field: ${field}`)
        return false
      }
    }
    return true
  }
  
  /**
   * Executa teste com retry automático
   */
  static async withRetry<T>(
    testFunction: () => Promise<T>,
    maxRetries: number = TEST_CONFIG.retries,
    testName: string = 'Unknown Test'
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await testFunction()
      } catch (error) {
        lastError = error as Error
        
        if (attempt <= maxRetries) {
          console.log(`⚠️ ${testName} failed (attempt ${attempt}), retrying...`)
          await this.sleep(1000 * attempt) // Backoff exponencial
        }
      }
    }
    
    this.recordError(testName, {}, lastError!.message, lastError!.stack)
    throw lastError!
  }
  
  /**
   * Aguarda tempo específico
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * Registra erro para relatório
   */
  static recordError(
    testName: string,
    input: any,
    error: string,
    stack?: string,
    expected?: any,
    actual?: any
  ): void {
    this.errorReports.push({
      test: testName,
      input,
      expected: expected || 'N/A',
      actual: actual || 'N/A', 
      error,
      stack: stack || 'No stack trace',
      fixture: 'TestHelpers',
      timestamp: new Date().toISOString()
    })
  }
  
  /**
   * Gera relatório de erros detalhado
   */
  static generateErrorReport(): TestErrorReport[] {
    return [...this.errorReports]
  }
  
  /**
   * Limpa relatório de erros
   */
  static clearErrorReport(): void {
    this.errorReports = []
  }
  
  /**
   * Exibe relatório de erros em formato tabular
   */
  static displayErrorReport(): void {
    if (this.errorReports.length === 0) {
      console.log('✅ No errors recorded')
      return
    }
    
    console.log('\n📊 ERROR REPORT')
    console.log('================')
    
    this.errorReports.forEach((report, index) => {
      console.log(`\n🔴 Error #${index + 1}`)
      console.log(`Test: ${report.test}`)
      console.log(`Time: ${report.timestamp}`)
      console.log(`Error: ${report.error}`)
      console.log(`Input: ${JSON.stringify(report.input, null, 2)}`)
      console.log(`Expected: ${JSON.stringify(report.expected, null, 2)}`)
      console.log(`Actual: ${JSON.stringify(report.actual, null, 2)}`)
      console.log('---')
    })
    
    console.log(`\n📈 Total errors: ${this.errorReports.length}`)
  }
  
  /**
   * Cria usuário temporário para testes específicos
   */
  static async createTemporaryUser(
    userOverrides: any = {},
    role: 'admin' | 'manager' | 'tester' | 'guest' = 'tester'
  ): Promise<{ id: number; token: string; email: string }> {
    const timestamp = Date.now()
    const userData = {
      email: `temp-user-${timestamp}@test.magna.com`,
      password: '123456',
      fullName: `Temp User ${timestamp}`,
      role,
      ...userOverrides
    }
    
    // Registrar usuário
    const registerResponse = await request(TEST_CONFIG.baseUrl)
      .post('/api/auth/register')
      .send(userData)
      .expect(201)
    
    return {
      id: registerResponse.body.user.id,
      token: registerResponse.body.accessToken,
      email: userData.email
    }
  }
  
  /**
   * Limpa usuários temporários criados
   */
  static async cleanupTemporaryUsers(): Promise<void> {
    try {
      const prisma = TestDatabaseManager.getPrisma()
    
      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith: 'temp-user-'
          }
        }
      })
    
      console.log('🧹 Temporary users cleaned up')
    } catch (error) {
      console.log('⚠️ Could not cleanup temporary users:', error)
    }
  }
  
  /**
   * Verifica se usuário tem acesso a recurso
   */
  static async checkUserAccess(
    token: string,
    endpoint: string,
    expectedStatus: number = 200
  ): Promise<boolean> {
    try {
      const response = await request(TEST_CONFIG.baseUrl)
        .get(endpoint)
        .set('Authorization', `Bearer ${token}`)
      
      return response.status === expectedStatus
    } catch (error) {
      return false
    }
  }
  
  /**
   * Mock de requisição externa para testes isolados
   */
  static mockExternalRequest(url: string, response: any): void {
    // Implementaria mock baseado na biblioteca usada (jest, sinon, etc)
    console.log(`🎭 Mocking external request: ${url}`)
  }
  
  /**
   * Calcula tempo de execução de função
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T>,
    label: string = 'Operation'
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now()
    const result = await fn()
    const duration = Date.now() - start
    
    console.log(`⏱️ ${label} took ${duration}ms`)
    
    return { result, duration }
  }
}