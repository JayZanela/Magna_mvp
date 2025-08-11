# MAGNA - Sistema de Gerenciamento de Testes
## Análise Atual do Schema de Dados - Estado Implementado

### Contexto
Este documento analisa o estado atual do schema implementado no sistema MAGNA. O schema foi totalmente implementado usando Prisma ORM com SQLite como banco de dados.

---

## 📊 TABELAS IMPLEMENTADAS

### 1. **User** (`users`)
**Função**: Gerenciamento de usuários do sistema

**Campos:**
- `id`: PK, auto-incremento
- `email`: Único, obrigatório 
- `passwordHash`: Hash da senha (campo mapeado)
- `fullName`: Nome completo (campo mapeado)
- `role`: Papel no sistema (default: "tester")
- `isActive`: Status ativo (default: true, campo mapeado)
- `createdAt`: Timestamp criação (campo mapeado)

**Índices:**
- `@@index([email])` - Otimiza autenticação e busca por email

**Relacionamentos:**
- 1:N com Project (como owner)
- 1:N com ProjectMember
- 1:N com TestScenario (criador e assignee)
- 1:N com TestExecution
- 1:N com Attachment
- 1:N com ExecutionComment

---

### 2. **Project** (`projects`)
**Função**: Projetos de teste

**Campos:**
- `id`: PK, auto-incremento
- `name`: Nome do projeto
- `description`: Descrição opcional
- `ownerId`: FK para User (campo mapeado)
- `status`: Status (default: "active")
- `createdAt`: Timestamp criação (campo mapeado)
- `updatedAt`: Timestamp atualização (campo mapeado)

**Índices:**
- `@@index([ownerId])` - Performance em consultas por proprietário
- `@@index([status])` - Filtragem rápida por status

**Relacionamentos:**
- N:1 com User (owner)
- 1:N com ProjectMember
- 1:N com TestSuite

---

### 3. **ProjectMember** (`project_members`)
**Função**: Relacionamento usuário-projeto com roles

**Campos:**
- `id`: PK, auto-incremento
- `projectId`: FK para Project (campo mapeado)
- `userId`: FK para User (campo mapeado)
- `role`: Papel no projeto (default: "tester")
- `joinedAt`: Data de entrada (campo mapeado)

**Índices:**
- `@@unique([projectId, userId])` - Evita duplicação de membros

**Relacionamentos:**
- N:1 com User
- N:1 com Project

---

### 4. **TestSuite** (`test_suites`)
**Função**: Organização hierárquica de testes (planos/suites/pastas)

**Campos:**
- `id`: PK, auto-incremento
- `projectId`: FK para Project (campo mapeado)
- `parentId`: FK para TestSuite (campo mapeado, auto-relacionamento)
- `name`: Nome da suite
- `description`: Descrição opcional
- `suiteOrder`: Ordem de exibição (campo mapeado)
- `createdAt`: Timestamp criação (campo mapeado)

**Índices:**
- `@@index([projectId])` - Busca suites por projeto
- `@@index([parentId])` - Navegação hierárquica eficiente

**Relacionamentos:**
- N:1 com Project
- N:1 com TestSuite (parent)
- 1:N com TestSuite (children - auto-relacionamento)
- 1:N com TestScenario

---

### 5. **TestScenario** (`test_scenarios`)
**Função**: Cenários de teste individuais

**Campos:**
- `id`: PK, auto-incremento
- `suiteId`: FK para TestSuite (campo mapeado)
- `name`: Nome do cenário
- `preconditions`: Pré-condições
- `steps`: Passos do teste
- `expectedResult`: Resultado esperado (campo mapeado)
- `assignedTo`: FK para User opcional (campo mapeado)
- `priority`: Prioridade (default: "medium")
- `status`: Status do cenário (default: "pending")
- `scenarioOrder`: Ordem na suite (campo mapeado)
- `createdBy`: FK para User (campo mapeado)
- `createdAt`: Timestamp criação (campo mapeado)
- `updatedAt`: Timestamp atualização (campo mapeado)

**Índices:**
- `@@index([suiteId])` - Listagem por suite
- `@@index([assignedTo])` - Consultas por responsável
- `@@index([status])` - Filtragem por status crítica

