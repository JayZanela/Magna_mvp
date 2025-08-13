/**
 * Testes de Autenticação Otimizados
 * Utiliza fixtures compartilhados e reduz duplicação de código
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { TestHelpers, TestContext } from './fixtures/test-helpers'
import { FIXTURE_USERS, TEST_CONFIG } from './fixtures/test-data'

describe('🔐 Auth API - Versão Otimizada', () => {
  let context: TestContext
  let tempUser: { id: number; token: string; email: string }
  
  beforeAll(async () => {
    console.log('🚀 Iniciando testes de autenticação otimizados...')
    context = await TestHelpers.getTestContext()
  })

  afterAll(async () => {
    // Limpar dados específicos do teste
    await TestHelpers.cleanupTemporaryUsers()
    console.log('✅ Testes de autenticação finalizados!')
  })

  describe('1️⃣ REGISTER - Registro de Usuário', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      console.log('📝 Testando registro de usuário...')

      tempUser = await TestHelpers.createTemporaryUser()

      // Verificar que o usuário foi criado com sucesso
      expect(tempUser.id).toBeGreaterThan(0)
      expect(tempUser.token).toBeDefined()
      expect(tempUser.email).toContain('temp-user-')

      console.log(`✅ Usuário registrado! ID: ${tempUser.id}`)
    })

    it('não deve permitir email duplicado', async () => {
      console.log('🔒 Testando email duplicado...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/register')
        .send({
          email: FIXTURE_USERS.admin.email, // Email já existente
          password: '123456',
          fullName: 'Usuário Duplicado'
        })
        .expect(400)

      expect(response.body.error).toBe('Email já está em uso')
      console.log('✅ Email duplicado rejeitado corretamente')
    })

    it('deve validar campos obrigatórios', async () => {
      console.log('📋 Testando validação de campos...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/register')
        .send({
          email: 'email-inválido',
          password: '123', // Muito curta
          fullName: '', // Vazio
        })
        .expect(400)

      expect(response.body.error).toBe('Invalid data')
      expect(response.body.details).toHaveLength(3) // 3 erros de validação
      console.log('✅ Validação de campos funcionando')
    })
  })

  describe('2️⃣ SIGNIN - Login de Usuário', () => {
    it('deve fazer login com credenciais corretas', async () => {
      console.log('🔐 Testando login...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/signin')
        .send({
          email: FIXTURE_USERS.tester.email,
          password: FIXTURE_USERS.tester.password,
        })
        .expect(200)

      // Verificar estrutura da resposta
      expect(TestHelpers.validateApiResponse(response.body, [
        'user', 'accessToken', 'refreshToken'
      ])).toBe(true)

      console.log('✅ Login realizado com sucesso')
    })

    it('deve rejeitar credenciais inválidas', async () => {
      console.log('❌ Testando credenciais inválidas...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/signin')
        .send({
          email: FIXTURE_USERS.tester.email,
          password: 'senha-errada',
        })
        .expect(400)

      expect(response.body.error).toBe('Email ou senha inválidos')
      console.log('✅ Credenciais inválidas rejeitadas')
    })
  })

  describe('3️⃣ REFRESH - Renovação de Token', () => {
    let refreshToken: string

    beforeAll(async () => {
      // Obter refresh token através de login
      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/signin')
        .send({
          email: FIXTURE_USERS.manager.email,
          password: FIXTURE_USERS.manager.password,
        })
        .expect(200)
      
      refreshToken = response.body.refreshToken
    })

    it('deve renovar access token com refresh token válido', async () => {
      console.log('🔄 Testando renovação de token...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.accessToken).toBeDefined()

      console.log('✅ Access token renovado com sucesso')
    })

    it('deve rejeitar refresh token inválido', async () => {
      console.log('❌ Testando refresh token inválido...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token-inválido' })
        .expect(401)

      expect(response.body.error).toBe('Token de refresh inválido')
      console.log('✅ Refresh token inválido rejeitado')
    })
  })

  describe('4️⃣ LOGOUT - Logout de Usuário', () => {
    let testRefreshToken: string

    beforeAll(async () => {
      // Login para obter refresh token
      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/signin')
        .send({
          email: FIXTURE_USERS.external.email,
          password: FIXTURE_USERS.external.password,
        })
        .expect(200)
      
      testRefreshToken = response.body.refreshToken
    })

    it('deve fazer logout invalidando refresh token', async () => {
      console.log('👋 Testando logout...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/logout')
        .send({ refreshToken: testRefreshToken })
        .expect(200)

      expect(response.body.message).toBe('Logout realizado com sucesso')
      console.log('✅ Logout realizado com sucesso')
    })

    it('refresh token deve estar inválido após logout', async () => {
      console.log('🔒 Verificando invalidação do refresh token...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/auth/refresh')
        .send({ refreshToken: testRefreshToken })
        .expect(401)

      expect(response.body.error).toBe('Token de refresh inválido')
      console.log('✅ Refresh token invalidado corretamente após logout')
    })
  })

  describe('5️⃣ MIDDLEWARE - Proteção de Rotas', () => {
    it('deve permitir acesso com token válido', async () => {
      console.log('🛡️ Testando middleware com token válido...')

      const hasAccess = await TestHelpers.checkUserAccess(
        context.tokens.adminToken,
        '/api/users',
        200
      )

      expect(hasAccess).toBe(true)
      console.log('✅ Acesso permitido com token válido')
    })

    it('deve bloquear acesso sem token', async () => {
      console.log('🚫 Testando acesso sem token...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get('/api/users')
        .expect(401)

      expect(response.body.error).toBe('Token não fornecido')
      console.log('✅ Acesso bloqueado sem token')
    })

    it('deve bloquear acesso com token inválido', async () => {
      console.log('🚫 Testando acesso com token inválido...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get('/api/users')
        .set('Authorization', 'Bearer token-inválido')
        .expect(401)

      expect(response.body.error).toBe('Token inválido')
      console.log('✅ Acesso bloqueado com token inválido')
    })
  })

  describe('6️⃣ PERFORMANCE & RETRY', () => {
    it('deve executar login com retry automático', async () => {
      console.log('🔄 Testando login com retry...')

      const { result, duration } = await TestHelpers.measureExecutionTime(
        () => TestHelpers.withRetry(
          () => request(TEST_CONFIG.baseUrl)
            .post('/api/auth/signin')
            .send({
              email: FIXTURE_USERS.admin.email,
              password: FIXTURE_USERS.admin.password,
            })
            .expect(200),
          2,
          'Login Retry Test'
        ),
        'Login with Retry'
      )

      expect(result.status).toBe(200)
      expect(duration).toBeLessThan(5000) // Deve ser rápido
      console.log('✅ Login com retry executado com sucesso')
    })
  })
})