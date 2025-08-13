/**
 * Dados de teste centralizados e reutilizáveis
 * Evita duplicação de dados entre diferentes arquivos de teste
 */

export interface TestUser {
  email: string
  password: string
  fullName: string
}

export interface TestProject {
  name: string
  description: string
}

export interface TestSuite {
  name: string
  description: string
}

export interface TestScenario {
  name: string
  preconditions: string
  steps: string
  expectedResult: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Usuários base para todos os testes
export const FIXTURE_USERS = {
  admin: {
    email: 'admin@test.magna.com',
    password: '123456',
    fullName: 'Admin de Testes'
  } as TestUser,
  
  tester: {
    email: 'tester@test.magna.com', 
    password: '123456',
    fullName: 'Testador Principal'
  } as TestUser,
  
  manager: {
    email: 'manager@test.magna.com',
    password: '123456', 
    fullName: 'Gerente de Testes'
  } as TestUser,
  
  external: {
    email: 'external@test.magna.com',
    password: '123456',
    fullName: 'Usuário Externo'
  } as TestUser
}

// Projeto padrão para testes
export const FIXTURE_PROJECT: TestProject = {
  name: 'Projeto de Testes Automatizados',
  description: 'Projeto compartilhado para execução de testes automatizados'
}

// Suite padrão para testes
export const FIXTURE_SUITE: TestSuite = {
  name: 'Suite de Testes Base',
  description: 'Suite compartilhada para testes de funcionalidades'
}

// Cenários base para diferentes tipos de teste
export const FIXTURE_SCENARIOS = {
  login: {
    name: 'Cenário de Login',
    preconditions: 'Usuário deve estar na tela de login',
    steps: '1. Inserir email válido\n2. Inserir senha correta\n3. Clicar em Entrar',
    expectedResult: 'Usuário deve ser direcionado para o dashboard principal',
    priority: 'high' as const
  },
  
  cadastro: {
    name: 'Cenário de Cadastro',
    preconditions: 'Sistema deve estar disponível',
    steps: '1. Preencher formulário\n2. Validar dados\n3. Salvar informações',
    expectedResult: 'Registro deve ser criado com sucesso',
    priority: 'medium' as const
  },
  
  payment: {
    name: 'Cenário de Pagamento',
    preconditions: 'Usuário logado com itens no carrinho',
    steps: '1. Revisar pedido\n2. Selecionar forma de pagamento\n3. Confirmar transação',
    expectedResult: 'Pagamento deve ser processado com sucesso',
    priority: 'critical' as const
  },
  
  report: {
    name: 'Cenário de Relatório',
    preconditions: 'Dados devem estar disponíveis',
    steps: '1. Acessar área de relatórios\n2. Selecionar filtros\n3. Gerar relatório',
    expectedResult: 'Relatório deve ser gerado corretamente',
    priority: 'low' as const
  }
}

// Dados de execução para testes
export const FIXTURE_EXECUTION_DATA = {
  browser: 'Chrome 121',
  environment: 'Test Environment',
  notes: 'Execução automatizada de teste',
  testData: 'Dados de teste padronizados'
}

// Comentários padrão para testes
export const FIXTURE_COMMENTS = {
  success: 'Teste executado com sucesso! Todos os critérios foram atendidos.',
  failure: 'Teste falhou devido a erro inesperado. Investigação necessária.',
  approval: 'Aprovado pelo responsável. Pode prosseguir para produção.',
  review: 'Em revisão. Aguardando aprovação do time de qualidade.'
}

// Configurações de teste
export const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  retries: 2,
  database: {
    resetBetweenTests: false,
    cleanupAfterSuite: true
  }
}