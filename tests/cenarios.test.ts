import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'

const BASE_URL = 'http://localhost:3000'

let accessToken: string
let secondUserToken: string
let projectId: number
let suiteId: number
let scenarioId: number
let secondUserId: number

const testUser = {
  email: `test-scenario-owner-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Proprietário dos Cenários',
}

const secondTestUser = {
  email: `test-scenario-member-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Membro dos Cenários',
}

const projectData = {
  name: 'Projeto para Testes de Cenários',
  description: 'Projeto dedicado aos testes de cenários',
}

const suiteData = {
  name: 'Suite para Cenários',
  description: 'Suite para testar cenários',
}

const scenarioData = {
  name: 'Cenário de Login',
  preconditions: 'Usuário deve estar na tela de login',
  steps: '1. Inserir email\n2. Inserir senha\n3. Clicar em Entrar',
  expectedResult: 'Usuário deve ser direcionado para o dashboard',
  priority: 'high' as const,
}

describe('📝 Scenarios API - Fluxo Completo', () => {
  beforeAll(async () => {
    console.log('🚀 Iniciando testes de cenários de teste...')
    console.log(`📧 Email do owner: ${testUser.email}`)
    console.log(`📧 Email do member: ${secondTestUser.email}`)

    // Registrar usuário principal
    const ownerResponse = await request(BASE_URL)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201)

    accessToken = ownerResponse.body.accessToken
    console.log(`🔑 Token do owner obtido: ${accessToken.substring(0, 20)}...`)

    // Registrar segundo usuário
    const memberResponse = await request(BASE_URL)
      .post('/api/auth/register')
      .send(secondTestUser)
      .expect(201)

    secondUserToken = memberResponse.body.accessToken
    secondUserId = memberResponse.body.user.id
    console.log(
      `🔑 Token do member obtido: ${secondUserToken.substring(0, 20)}...`
    )

    // Criar projeto
    const projectResponse = await request(BASE_URL)
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(projectData)
      .expect(201)

    projectId = projectResponse.body.id
    console.log(`📁 Projeto criado! ID: ${projectId}`)

    // Criar suite
    const suiteResponse = await request(BASE_URL)
      .post(`/api/projects/${projectId}/suites`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(suiteData)
      .expect(201)

    suiteId = suiteResponse.body.id
    console.log(`📋 Suite criada! ID: ${suiteId}`)
  })

  afterAll(async () => {
    console.log('✅ Testes de cenários finalizados!')
  })

  describe('1️⃣ CREATE - Criar Cenários', () => {
    it('deve criar um novo cenário com sucesso', async () => {
      console.log('📝 Testando criação de cenário...')

      const createData = { ...scenarioData, suiteId }

      const response = await request(BASE_URL)
        .post('/api/cenarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', scenarioData.name)
      expect(response.body).toHaveProperty(
        'preconditions',
        scenarioData.preconditions
      )
      expect(response.body).toHaveProperty('steps', scenarioData.steps)
      expect(response.body).toHaveProperty(
        'expectedResult',
        scenarioData.expectedResult
      )
      expect(response.body).toHaveProperty('priority', scenarioData.priority)
      expect(response.body).toHaveProperty('status', 'pending')
      expect(response.body).toHaveProperty('suiteId', suiteId)
      expect(response.body).toHaveProperty('creator')
      console.log(`LOGGGGGGG`)
      expect(response.body.creator.id).toBe(ownerResponse.body.user.id)

      scenarioId = response.body.id
      console.log(`✅ Cenário criado! ID: ${scenarioId}`)
    })

    it('deve criar cenário com atribuição para usuário', async () => {
      console.log('👤 Testando criação com atribuição...')

      // Adicionar segundo usuário ao projeto
      await request(BASE_URL)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId: secondUserId, role: 'tester' })
        .expect(201)

      const assignedScenarioData = {
        name: 'Cenário Atribuído',
        suiteId,
        assignedTo: secondUserId,
        priority: 'medium' as const,
      }

      const response = await request(BASE_URL)
        .post('/api/cenarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(assignedScenarioData)
        .expect(201)

      expect(response.body.assignedTo).toBe(secondUserId)
      expect(response.body.assignee).toBeDefined()
      expect(response.body.assignee.id).toBe(secondUserId)

      console.log('✅ Cenário atribuído criado com sucesso')
    })

    it('deve rejeitar criação sem token de autenticação', async () => {
      console.log('🚫 Testando criação sem autenticação...')

      const response = await request(BASE_URL)
        .post('/api/cenarios')
        .send({ ...scenarioData, suiteId })
        .expect(401)

      expect(response.body.error).toBe('Token não fornecido')
      console.log('✅ Acesso negado sem token')
    })

    it('deve rejeitar criação com suite inexistente', async () => {
      console.log('❌ Testando suite inexistente...')

      const invalidScenarioData = {
        ...scenarioData,
        suiteId: 99999,
      }

      const response = await request(BASE_URL)
        .post('/api/cenarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidScenarioData)
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para criar cenários nesta suite'
      )
      console.log('✅ Suite inexistente rejeitada')
    })

    it('deve validar campos obrigatórios', async () => {
      console.log('📋 Testando validação de campos...')

      const response = await request(BASE_URL)
        .post('/api/cenarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '', // Nome vazio
          suiteId: 'invalid', // Tipo inválido
        })
        .expect(400)

      expect(response.body.error).toBe('Dados inválidos')
      expect(response.body.details).toBeDefined()
      console.log('✅ Validação de campos funcionando')
    })
  })

  describe('2️⃣ READ - Buscar Cenários', () => {
    it('deve buscar cenário específico', async () => {
      console.log('🔍 Testando busca de cenário específico...')

      const response = await request(BASE_URL)
        .get(`/api/cenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.id).toBe(scenarioId)
      expect(response.body.name).toBe(scenarioData.name)
      expect(response.body.executions).toBeDefined()
      expect(response.body._count.executions).toBe(0)

      console.log('✅ Cenário específico encontrado')
    })

    it('deve listar cenários da suite', async () => {
      console.log('📋 Testando listagem de cenários da suite...')

      const response = await request(BASE_URL)
        .get(`/api/suites/${suiteId}/cenarios`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('scenarios')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('suiteId', suiteId)
      expect(response.body.scenarios.length).toBeGreaterThanOrEqual(2)

      console.log(`✅ ${response.body.total} cenário(s) encontrado(s) na suite`)
    })

    it('deve permitir acesso do membro do projeto', async () => {
      console.log('🔓 Testando acesso do membro...')

      const response = await request(BASE_URL)
        .get(`/api/cenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200)

      expect(response.body.id).toBe(scenarioId)
      console.log('✅ Membro pode acessar cenário')
    })

    it('deve retornar 404 para cenário inexistente', async () => {
      console.log('❌ Testando cenário inexistente...')

      const response = await request(BASE_URL)
        .get('/api/cenarios/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.error).toBe('Cenário não encontrado')
      console.log('✅ 404 retornado para cenário inexistente')
    })
  })

  describe('3️⃣ UPDATE - Atualizar Cenários', () => {
    it('deve atualizar cenário com sucesso', async () => {
      console.log('✏️ Testando atualização de cenário...')

      const updateData = {
        name: 'Cenário de Login Atualizado',
        preconditions: 'Usuário deve estar na tela de login (atualizado)',
        status: 'in_progress' as const,
        priority: 'critical' as const,
      }

      const response = await request(BASE_URL)
        .put(`/api/cenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.name).toBe(updateData.name)
      expect(response.body.preconditions).toBe(updateData.preconditions)
      expect(response.body.status).toBe(updateData.status)
      expect(response.body.priority).toBe(updateData.priority)

      console.log('✅ Cenário atualizado com sucesso')
    })

    it('deve permitir atribuir cenário para usuário', async () => {
      console.log('👤 Testando atribuição de cenário...')

      const response = await request(BASE_URL)
        .put(`/api/cenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ assignedTo: secondUserId })
        .expect(200)

      expect(response.body.assignedTo).toBe(secondUserId)
      expect(response.body.assignee.id).toBe(secondUserId)

      console.log('✅ Cenário atribuído com sucesso')
    })

    it('deve rejeitar usuário inexistente na atribuição', async () => {
      console.log('❌ Testando usuário inexistente...')

      const response = await request(BASE_URL)
        .put(`/api/cenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ assignedTo: 99999 })
        .expect(404)

      expect(response.body.error).toBe('Usuário atribuído não encontrado')
      console.log('✅ Usuário inexistente rejeitado')
    })
  })

  describe('4️⃣ STATS - Estatísticas do Cenário', () => {
    it('deve obter estatísticas do cenário', async () => {
      console.log('📊 Testando estatísticas do cenário...')

      const response = await request(BASE_URL)
        .get(`/api/cenarios/${scenarioId}/stats`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('totalExecutions', 0)
      expect(response.body).toHaveProperty('statusCount')
      expect(response.body.statusCount).toHaveProperty('pending', 0)
      expect(response.body.statusCount).toHaveProperty('running', 0)
      expect(response.body.statusCount).toHaveProperty('passed', 0)
      expect(response.body.statusCount).toHaveProperty('failed', 0)
      expect(response.body.statusCount).toHaveProperty('blocked', 0)
      expect(response.body).toHaveProperty('maxExecutionRound', 0)

      console.log('✅ Estatísticas obtidas com sucesso')
    })
  })

  describe('5️⃣ DUPLICATE - Duplicar Cenário', () => {
    it('deve duplicar cenário com sucesso', async () => {
      console.log('📋 Testando duplicação de cenário...')

      const response = await request(BASE_URL)
        .post(`/api/cenarios/${scenarioId}/duplicate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)

      expect(response.body.name).toBe('Cenário de Login Atualizado (Cópia)')
      expect(response.body.preconditions).toBe(
        'Usuário deve estar na tela de login (atualizado)'
      )
      expect(response.body.suiteId).toBe(suiteId)
      expect(response.body.status).toBe('pending')
      expect(response.body.assignedTo).toBeNull()

      console.log('✅ Cenário duplicado com sucesso')
    })
  })

  describe('6️⃣ PERMISSIONS - Controle de Acesso', () => {
    it('deve negar acesso a usuário não autorizado', async () => {
      console.log('🚫 Testando acesso não autorizado...')

      // Criar novo usuário não membro do projeto
      const unauthorizedUser = {
        email: `test-unauthorized-${Date.now()}@exemplo.com`,
        password: '123456',
        fullName: 'Usuário Não Autorizado',
      }

      const unauthorizedResponse = await request(BASE_URL)
        .post('/api/auth/register')
        .send(unauthorizedUser)
        .expect(201)

      const response = await request(BASE_URL)
        .get(`/api/cenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${unauthorizedResponse.body.accessToken}`)
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para acessar este cenário'
      )
      console.log('✅ Acesso negado para usuário não autorizado')
    })

    it('deve negar atualização por usuário sem permissão', async () => {
      console.log('🚫 Testando atualização sem permissão...')

      // Remover segundo usuário do projeto
      await request(BASE_URL)
        .delete(`/api/projects/${projectId}/members/${secondUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const response = await request(BASE_URL)
        .put(`/api/cenarios/${scenarioId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ name: 'Tentativa de hack' })
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para editar este cenário'
      )
      console.log('✅ Atualização negada sem permissão')
    })
  })

  describe('7️⃣ DELETE - Excluir Cenários', () => {
    it('deve excluir cenário sem execuções', async () => {
      console.log('🗑️ Testando exclusão de cenário...')

      // Buscar um cenário duplicado para excluir
      const suiteScenariosResponse = await request(BASE_URL)
        .get(`/api/suites/${suiteId}/cenarios`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const duplicatedScenario = suiteScenariosResponse.body.scenarios.find(
        (s: any) => s.name.includes('(Cópia)')
      )

      const response = await request(BASE_URL)
        .delete(`/api/cenarios/${duplicatedScenario.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.message).toBe('Cenário excluído com sucesso')
      console.log('✅ Cenário excluído com sucesso')
    })

    it('cenário excluído não deve mais existir', async () => {
      console.log('❌ Verificando exclusão...')

      const suiteScenariosResponse = await request(BASE_URL)
        .get(`/api/suites/${suiteId}/cenarios`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const duplicatedScenario = suiteScenariosResponse.body.scenarios.find(
        (s: any) => s.name.includes('(Cópia)')
      )

      expect(duplicatedScenario).toBeUndefined()
      console.log('✅ Cenário não existe mais após exclusão')
    })
  })

  describe('8️⃣ EDGE CASES - Casos Especiais', () => {
    it('deve validar IDs inválidos', async () => {
      console.log('🔢 Testando IDs inválidos...')

      const response = await request(BASE_URL)
        .get('/api/cenarios/abc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      expect(response.body.error).toBe('ID do cenário inválido')
      console.log('✅ IDs inválidos rejeitados')
    })

    it('deve manter ordem dos cenários', async () => {
      console.log('📊 Verificando ordenação dos cenários...')

      const response = await request(BASE_URL)
        .get(`/api/suites/${suiteId}/cenarios`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const scenarios = response.body.scenarios
      expect(scenarios.length).toBeGreaterThanOrEqual(1)

      // Verificar que estão ordenados por scenarioOrder
      for (let i = 0; i < scenarios.length - 1; i++) {
        expect(scenarios[i].scenarioOrder).toBeLessThanOrEqual(
          scenarios[i + 1].scenarioOrder
        )
      }

      console.log('✅ Ordenação mantida corretamente')
    })
  })
})
