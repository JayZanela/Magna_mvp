import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createServer } from 'http'
import { NextApiHandler } from 'next'

// URLs da API
const BASE_URL = 'http://localhost:3000'

// Variáveis compartilhadas entre testes
let accessToken: string
let refreshToken: string
let userId: number
const testUser = {
  email: `test-${Date.now()}@exemplo.com`, // Email único para evitar conflitos
  password: '123456',
  fullName: 'Usuário de Teste',
}

describe('🔐 Auth API - Fluxo Completo', () => {
  beforeAll(async () => {
    console.log('🚀 Iniciando testes de autenticação...')
    console.log(`📧 Email de teste: ${testUser.email}`)
  })

  afterAll(async () => {
    console.log('✅ Testes de autenticação finalizados!')
  })

  describe('1️⃣ REGISTER - Registro de Usuário', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      console.log('📝 Testando registro de usuário...')

      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)

      // Verificar estrutura da resposta
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')

      // Verificar dados do usuário
      expect(response.body.user.email).toBe(testUser.email)
      expect(response.body.user.fullName).toBe(testUser.fullName)
      expect(response.body.user.role).toBe('tester')

      // Salvar tokens para próximos testes
      accessToken = response.body.accessToken
      refreshToken = response.body.refreshToken
      userId = response.body.user.id

      console.log(`✅ Usuário registrado! ID: ${userId}`)
      console.log(`🔑 Access Token: ${accessToken.substring(0, 20)}...`)
      console.log(`🔄 Refresh Token: ${refreshToken.substring(0, 20)}...`)
    })

    it('não deve permitir email duplicado', async () => {
      console.log('🔒 Testando email duplicado...')

      const response = await request(BASE_URL)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400)

      expect(response.body.error).toBe('Email já está em uso')
      console.log('✅ Email duplicado rejeitado corretamente')
    })

    it('deve validar campos obrigatórios', async () => {
      console.log('📋 Testando validação de campos...')

      const response = await request(BASE_URL)
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

      const response = await request(BASE_URL)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)

      // Verificar resposta
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')

      // Atualizar tokens (novos tokens são gerados no login)
      accessToken = response.body.accessToken
      refreshToken = response.body.refreshToken

      console.log('✅ Login realizado com sucesso')
      console.log(`🔄 Novos tokens gerados`)
    })

    it('deve rejeitar credenciais inválidas', async () => {
      console.log('❌ Testando credenciais inválidas...')

      const response = await request(BASE_URL)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: 'senha-errada',
        })
        .expect(400)

      expect(response.body.error).toBe('Email ou senha inválidos')
      console.log('✅ Credenciais inválidas rejeitadas')
    })
  })

  describe('3️⃣ REFRESH - Renovação de Token', () => {
    it('deve renovar access token com refresh token válido', async () => {
      console.log('🔄 Testando renovação de token...')

      const response = await request(BASE_URL)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)

      console.log('❓Refresh log', response.body, response.statusCode)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken') // Agora retorna novo refresh token

      // Salvar novos tokens (TOKEN ROTATION)
      const newAccessToken = response.body.accessToken
      const newRefreshToken = response.body.refreshToken

      expect(newAccessToken).toBeDefined()
      expect(newRefreshToken).toBeDefined()
      expect(newAccessToken).not.toBe(accessToken) // Deve ser diferente do anterior
      expect(newRefreshToken).not.toBe(refreshToken) // Novo refresh token também

      accessToken = newAccessToken
      refreshToken = newRefreshToken

      console.log('✅ Access token renovado com sucesso')
      console.log(`🔑 Novo Access Token: ${accessToken.substring(0, 20)}...`)
    })

    it('deve rejeitar refresh token inválido', async () => {
      console.log('❌ Testando refresh token inválido...')

      const response = await request(BASE_URL)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'token-inválido',
        })
        .expect(401)

      expect(response.body.error).toBe('Token de refresh inválido')
      console.log('✅ Refresh token inválido rejeitado')
    })
  })

  describe('4️⃣ LOGOUT - Logout de Usuário', () => {
    it('deve fazer logout invalidando refresh token', async () => {
      console.log('👋 Testando logout...')

      const response = await request(BASE_URL)
        .post('/api/auth/logout')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)

      expect(response.body.message).toBe('Logout realizado com sucesso')
      console.log('✅ Logout realizado com sucesso')
    })

    it('refresh token deve estar inválido após logout', async () => {
      console.log('🔒 Verificando invalidação do refresh token...')

      const response = await request(BASE_URL)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(401) // Mudou de 400 para 401

      expect(response.body.error).toBe('Token de refresh inválido')
      console.log('✅ Refresh token invalidado corretamente após logout')
    })
  })

  describe('5️⃣ MIDDLEWARE - Proteção de Rotas', () => {
    it('deve permitir acesso com token válido', async () => {
      console.log('🛡️  Testando middleware com token válido...')

      // Fazer novo login para ter token válido
      const loginResponse = await request(BASE_URL)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)

      const validToken = loginResponse.body.accessToken

      // Testar uma rota protegida (users)
      const protectedResponse = await request(BASE_URL)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(protectedResponse.body).toBeDefined()
      console.log('✅ Acesso permitido com token válido')
    })

    it('deve bloquear acesso sem token', async () => {
      console.log('🚫 Testando acesso sem token...')

      const response = await request(BASE_URL).get('/api/users').expect(401)

      expect(response.body.error).toBe('Token não fornecido')
      console.log('✅ Acesso bloqueado sem token')
    })

    it('deve bloquear acesso com token inválido', async () => {
      console.log('🚫 Testando acesso com token inválido...')

      const response = await request(BASE_URL)
        .get('/api/users')
        .set('Authorization', 'Bearer token-inválido')
        .expect(401)

      expect(response.body.error).toBe('Token inválido')
      console.log('✅ Acesso bloqueado com token inválido')
    })
  })
})
