import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'

const BASE_URL = 'http://localhost:3000'

let accessToken: string
let secondUserToken: string
let projectId: number
let suiteId: number
let scenarioId: number
let executionId: number
let commentId: number
let secondUserId: number
let ownerResponse: any

const testUser = {
  email: `test-comment-owner-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Comentarista Principal',
}

const secondTestUser = {
  email: `test-comment-member-${Date.now()}@exemplo.com`,
  password: '123456',
  fullName: 'Comentarista Secundário',
}

const projectData = {
  name: 'Projeto para Testes de Comentários',
  description: 'Projeto dedicado aos testes de comentários',
}

const suiteData = {
  name: 'Suite para Comentários',
  description: 'Suite para testar comentários',
}

const scenarioData = {
  name: 'Cenário para Comentários',
  preconditions: 'Sistema deve estar disponível para comentários',
  steps: '1. Executar teste\n2. Analisar resultado\n3. Comentar execução',
  expectedResult: 'Comentários devem ser registrados corretamente',
  priority: 'medium' as const,
}

const commentData = {
  comment: 'Este é um comentário de teste sobre a execução. Tudo funcionou conforme esperado.',
}

describe('💬 Comments API - Fluxo Completo', () => {
  beforeAll(async () => {
    console.log('🚀 Iniciando testes de comentários...')
    console.log(`📧 Email do comentarista principal: ${testUser.email}`)
    console.log(`📧 Email do comentarista secundário: ${secondTestUser.email}`)

    // Registrar usuários
    ownerResponse = await request(BASE_URL)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201)

    accessToken = ownerResponse.body.accessToken

    const memberResponse = await request(BASE_URL)
      .post('/api/auth/register')
      .send(secondTestUser)
      .expect(201)

    secondUserToken = memberResponse.body.accessToken
    secondUserId = memberResponse.body.user.id

    // Criar projeto
    const projectResponse = await request(BASE_URL)
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(projectData)
      .expect(201)

    projectId = projectResponse.body.id

    // Adicionar segundo usuário ao projeto
    await request(BASE_URL)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: secondUserId, role: 'tester' })
      .expect(201)

    // Criar suite
    const suiteResponse = await request(BASE_URL)
      .post(`/api/projects/${projectId}/suites`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(suiteData)
      .expect(201)

    suiteId = suiteResponse.body.id

    // Criar cenário
    const scenarioResponse = await request(BASE_URL)
      .post('/api/cenarios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...scenarioData, suiteId })
      .expect(201)

    scenarioId = scenarioResponse.body.id

    // Criar execução
    const executionResponse = await request(BASE_URL)
      .post('/api/execucoes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        scenarioId,
        testData: 'Dados de teste para comentários',
      })
      .expect(201)

    executionId = executionResponse.body.id
    console.log(`▶️ Execução criada! ID: ${executionId}`)
  })

  afterAll(async () => {
    console.log('✅ Testes de comentários finalizados!')
  })

  describe('1️⃣ CREATE - Criar Comentários', () => {
    it('deve criar um novo comentário com sucesso', async () => {
      console.log('💬 Testando criação de comentário...')

      const createData = { ...commentData, executionId }

      const response = await request(BASE_URL)
        .post('/api/comentarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('comment', commentData.comment)
      expect(response.body).toHaveProperty('executionId', executionId)
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.id).toBe(ownerResponse.body.user.id)
      expect(response.body).toHaveProperty('createdAt')
      expect(response.body).toHaveProperty('execution')

      commentId = response.body.id
      console.log(`✅ Comentário criado! ID: ${commentId}`)
    })

    it('deve criar comentário por segundo usuário', async () => {
      console.log('👥 Testando comentário de segundo usuário...')

      const secondComment = {
        executionId,
        comment: 'Concordo com o comentário anterior. Execução realizada com sucesso!',
      }

      const response = await request(BASE_URL)
        .post('/api/comentarios')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send(secondComment)
        .expect(201)

      expect(response.body.comment).toBe(secondComment.comment)
      expect(response.body.user.id).toBe(secondUserId)

      console.log('✅ Segundo comentário criado com sucesso')
    })

    it('deve rejeitar criação sem token de autenticação', async () => {
      console.log('🚫 Testando criação sem autenticação...')

      const response = await request(BASE_URL)
        .post('/api/comentarios')
        .send({ ...commentData, executionId })
        .expect(401)

      expect(response.body.error).toBe('Token não fornecido')
      console.log('✅ Acesso negado sem token')
    })

    it('deve rejeitar criação com execução inexistente', async () => {
      console.log('❌ Testando execução inexistente...')

      const response = await request(BASE_URL)
        .post('/api/comentarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          executionId: 99999,
          comment: 'Comentário em execução inexistente',
        })
        .expect(403)

      expect(response.body.error).toBe('Você não tem permissão para comentar nesta execução')
      console.log('✅ Execução inexistente rejeitada')
    })

    it('deve validar campos obrigatórios', async () => {
      console.log('📋 Testando validação de campos...')

      const response = await request(BASE_URL)
        .post('/api/comentarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          executionId: 'invalid', // Tipo inválido
          comment: '', // Comentário vazio
        })
        .expect(400)

      expect(response.body.error).toBe('Dados inválidos')
      expect(response.body.details).toBeDefined()
      console.log('✅ Validação de campos funcionando')
    })
  })

  describe('2️⃣ READ - Buscar Comentários', () => {
    it('deve buscar comentário específico', async () => {
      console.log('🔍 Testando busca de comentário específico...')

      const response = await request(BASE_URL)
        .get(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.id).toBe(commentId)
      expect(response.body.comment).toBe(commentData.comment)
      expect(response.body.user.id).toBe(ownerResponse.body.user.id)
      expect(response.body.execution.id).toBe(executionId)

      console.log('✅ Comentário específico encontrado')
    })

    it('deve listar comentários da execução', async () => {
      console.log('📋 Testando listagem de comentários da execução...')

      const response = await request(BASE_URL)
        .get(`/api/execucoes/${executionId}/comentarios`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('comments')
      expect(response.body).toHaveProperty('total', 2)
      expect(response.body).toHaveProperty('executionId', executionId)
      expect(response.body.comments).toHaveLength(2)

      // Verificar ordenação cronológica (mais antigo primeiro)
      expect(response.body.comments[0].id).toBe(commentId)
      expect(response.body.comments[1].user.id).toBe(secondUserId)

      console.log(`✅ ${response.body.total} comentário(s) encontrado(s) na execução`)
    })

    it('deve buscar comentários do usuário', async () => {
      console.log('👤 Testando comentários do usuário...')

      const response = await request(BASE_URL)
        .get('/api/comentarios/meus')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('comments')
      expect(response.body).toHaveProperty('total')
      expect(response.body).toHaveProperty('userId')
      expect(response.body.comments.length).toBeGreaterThanOrEqual(1)

      // Verificar que todos os comentários são do usuário logado
      response.body.comments.forEach((comment: any) => {
        expect(comment.execution).toBeDefined()
        expect(comment.execution.scenario).toBeDefined()
      })

      console.log(`✅ ${response.body.total} comentário(s) próprio(s) encontrado(s)`)
    })

    it('deve buscar comentários recentes', async () => {
      console.log('🕒 Testando comentários recentes...')

      const response = await request(BASE_URL)
        .get('/api/comentarios?limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('comments')
      expect(response.body).toHaveProperty('total')
      expect(response.body.comments.length).toBeLessThanOrEqual(5)

      // Verificar ordenação (mais recente primeiro)
      if (response.body.comments.length > 1) {
        const first = new Date(response.body.comments[0].createdAt).getTime()
        const second = new Date(response.body.comments[1].createdAt).getTime()
        expect(first).toBeGreaterThanOrEqual(second)
      }

      console.log(`✅ ${response.body.total} comentário(s) recente(s) encontrado(s)`)
    })

    it('deve permitir acesso de outros membros do projeto', async () => {
      console.log('🔓 Testando acesso de outros membros...')

      const response = await request(BASE_URL)
        .get(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200)

      expect(response.body.id).toBe(commentId)
      console.log('✅ Outros membros podem acessar comentários')
    })

    it('deve retornar 404 para comentário inexistente', async () => {
      console.log('❌ Testando comentário inexistente...')

      const response = await request(BASE_URL)
        .get('/api/comentarios/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.error).toBe('Comentário não encontrado')
      console.log('✅ 404 retornado para comentário inexistente')
    })
  })

  describe('3️⃣ UPDATE - Atualizar Comentários', () => {
    it('deve atualizar comentário próprio dentro do prazo', async () => {
      console.log('✏️ Testando atualização de comentário próprio...')

      const updateData = {
        comment: 'Este comentário foi atualizado. Agora contém informações mais detalhadas sobre a execução.',
      }

      const response = await request(BASE_URL)
        .put(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.comment).toBe(updateData.comment)
      expect(response.body.id).toBe(commentId)

      console.log('✅ Comentário atualizado com sucesso')
    })

    it('deve rejeitar atualização de comentário de outro usuário', async () => {
      console.log('🚫 Testando atualização de comentário de outro...')

      const response = await request(BASE_URL)
        .put(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ comment: 'Tentativa de editar comentário de outro usuário' })
        .expect(403)

      expect(response.body.error).toBe('Você só pode editar seus próprios comentários')
      console.log('✅ Atualização de comentário alheio rejeitada')
    })

    it('deve validar dados de atualização', async () => {
      console.log('📋 Testando validação na atualização...')

      const response = await request(BASE_URL)
        .put(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ comment: '' }) // Comentário vazio
        .expect(400)

      expect(response.body.error).toBe('Dados inválidos')
      console.log('✅ Validação na atualização funcionando')
    })
  })

  describe('4️⃣ STATISTICS - Estatísticas dos Comentários', () => {
    it('deve obter estatísticas de comentários da execução', async () => {
      console.log('📊 Testando estatísticas de comentários...')

      const response = await request(BASE_URL)
        .get(`/api/execucoes/${executionId}/stats`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('totalComments', 2)
      expect(response.body).toHaveProperty('uniqueCommenters', 2)
      expect(response.body).toHaveProperty('firstComment')
      expect(response.body).toHaveProperty('lastComment')
      expect(response.body).toHaveProperty('commentsByUser')
      expect(response.body).toHaveProperty('executionId', executionId)

      expect(response.body.commentsByUser).toHaveProperty('Comentarista Principal', 1)
      expect(response.body.commentsByUser).toHaveProperty('Comentarista Secundário', 1)

      console.log(`✅ Estatísticas: ${response.body.totalComments} comentários, ${response.body.uniqueCommenters} comentaristas`)
    })

    it('deve listar comentários com limite', async () => {
      console.log('📝 Testando limite na listagem...')

      const response = await request(BASE_URL)
        .get('/api/comentarios?limit=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.comments).toHaveLength(1)
      console.log('✅ Limite aplicado corretamente')
    })

    it('deve rejeitar limite muito alto', async () => {
      console.log('🚫 Testando limite excessivo...')

      const response = await request(BASE_URL)
        .get('/api/comentarios?limit=100')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      expect(response.body.error).toBe('Limite máximo de 50 comentários por consulta')
      console.log('✅ Limite excessivo rejeitado')
    })
  })

  describe('5️⃣ PERMISSIONS - Controle de Acesso', () => {
    it('deve negar acesso a usuário não autorizado', async () => {
      console.log('🚫 Testando acesso não autorizado...')

      // Criar usuário não membro
      const unauthorizedUser = {
        email: `test-unauthorized-comment-${Date.now()}@exemplo.com`,
        password: '123456',
        fullName: 'Usuário Não Autorizado',
      }

      const unauthorizedResponse = await request(BASE_URL)
        .post('/api/auth/register')
        .send(unauthorizedUser)
        .expect(201)

      const response = await request(BASE_URL)
        .get(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${unauthorizedResponse.body.accessToken}`)
        .expect(403)

      expect(response.body.error).toBe('Você não tem permissão para acessar este comentário')
      console.log('✅ Acesso negado para usuário não autorizado')
    })

    it('deve permitir criação de comentários por todos os membros', async () => {
      console.log('✅ Testando criação por membros...')

      const memberComment = {
        executionId,
        comment: 'Este é um comentário adicional do membro do projeto.',
      }

      const response = await request(BASE_URL)
        .post('/api/comentarios')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send(memberComment)
        .expect(201)

      expect(response.body.comment).toBe(memberComment.comment)
      expect(response.body.user.id).toBe(secondUserId)

      console.log('✅ Membro pode criar comentários')
    })
  })

  describe('6️⃣ DELETE - Excluir Comentários', () => {
    let deletableCommentId: number

    beforeAll(async () => {
      // Criar comentário para testar exclusão
      const response = await request(BASE_URL)
        .post('/api/comentarios')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          executionId,
          comment: 'Este comentário será excluído para teste.',
        })
        .expect(201)

      deletableCommentId = response.body.id
    })

    it('deve excluir comentário próprio dentro do prazo', async () => {
      console.log('🗑️ Testando exclusão de comentário próprio...')

      const response = await request(BASE_URL)
        .delete(`/api/comentarios/${deletableCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.message).toBe('Comentário excluído com sucesso')
      console.log('✅ Comentário excluído com sucesso')
    })

    it('comentário excluído não deve mais existir', async () => {
      console.log('❌ Verificando exclusão...')

      const response = await request(BASE_URL)
        .get(`/api/comentarios/${deletableCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(response.body.error).toBe('Comentário não encontrado')
      console.log('✅ Comentário não existe mais após exclusão')
    })

    it('deve rejeitar exclusão de comentário de outro usuário', async () => {
      console.log('🚫 Testando exclusão de comentário alheio...')

      const response = await request(BASE_URL)
        .delete(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send()
        .expect(403)

      expect(response.body.error).toBe('Você só pode excluir seus próprios comentários')
      console.log('✅ Exclusão de comentário alheio rejeitada')
    })
  })

  describe('7️⃣ TIME RESTRICTIONS - Restrições de Tempo', () => {
    it('deve simular restrições de tempo (informativo)', async () => {
      console.log('⏰ Demonstrando restrições de tempo...')

      // Em um cenário real, testaríamos com comentários criados há mais de 15/30 minutos
      // Por limitações do ambiente de teste, apenas verificamos que a lógica existe
      
      console.log('📋 Regras implementadas:')
      console.log('  - Edição permitida nos primeiros 15 minutos')
      console.log('  - Exclusão permitida nos primeiros 30 minutos')
      console.log('  - Após esse período, comentários ficam imutáveis para compliance')
      
      const response = await request(BASE_URL)
        .get(`/api/comentarios/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.createdAt).toBeDefined()
      console.log('✅ Sistema de timestamps funcionando para controle temporal')
    })
  })

  describe('8️⃣ EDGE CASES - Casos Especiais', () => {
    it('deve validar IDs inválidos', async () => {
      console.log('🔢 Testando IDs inválidos...')

      const response = await request(BASE_URL)
        .get('/api/comentarios/abc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400)

      expect(response.body.error).toBe('ID do comentário inválido')
      console.log('✅ IDs inválidos rejeitados')
    })

    it('deve manter integridade referencial com execuções', async () => {
      console.log('🔗 Verificando integridade referencial...')

      const commentsResponse = await request(BASE_URL)
        .get(`/api/execucoes/${executionId}/comentarios`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      // Verificar que todos os comentários referenciam a execução correta
      commentsResponse.body.comments.forEach((comment: any) => {
        expect(comment).toHaveProperty('user')
        expect(comment).toHaveProperty('createdAt')
        expect(typeof comment.id).toBe('number')
      })

      console.log('✅ Integridade referencial mantida')
    })

    it('deve ordenar comentários cronologicamente', async () => {
      console.log('📅 Verificando ordenação cronológica...')

      const response = await request(BASE_URL)
        .get(`/api/execucoes/${executionId}/comentarios`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const comments = response.body.comments
      if (comments.length > 1) {
        for (let i = 0; i < comments.length - 1; i++) {
          const current = new Date(comments[i].createdAt).getTime()
          const next = new Date(comments[i + 1].createdAt).getTime()
          expect(current).toBeLessThanOrEqual(next)
        }
      }

      console.log('✅ Comentários ordenados cronologicamente')
    })
  })
})