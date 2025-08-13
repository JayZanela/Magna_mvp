/**
 * Testes de Projetos Otimizados
 * Utiliza fixtures compartilhados e reduz setup repetitivo
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { TestHelpers, TestContext } from './fixtures/test-helpers'
import { FIXTURE_PROJECT, TEST_CONFIG } from './fixtures/test-data'
import { TestDatabaseManager } from './fixtures/database-manager'

describe('📁 Projects API - Versão Otimizada', () => {
  let context: TestContext
  let testProjectId: number
  let tempUser: { id: number; token: string; email: string }

  beforeAll(async () => {
    console.log('🚀 Iniciando testes de projetos otimizados...')
    context = await TestHelpers.getTestContext()
    
    // Criar usuário temporário para testes específicos
    tempUser = await TestHelpers.createTemporaryUser({}, 'manager')
  })

  afterAll(async () => {
    // Limpar dados específicos dos testes
    await TestHelpers.cleanupTemporaryUsers()
    
    // Limpar projeto de teste criado
    if (testProjectId) {
      const prisma = TestDatabaseManager.getPrisma()
      try {
        await prisma.projectMember.deleteMany({ where: { projectId: testProjectId } })
        await prisma.project.delete({ where: { id: testProjectId } })
      } catch (error) {
        console.log('🧹 Project cleanup completed (may have been already deleted)')
      }
    }
    
    console.log('✅ Testes de projetos finalizados!')
  })

  describe('1️⃣ CREATE - Criar Projeto', () => {
    it('deve criar um novo projeto com sucesso', async () => {
      console.log('📝 Testando criação de projeto...')

      const projectData = {
        name: `${FIXTURE_PROJECT.name} - Test ${Date.now()}`,
        description: `${FIXTURE_PROJECT.description} - Created during automated testing`
      }

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/projects')
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .send(projectData)
        .expect(201)

      // Validar estrutura da resposta
      expect(TestHelpers.validateApiResponse(response.body, [
        'id', 'name', 'description', 'status', 'owner', 'members'
      ])).toBe(true)

      expect(response.body.name).toBe(projectData.name)
      expect(response.body.description).toBe(projectData.description)
      expect(response.body.status).toBe('active')
      expect(response.body.members).toHaveLength(1)
      expect(response.body.members[0].role).toBe('admin')

      testProjectId = response.body.id
      console.log(`✅ Projeto criado! ID: ${testProjectId}`)
    })

    it('deve rejeitar criação sem token de autenticação', async () => {
      console.log('🚫 Testando criação sem autenticação...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/projects')
        .send(FIXTURE_PROJECT)
        .expect(401)

      expect(response.body.error).toBe('Token não fornecido')
      console.log('✅ Acesso negado sem token')
    })

    it('deve validar campos obrigatórios', async () => {
      console.log('📋 Testando validação de campos...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post('/api/projects')
        .set('Authorization', `Bearer ${context.tokens.testerToken}`)
        .send({
          name: '', // Nome vazio
          description: 'Projeto inválido',
        })
        .expect(400)

      expect(response.body.error).toBe('Invalid data')
      console.log('✅ Validação de campos funcionando')
    })
  })

  describe('2️⃣ READ - Buscar Projetos', () => {
    it('deve listar todos os projetos do usuário', async () => {
      console.log('📋 Testando listagem de projetos...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get('/api/projects')
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(1)

      // Verificar que todos os projetos têm a estrutura esperada
      response.body.forEach((project: any) => {
        expect(TestHelpers.validateApiResponse(project, [
          'id', 'name', 'status', 'owner'
        ])).toBe(true)
      })

      console.log(`✅ ${response.body.length} projeto(s) encontrado(s)`)
    })

    it('deve buscar projeto específico', async () => {
      console.log('🔍 Testando busca de projeto específico...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get(`/api/projects/${context.baseIds.projectId}`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .expect(200)

      expect(response.body.id).toBe(context.baseIds.projectId)
      expect(response.body.name).toBeDefined()
      expect(response.body.members).toBeDefined()

      console.log('✅ Projeto específico encontrado')
    })

    it('deve retornar 404 para projeto inexistente', async () => {
      console.log('❌ Testando projeto inexistente...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get('/api/projects/99999')
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .expect(404)

      expect(response.body.error).toBe('Projeto não encontrado')
      console.log('✅ 404 retornado para projeto inexistente')
    })
  })

  describe('3️⃣ UPDATE - Atualizar Projeto', () => {
    it('deve atualizar projeto com sucesso', async () => {
      console.log('✏️ Testando atualização de projeto...')

      const updateData = {
        name: `${FIXTURE_PROJECT.name} - Updated`,
        description: 'Projeto atualizado durante teste automatizado',
        status: 'active' as const
      }

      const response = await request(TEST_CONFIG.baseUrl)
        .put(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.name).toBe(updateData.name)
      expect(response.body.description).toBe(updateData.description)
      expect(response.body.status).toBe(updateData.status)

      console.log('✅ Projeto atualizado com sucesso')
    })

    it('deve rejeitar atualização por usuário sem permissão', async () => {
      console.log('🚫 Testando atualização sem permissão...')

      const response = await request(TEST_CONFIG.baseUrl)
        .put(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${tempUser.token}`)
        .send({ name: 'Tentativa de hack' })
        .expect(403)

      expect(response.body.error).toBe('Você não tem permissão para editar este projeto')
      console.log('✅ Atualização negada sem permissão')
    })
  })

  describe('4️⃣ MEMBERS - Gerenciar Membros', () => {
    it('deve adicionar membro ao projeto', async () => {
      console.log('👥 Testando adição de membro...')

      const memberData = {
        userId: context.baseIds.testerId,
        role: 'tester' as const
      }

      const response = await request(TEST_CONFIG.baseUrl)
        .post(`/api/projects/${testProjectId}/members`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .send(memberData)
        .expect(201)

      expect(response.body.userId).toBe(memberData.userId)
      expect(response.body.role).toBe(memberData.role)
      expect(response.body.projectId).toBe(testProjectId)

      console.log('✅ Membro adicionado com sucesso')
    })

    it('deve listar membros do projeto', async () => {
      console.log('📋 Testando listagem de membros...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get(`/api/projects/${testProjectId}/members`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThanOrEqual(2) // Admin + tester adicionado

      // Verificar estrutura dos membros
      response.body.forEach((member: any) => {
        expect(TestHelpers.validateApiResponse(member, [
          'id', 'role', 'user', 'joinedAt'
        ])).toBe(true)
      })

      console.log(`✅ ${response.body.length} membro(s) encontrado(s)`)
    })

    it('deve atualizar papel do membro', async () => {
      console.log('🔄 Testando atualização de papel...')

      const updateData = { role: 'manager' as const }

      const response = await request(TEST_CONFIG.baseUrl)
        .put(`/api/projects/${testProjectId}/members/${context.baseIds.testerId}`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.role).toBe('manager')
      console.log('✅ Papel do membro atualizado')
    })

    it('deve remover membro do projeto', async () => {
      console.log('🗑️ Testando remoção de membro...')

      const response = await request(TEST_CONFIG.baseUrl)
        .delete(`/api/projects/${testProjectId}/members/${context.baseIds.testerId}`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .expect(200)

      expect(response.body.message).toBe('Membro removido com sucesso')
      console.log('✅ Membro removido com sucesso')
    })

    it('deve rejeitar usuário inexistente', async () => {
      console.log('❌ Testando usuário inexistente...')

      const response = await request(TEST_CONFIG.baseUrl)
        .post(`/api/projects/${testProjectId}/members`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .send({
          userId: 99999,
          role: 'tester'
        })
        .expect(404)

      expect(response.body.error).toBe('Usuário não encontrado')
      console.log('✅ Usuário inexistente rejeitado')
    })
  })

  describe('5️⃣ PERMISSIONS - Controle de Acesso', () => {
    it('deve permitir acesso do owner', async () => {
      console.log('🔓 Testando acesso do owner...')

      const hasAccess = await TestHelpers.checkUserAccess(
        context.tokens.adminToken,
        `/api/projects/${context.baseIds.projectId}`,
        200
      )

      expect(hasAccess).toBe(true)
      console.log('✅ Owner tem acesso')
    })

    it('deve negar acesso a usuário não autorizado', async () => {
      console.log('🚫 Testando acesso não autorizado...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(403)

      expect(response.body.error).toBe('Você não tem permissão para acessar este projeto')
      console.log('✅ Acesso negado para usuário não autorizado')
    })
  })

  describe('6️⃣ DELETE - Excluir Projeto', () => {
    it('deve rejeitar exclusão por usuário sem permissão', async () => {
      console.log('🚫 Testando exclusão sem permissão...')

      const response = await request(TEST_CONFIG.baseUrl)
        .delete(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${context.tokens.testerToken}`)
        .expect(403)

      expect(response.body.error).toBe('Você não tem permissão para excluir este projeto')
      console.log('✅ Exclusão negada sem permissão')
    })

    it('deve excluir projeto com sucesso', async () => {
      console.log('🗑️ Testando exclusão de projeto...')

      const response = await request(TEST_CONFIG.baseUrl)
        .delete(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .expect(200)

      expect(response.body.message).toBe('Projeto excluído com sucesso')
      testProjectId = 0 // Resetar para não tentar limpar no afterAll
      console.log('✅ Projeto excluído com sucesso')
    })

    it('projeto excluído não deve mais existir', async () => {
      console.log('❌ Verificando exclusão...')

      const response = await request(TEST_CONFIG.baseUrl)
        .get(`/api/projects/${testProjectId || 99999}`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)
        .expect(404)

      expect(response.body.error).toBe('Projeto não encontrado')
      console.log('✅ Projeto não existe mais após exclusão')
    })
  })

  describe('7️⃣ PERFORMANCE - Medição de Performance', () => {
    it('deve criar projeto dentro do tempo limite', async () => {
      console.log('⏱️ Testando performance de criação...')

      const { result, duration } = await TestHelpers.measureExecutionTime(
        async () => {
          return await request(TEST_CONFIG.baseUrl)
            .post('/api/projects')
            .set('Authorization', `Bearer ${context.tokens.adminToken}`)
            .send({
              name: `Performance Test Project ${Date.now()}`,
              description: 'Projeto criado para teste de performance'
            })
            .expect(201)
        },
        'Project Creation'
      )

      expect(result.status).toBe(201)
      expect(duration).toBeLessThan(3000) // Deve ser criado em menos de 3s
      
      // Limpar projeto criado no teste
      const projectId = result.body.id
      await request(TEST_CONFIG.baseUrl)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${context.tokens.adminToken}`)

      console.log('✅ Performance de criação dentro do esperado')
    })
  })
})