**Relacionamentos:**
- N:1 com TestSuite
- N:1 com User (creator)
- N:1 com User (assignee)
- 1:N com TestExecution

---

### 6. **TestExecution** (`test_executions`)
**Função**: Execuções/resultados dos testes

**Campos:**
- `id`: PK, auto-incremento
- `scenarioId`: FK para TestScenario (campo mapeado)
- `executorId`: FK para User (campo mapeado)
- `executionRound`: Número da rodada (campo mapeado)
- `status`: Resultado da execução
- `notes`: Observações
- `testData`: Dados utilizados (campo mapeado)
- `startedAt`: Início da execução (campo mapeado)
- `completedAt`: Fim da execução (campo mapeado)
- `createdAt`: Timestamp criação (campo mapeado)

**Índices:**
- `@@index([scenarioId])` - Histórico por cenário
- `@@index([executorId])` - Consultas por executor
- `@@index([executionRound])` - Controle de rodadas

**Relacionamentos:**
- N:1 com TestScenario
- N:1 com User (executor)
- 1:N com Attachment
- 1:N com ExecutionComment

---

### 7. **Attachment** (`attachments`)
**Função**: Arquivos anexados às execuções

**Campos:**
- `id`: PK, auto-incremento
- `executionId`: FK para TestExecution (campo mapeado)
- `fileName`: Nome do arquivo (campo mapeado)
- `filePath`: Caminho no sistema (campo mapeado)
- `fileType`: Tipo MIME (campo mapeado)
- `fileSize`: Tamanho em bytes (campo mapeado)
- `uploadedBy`: FK para User (campo mapeado)
- `uploadedAt`: Timestamp upload (campo mapeado)

**Índices:**
- `@@index([executionId])` - Busca anexos por execução

**Relacionamentos:**
- N:1 com TestExecution
- N:1 com User (uploader)

---

### 8. **ExecutionComment** (`execution_comments`)
**Função**: Comentários colaborativos nas execuções

**Campos:**
- `id`: PK, auto-incremento
- `executionId`: FK para TestExecution (campo mapeado)
- `userId`: FK para User (campo mapeado)
- `comment`: Texto do comentário
- `createdAt`: Timestamp criação (campo mapeado)

**Índices:**
- Nenhum índice adicional (comentários são sempre buscados por execução)

**Relacionamentos:**
- N:1 com TestExecution
- N:1 com User

---

## 🎯 ESTRATÉGIA DE ÍNDICES

### Índices por Performance
1. **User.email** - Autenticação frequente
2. **Project.ownerId** - Listagem de projetos do usuário
3. **Project.status** - Filtragem por status
4. **TestSuite.projectId** - Navegação por projeto
5. **TestSuite.parentId** - Árvore hierárquica
6. **TestScenario.suiteId** - Listagem de cenários
7. **TestScenario.assignedTo** - Dashboard do usuário
8. **TestScenario.status** - Relatórios de progresso
9. **TestExecution.scenarioId** - Histórico de execuções
10. **TestExecution.executorId** - Atividades do usuário
11. **TestExecution.executionRound** - Controle de versões
12. **Attachment.executionId** - Carregamento de anexos

### Índices Únicos
- **User.email** - Previne emails duplicados
- **ProjectMember.[projectId, userId]** - Evita membros duplicados

---

## 🔗 MAPEAMENTO DE CAMPOS

Todos os campos seguem convenção `camelCase` no Prisma mas são mapeados para `snake_case` no banco:

- `passwordHash` → `password_hash`
- `fullName` → `full_name`
- `isActive` → `is_active`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `ownerId` → `owner_id`
- `projectId` → `project_id`
- `userId` → `user_id`
- `joinedAt` → `joined_at`
- E assim por diante...

---

## 📈 ANÁLISE DE PERFORMANCE

**Consultas Otimizadas:**
- Autenticação de usuários
- Listagem de projetos por proprietário
- Navegação hierárquica de suites
- Filtragem de cenários por status/responsável
- Histórico de execuções
- Carregamento de anexos

**Schema Preparado Para:**
- Relatórios de progresso
- Dashboard de usuários
- Auditoria de atividades
- Controle de versões de teste
- Colaboração em equipe