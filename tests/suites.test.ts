import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'

const BASE_URL = 'http://localhost:3000'

let accessToken: string
let secondUserToken: string
let projectId: number
let rootSuiteId: number
let childSuiteId: number
let grandChildSuiteId: number

const testUser = {
  email: `test-suite-owner-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Proprietário das Suites',
}

const secondTestUser = {
  email: `test-suite-member-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Membro das Suites',
}

const projectData = {
  name: 'Projeto para Testes de Suites',
  description: 'Projeto dedicado aos testes de suites',
}

const suiteData = {
  name: 'Suite Principal',
  description: 'Suite raiz para testes de hierarquia',
}

describe('📋 Test Suites API - Fluxo Completo', () => {
  beforeAll(async () => {
    console.log('🚀 Iniciando testes de suites de teste...')
    console.log(`📧 Email do owner: ${testUser.email}`)
    console.log(`📧 Email do member: ${secondTestUser.email}`)

    const ownerResponse = await request(BASE_URL)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201)

    accessToken = ownerResponse.body.accessToken
    console.log(`🔑 Token do owner obtido: ${accessToken.substring(0, 20)}...`)

    const memberResponse = await request(BASE_URL)
      .post('/api/auth/register')
      .send(secondTestUser)
      .expect(201)

    secondUserToken = memberResponse.body.accessToken
    console.log(
      `🔑 Token do member obtido: ${secondUserToken.substring(0, 20)}...`
    )

    const projectResponse = await request(BASE_URL)
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(projectData)
      .expect(201)

    projectId = projectResponse.body.id
    console.log(`📁 Projeto criado! ID: ${projectId}`)
  })

  afterAll(async () => {
    console.log('✅ Testes de suites finalizados!')
  })

  describe('1️⃣ CREATE - Criar Suites', () => {
    it('deve criar uma suite raiz com sucesso', async () => {
      console.log('📝 Testando criação de suite raiz...')

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(suiteData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', suiteData.name)
      expect(response.body).toHaveProperty('description', suiteData.description)
      expect(response.body).toHaveProperty('projectId', projectId)
      expect(response.body).toHaveProperty('parentId', null)
      expect(response.body).toHaveProperty('suiteOrder')

      rootSuiteId = response.body.id
      console.log(`✅ Suite raiz criada! ID: ${rootSuiteId}`)
    })

    it('deve criar uma subsuite com sucesso', async () => {
      console.log('📝 Testando criação de subsuite...')

      const childSuiteData = {
        name: 'Subsuite de Funcionalidades',
        description: 'Suite filha para testar hierarquia',
        parentId: rootSuiteId,
      }

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(childSuiteData)
        .expect(201)

      expect(response.body).toHaveProperty('parentId', rootSuiteId)
      expect(response.body).toHaveProperty('name', childSuiteData.name)

      childSuiteId = response.body.id
      console.log(`✅ Subsuite criada! ID: ${childSuiteId}`)
    })

    it('deve criar uma suite neta (3º nível)', async () => {
      console.log('📝 Testando criação de suite neta...')

      const grandChildSuiteData = {
        name: 'Suite de Login',
        description: 'Suite específica para testes de login',
        parentId: childSuiteId,
      }

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(grandChildSuiteData)
        .expect(201)

      expect(response.body).toHaveProperty('parentId', childSuiteId)
      expect(response.body).toHaveProperty('name', grandChildSuiteData.name)

      grandChildSuiteId = response.body.id
      console.log(`✅ Suite neta criada! ID: ${grandChildSuiteId}`)
    })

    it('deve rejeitar criação sem token de autenticação', async () => {
      console.log('🚫 Testando criação sem autenticação...')

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/suites`)
        .send(suiteData)
        .expect(401)

      expect(response.body.error).toBe('Token não fornecido')
      console.log('✅ Acesso negado sem token')
    })

    it('deve rejeitar criação com parent inexistente', async () => {
      console.log('❌ Testando parent inexistente...')

      const invalidSuiteData = {
        name: 'Suite Inválida',
        description: 'Teste com parent inexistente',
        parentId: 99999,
      }

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidSuiteData)
        .expect(400)

      expect(response.body.error).toBe('Suite pai não encontrada')
      console.log('✅ Parent inexistente rejeitado')
    })

    it('deve validar campos obrigatórios', async () => {
      console.log('📋 Testando validação de campos...')

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '', // Nome vazio
          description: 'Suite inválida',
        })
        .expect(400)

      expect(response.body.error).toBe('Dados inválidos')
      expect(response.body.details).toBeDefined()
      console.log('✅ Validação de campos funcionando')
    })
  })

  describe('2️⃣ READ - Buscar Suites', () => {
    it('deve listar suites do projeto em hierarquia', async () => {
      console.log('📋 Testando listagem hierárquica...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('suites')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('projectId', projectId)
      expect(response.body.suites).toHaveLength(1) // Apenas suites raiz
      expect(response.body.total).toBe(1)

      const rootSuite = response.body.suites[0]
      expect(rootSuite.id).toBe(rootSuiteId)
      expect(rootSuite.children).toHaveLength(1)
      expect(rootSuite.children[0].id).toBe(childSuiteId)
      expect(rootSuite.children[0].children).toHaveLength(1)
      expect(rootSuite.children[0].children[0].id).toBe(grandChildSuiteId)

      console.log(
        `✅ Hierarquia correta com ${response.body.total} suite(s) raiz`
      )
    })

    it('deve buscar suite específica com breadcrumb', async () => {
      console.log('🔍 Testando busca de suite específica...')

      const response = await request(BASE_URL)
        .get(`/api/suites/${grandChildSuiteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.id).toBe(grandChildSuiteId)
      expect(response.body.name).toBe('Suite de Login')
      expect(response.body.parentId).toBe(childSuiteId)
      expect(response.body).toHaveProperty('breadcrumb')

      const breadcrumb = response.body.breadcrumb
      expect(breadcrumb).toHaveLength(4) // Projeto > Suite raiz > Subsuite > Suite atual
      expect(breadcrumb[0].type).toBe('project')
      expect(breadcrumb[1].type).toBe('suite')
      expect(breadcrumb[2].type).toBe('suite')
      expect(breadcrumb[3].type).toBe('suite')

      console.log('✅ Breadcrumb gerado corretamente')
    })

    it('deve buscar filhos diretos de uma suite', async () => {
      console.log('👶 Testando busca de filhos diretos...')

      const response = await request(BASE_URL)
        .get(`/api/suites/${childSuiteId}/children`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('children')
      expect(response.body).toHaveProperty('total', 1)
      expect(response.body.children).toHaveLength(1)
      expect(response.body.children[0].id).toBe(grandChildSuiteId)

      console.log('✅ Filhos diretos listados corretamente')
    })

    it('deve negar acesso a suite sem permissão', async () => {
      console.log('🚫 Testando acesso sem permissão...')

      const response = await request(BASE_URL)
        .get(`/api/suites/${rootSuiteId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para acessar esta suite'
      )
      console.log('✅ Acesso negado sem permissão')
    })

    it('deve retornar 404 para suite inexistente', async () => {
      console.log('❌ Testando suite inexistente...')

      const response = await request(BASE_URL)
        .get('/api/suites/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.error).toBe('Suite não encontrada')
      console.log('✅ 404 retornado para suite inexistente')
    })
  })

  describe('3️⃣ UPDATE - Atualizar Suites', () => {
    it('deve atualizar dados da suite', async () => {
      console.log('✏️ Testando atualização de suite...')

      const updateData = {
        name: 'Suite de Login Atualizada',
        description: 'Descrição atualizada da suite de login',
        suiteOrder: 5,
      }

      const response = await request(BASE_URL)
        .put(`/api/suites/${grandChildSuiteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.name).toBe(updateData.name)
      expect(response.body.description).toBe(updateData.description)
      expect(response.body.suiteOrder).toBe(updateData.suiteOrder)

      console.log('✅ Suite atualizada com sucesso')
    })

    it('deve negar atualização por usuário sem permissão', async () => {
      console.log('🚫 Testando atualização sem permissão...')

      const response = await request(BASE_URL)
        .put(`/api/suites/${rootSuiteId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ name: 'Tentativa de hack' })
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para editar esta suite'
      )
      console.log('✅ Atualização negada sem permissão')
    })
  })

  describe('4️⃣ MOVE - Mover Suites na Hierarquia', () => {
    it('deve mover suite para outro parent', async () => {
      console.log('🔄 Testando movimentação de suite...')

      const moveData = {
        newParentId: rootSuiteId, // Mover suite neta diretamente para raiz
        newOrder: 1,
      }

      const response = await request(BASE_URL)
        .put(`/api/suites/${grandChildSuiteId}/move`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(moveData)
        .expect(200)

      expect(response.body.parentId).toBe(rootSuiteId)
      expect(response.body.suiteOrder).toBe(1)

      console.log('✅ Suite movida com sucesso')
    })

    it('deve mover suite para raiz (sem parent)', async () => {
      console.log('🏠 Testando movimentação para raiz...')

      const moveData = {
        newParentId: null,
        newOrder: 0,
      }

      const response = await request(BASE_URL)
        .put(`/api/suites/${childSuiteId}/move`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(moveData)
        .expect(200)

      expect(response.body.parentId).toBe(null)
      expect(response.body.suiteOrder).toBe(0)

      console.log('✅ Suite movida para raiz')
    })

    it('deve rejeitar movimentação que criaria ciclo', async () => {
      console.log('🔄 Testando prevenção de ciclos...')

      const moveData = {
        newParentId: grandChildSuiteId, // Tentar mover suite raiz para sua descendente
      }

      const response = await request(BASE_URL)
        .put(`/api/suites/${rootSuiteId}/move`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(moveData)
        .expect(400)

      expect(response.body.error).toBe(
        'Esta operação criaria um ciclo na hierarquia'
      )
      console.log('✅ Ciclo na hierarquia prevenido')
    })

    it('deve negar movimentação por usuário sem permissão', async () => {
      console.log('🚫 Testando movimentação sem permissão...')

      const response = await request(BASE_URL)
        .put(`/api/suites/${rootSuiteId}/move`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ newOrder: 10 })
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para mover esta suite'
      )
      console.log('✅ Movimentação negada sem permissão')
    })
  })

  describe('5️⃣ PERMISSIONS - Controle de Acesso', () => {
    it('deve permitir acesso após adicionar usuário ao projeto', async () => {
      console.log('👥 Testando acesso após adicionar ao projeto...')

      const secondUserId = (
        await request(BASE_URL)
          .post('/api/auth/signin')
          .send({
            email: secondTestUser.email,
            password: secondTestUser.password,
          })
          .expect(200)
      ).body.user.id

      await request(BASE_URL)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId: secondUserId, role: 'tester' })
        .expect(201)

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200)

      expect(response.body.suites).toBeDefined()
      console.log('✅ Acesso liberado após adicionar ao projeto')
    })
  })

  describe('6️⃣ DELETE - Excluir Suites', () => {
    it('deve rejeitar exclusão de suite com filhos', async () => {
      console.log('🚫 Testando exclusão com filhos...')

      const response = await request(BASE_URL)
        .delete(`/api/suites/${rootSuiteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      expect(response.body.error).toBe(
        'Não é possível excluir uma suite que possui subsuites. Remova as subsuites primeiro.'
      )
      console.log('✅ Exclusão com filhos bloqueada')
    })

    it('deve excluir suite folha (sem filhos)', async () => {
      console.log('🗑️ Testando exclusão de suite folha...')

      const response = await request(BASE_URL)
        .delete(`/api/suites/${grandChildSuiteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.message).toBe('Suite excluída com sucesso')
      console.log('✅ Suite folha excluída')
    })

    it('suite excluída não deve mais existir', async () => {
      console.log('❌ Verificando exclusão...')

      const response = await request(BASE_URL)
        .get(`/api/suites/${grandChildSuiteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.error).toBe('Suite não encontrada')
      console.log('✅ Suite não existe após exclusão')
    })

    it('deve negar exclusão por usuário sem permissão', async () => {
      console.log('🚫 Testando exclusão sem permissão...')

      const response = await request(BASE_URL)
        .delete(`/api/suites/${childSuiteId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para excluir esta suite'
      )
      console.log('✅ Exclusão negada sem permissão')
    })
  })

  describe('7️⃣ EDGE CASES - Casos Especiais', () => {
    it('deve validar IDs inválidos', async () => {
      console.log('🔢 Testando IDs inválidos...')

      const response = await request(BASE_URL)
        .get('/api/suites/abc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      expect(response.body.error).toBe('ID da suite inválido')
      console.log('✅ IDs inválidos rejeitados')
    })

    it('deve tratar projeto inexistente', async () => {
      console.log('📁 Testando projeto inexistente...')

      const response = await request(BASE_URL)
        .get('/api/projects/99999/suites')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403)

      expect(response.body.error).toBe(
        'Você não tem permissão para acessar as suites deste projeto'
      )
      console.log('✅ Projeto inexistente tratado')
    })

    it('deve manter ordenação correta das suites', async () => {
      console.log('📊 Verificando ordenação final...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}/suites`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const suites = response.body.suites
      expect(suites).toHaveLength(2) // childSuite (agora na raiz) + rootSuite

      // Verificar que estão ordenadas por suiteOrder
      if (suites.length > 1) {
        expect(suites[0].suiteOrder).toBeLessThanOrEqual(suites[1].suiteOrder)
      }

      console.log('✅ Ordenação mantida corretamente')
    })
  })
})
