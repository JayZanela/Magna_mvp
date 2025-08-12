import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'

const BASE_URL = 'http://localhost:3000'

let accessToken: string
let secondUserToken: string
let projectId: number
let secondUserId: number

const testUser = {
  email: `test-project-owner-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Proprietário do Projeto',
}

const secondTestUser = {
  email: `test-project-member-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Membro do Projeto',
}

const projectData = {
  name: 'Projeto de Teste',
  description: 'Este é um projeto de teste para validar a API',
}

describe('📁 Projects API - Fluxo Completo', () => {
  beforeAll(async () => {
    console.log('🚀 Iniciando testes de projetos...')
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
    secondUserId = memberResponse.body.user.id
    console.log(`🔑 Token do member obtido: ${secondUserToken.substring(0, 20)}...`)
    console.log(`👤 ID do segundo usuário: ${secondUserId}`)
  })

  afterAll(async () => {
    console.log('✅ Testes de projetos finalizados!')
  })

  describe('1️⃣ CREATE - Criar Projeto', () => {
    it('deve criar um novo projeto com sucesso', async () => {
      console.log('📝 Testando criação de projeto...')

      const response = await request(BASE_URL)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(projectData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', projectData.name)
      expect(response.body).toHaveProperty('description', projectData.description)
      expect(response.body).toHaveProperty('status', 'active')
      expect(response.body).toHaveProperty('owner')
      expect(response.body).toHaveProperty('members')
      expect(response.body.members).toHaveLength(1)
      expect(response.body.members[0].role).toBe('admin')

      projectId = response.body.id
      console.log(`✅ Projeto criado! ID: ${projectId}`)
    })

    it('deve rejeitar criação sem token de autenticação', async () => {
      console.log('🚫 Testando criação sem autenticação...')

      const response = await request(BASE_URL)
        .post('/api/projects')
        .send(projectData)
        .expect(401)

      expect(response.body.error).toBe('Token não fornecido')
      console.log('✅ Acesso negado sem token')
    })

    it('deve validar campos obrigatórios', async () => {
      console.log('📋 Testando validação de campos...')

      const response = await request(BASE_URL)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '', // Nome vazio
          description: 'Projeto inválido',
        })
        .expect(400)

      expect(response.body.error).toBe('Dados inválidos')
      expect(response.body.details).toBeDefined()
      console.log('✅ Validação de campos funcionando')
    })
  })

  describe('2️⃣ READ - Buscar Projetos', () => {
    it('deve listar projetos do usuário', async () => {
      console.log('📋 Testando listagem de projetos...')

      const response = await request(BASE_URL)
        .get('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('projects')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('owned')
      expect(response.body).toHaveProperty('member')
      expect(response.body.projects).toHaveLength(1)
      expect(response.body.total).toBe(1)
      expect(response.body.owned).toBe(1)

      console.log(`✅ ${response.body.total} projeto(s) encontrado(s)`)
    })

    it('deve buscar projeto específico', async () => {
      console.log('🔍 Testando busca de projeto específico...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.id).toBe(projectId)
      expect(response.body.name).toBe(projectData.name)
      expect(response.body.description).toBe(projectData.description)

      console.log('✅ Projeto específico encontrado')
    })

    it('deve retornar 404 para projeto inexistente', async () => {
      console.log('❌ Testando projeto inexistente...')

      const response = await request(BASE_URL)
        .get('/api/projects/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.error).toBe('Projeto não encontrado')
      console.log('✅ 404 retornado para projeto inexistente')
    })

    it('deve negar acesso a projeto sem permissão', async () => {
      console.log('🚫 Testando acesso sem permissão...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403)

      expect(response.body.error).toBe('Você não tem permissão para acessar este projeto')
      console.log('✅ Acesso negado sem permissão')
    })
  })

  describe('3️⃣ UPDATE - Atualizar Projeto', () => {
    it('deve atualizar projeto pelo proprietário', async () => {
      console.log('✏️ Testando atualização de projeto...')

      const updateData = {
        name: 'Projeto Atualizado',
        description: 'Descrição atualizada',
        status: 'inactive' as const,
      }

      const response = await request(BASE_URL)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.name).toBe(updateData.name)
      expect(response.body.description).toBe(updateData.description)
      expect(response.body.status).toBe(updateData.status)

      console.log('✅ Projeto atualizado com sucesso')
    })

    it('deve negar atualização por não-proprietário', async () => {
      console.log('🚫 Testando atualização por não-proprietário...')

      const response = await request(BASE_URL)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ name: 'Tentativa de hack' })
        .expect(403)

      expect(response.body.error).toBe('Apenas o proprietário pode editar este projeto')
      console.log('✅ Atualização negada para não-proprietário')
    })
  })

  describe('4️⃣ MEMBERS - Gerenciar Membros', () => {
    it('deve adicionar membro ao projeto', async () => {
      console.log('👥 Testando adição de membro...')

      const memberData = {
        userId: secondUserId,
        role: 'tester' as const,
      }

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(memberData)
        .expect(201)

      expect(response.body.userId).toBe(secondUserId)
      expect(response.body.role).toBe('tester')
      expect(response.body.user).toBeDefined()

      console.log('✅ Membro adicionado com sucesso')
    })

    it('deve listar membros do projeto', async () => {
      console.log('📋 Testando listagem de membros...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2) // Owner + membro adicionado
      console.log(`✅ ${response.body.length} membros encontrados`)
    })

    it('deve permitir que membro acesse o projeto', async () => {
      console.log('🔓 Testando acesso do membro...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200)

      expect(response.body.id).toBe(projectId)
      console.log('✅ Membro pode acessar o projeto')
    })

    it('deve atualizar role do membro', async () => {
      console.log('⬆️ Testando atualização de role...')

      const roleUpdate = {
        role: 'manager' as const,
      }

      const response = await request(BASE_URL)
        .put(`/api/projects/${projectId}/members/${secondUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(roleUpdate)
        .expect(200)

      expect(response.body.role).toBe('manager')
      console.log('✅ Role do membro atualizado')
    })

    it('deve negar adição de membro duplicado', async () => {
      console.log('🚫 Testando adição de membro duplicado...')

      const memberData = {
        userId: secondUserId,
        role: 'tester' as const,
      }

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(memberData)
        .expect(409)

      expect(response.body.error).toBe('Usuário já é membro deste projeto')
      console.log('✅ Membro duplicado rejeitado')
    })

    it('deve negar gerenciamento de membros por não-proprietário', async () => {
      console.log('🚫 Testando gerenciamento por não-proprietário...')

      const memberData = {
        userId: 999,
        role: 'tester' as const,
      }

      const response = await request(BASE_URL)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send(memberData)
        .expect(403)

      expect(response.body.error).toBe('Apenas o proprietário pode adicionar membros')
      console.log('✅ Gerenciamento negado para não-proprietário')
    })
  })

  describe('5️⃣ DELETE - Excluir Recursos', () => {
    it('deve remover membro do projeto', async () => {
      console.log('🗑️ Testando remoção de membro...')

      const response = await request(BASE_URL)
        .delete(`/api/projects/${projectId}/members/${secondUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.message).toBe('Membro removido do projeto com sucesso')
      console.log('✅ Membro removido com sucesso')
    })

    it('membro removido não deve mais ter acesso', async () => {
      console.log('🚫 Verificando remoção de acesso...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403)

      expect(response.body.error).toBe('Você não tem permissão para acessar este projeto')
      console.log('✅ Acesso removido após exclusão')
    })

    it('deve excluir projeto pelo proprietário', async () => {
      console.log('🗑️ Testando exclusão de projeto...')

      const response = await request(BASE_URL)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.message).toBe('Projeto excluído com sucesso')
      console.log('✅ Projeto excluído com sucesso')
    })

    it('projeto excluído não deve mais existir', async () => {
      console.log('❌ Verificando exclusão...')

      const response = await request(BASE_URL)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.error).toBe('Projeto não encontrado')
      console.log('✅ Projeto não existe após exclusão')
    })

    it('deve negar exclusão por não-proprietário', async () => {
      console.log('🚫 Testando exclusão por não-proprietário...')

      const newProjectResponse = await request(BASE_URL)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Projeto para teste de exclusão', description: 'Teste' })
        .expect(201)

      const newProjectId = newProjectResponse.body.id

      await request(BASE_URL)
        .post(`/api/projects/${newProjectId}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId: secondUserId, role: 'tester' })
        .expect(201)

      const response = await request(BASE_URL)
        .delete(`/api/projects/${newProjectId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(403)

      expect(response.body.error).toBe('Apenas o proprietário pode excluir este projeto')
      console.log('✅ Exclusão negada para não-proprietário')

      await request(BASE_URL)
        .delete(`/api/projects/${newProjectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    })
  })

  describe('6️⃣ EDGE CASES - Casos Especiais', () => {
    it('deve validar IDs inválidos', async () => {
      console.log('🔢 Testando IDs inválidos...')

      const response = await request(BASE_URL)
        .get('/api/projects/abc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      expect(response.body.error).toBe('ID do projeto inválido')
      console.log('✅ IDs inválidos rejeitados')
    })

    it('deve tratar usuário inexistente ao adicionar membro', async () => {
      console.log('👤 Testando usuário inexistente...')

      const newProjectResponse = await request(BASE_URL)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Projeto para teste final', description: 'Teste' })
        .expect(201)

      const response = await request(BASE_URL)
        .post(`/api/projects/${newProjectResponse.body.id}/members`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId: 99999, role: 'tester' })
        .expect(404)

      expect(response.body.error).toBe('Usuário não encontrado')
      console.log('✅ Usuário inexistente tratado')

      await request(BASE_URL)
        .delete(`/api/projects/${newProjectResponse.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
    })
  })
})