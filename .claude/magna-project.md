# Projeto Magna - Sistema de Gerenciamento de Testes

## Sobre o Projeto

Magna é o primeiro software de gerenciamento de testes brasileiro que realmente gerencia testes. Uma plataforma online para gerenciamento de testes de software, tanto manuais quanto automatizados, com foco na simplicidade, completude e satisfação do cliente.

### Por que "Magna"?

A primeira aula de um curso é chamada de aula magna por ser considerada de grande importância. Nas universidades de Portugal, esse termo também é usado para nomear seu salão nobre. O nome Magna representa: **nobre, elegante e responsável por gerenciar uma das etapas mais importantes de um projeto - o teste**.

### Símbolo: O Lobo

O lobo foi escolhido por ser reconhecido como o animal mais metódico do mundo - disciplinado, observador e estratégico. Características essenciais para o gerenciamento eficaz de testes.

## Missão, Visão e Valores

### Missão
Transformar o gerenciamento de testes de sistema em uma tarefa simples de ser cumprida, para os nossos clientes e para os clientes dos nossos clientes.

### Visão
Ser a escolha óbvia para o gerenciamento de testes de sistemas, não importa a área de negócio.

### Valores
- **Simplicidade**: Desejamos tornar simples e prazeroso o processo de gerenciar testes de um projeto
- **Completude**: No papel de uma ferramenta para gerenciamento de testes, nossa busca está em atingir qualidade de forma completa
- **Satisfação do cliente**: Nascemos para resolver a dor da falta de gerenciamento de testes

## Modelo de Negócio

### Proposta de Valor
Oferecer uma ferramenta de gerenciamento de testes que permita a integração nativa com ferramentas de RPA com o objetivo de criar, gerir e acompanhar testes automatizados codeless.

### Fontes de Receita
- Assinatura mensal da ferramenta SaaS
- Oferta de consultoria em automação de testes via RPA

### Segmentação de Clientes
1. **Empresas de desenvolvimento de software de médio e grande porte**
2. **Empresas de qualquer segmento que possuem departamento próprio de TI para desenvolvimento de software**
3. **Empresas de qualquer segmento que possuem GP próprio e terceirizam o desenvolvimento de software**

### Personas
- **Analista de Testes (TI)**
- **Usuário Final do Sistema** (testes integrados)
- **Gerente de Projeto**
- **Diretoria**
- **CTO de empresa de tecnologia**
- **Diretor de TI em empresa de segmentos variados**

## Arquitetura do Sistema

### Estrutura Hierárquica

#### Modelo 1: Múltiplos Planos de Teste
```
PROJETO DE TESTE
├── PLANO DE TESTE A
│   ├── PASTA/SUITE 1
│   │   ├── Cenário 1
│   │   ├── Cenário 2
│   │   └── Cenário 3
│   └── PASTA/SUITE 2
│       ├── Cenário 4
│       ├── Cenário 5
│       └── Cenário 6
└── PLANO DE TESTE B
    ├── PASTA/SUITE 3
    │   ├── Cenário 7
    │   ├── Cenário 8
    │   └── Cenário 9
    └── PASTA/SUITE 4
        ├── Cenário 10
        ├── Cenário 11
        └── Cenário 12
```

#### Modelo 2: Execuções Separadas
```
PROJETO DE TESTE
├── PASTA/SUITE 1
│   ├── Cenário 1 → EXECUÇÃO DE TESTE (Ambiente QAS)
│   ├── Cenário 2 → EXECUÇÃO DE TESTE (Ambiente UAT)
│   └── Cenário 3 → EXECUÇÃO DE TESTE (Ambiente PROD)
└── PASTA/SUITE 2
    ├── Cenário 4 → EXECUÇÃO DE TESTE
    ├── Cenário 5 → EXECUÇÃO DE TESTE
    └── Cenário 6 → EXECUÇÃO DE TESTE
```

### Exemplo Prático
**Projeto**: Notas fiscais de quebra de transporte
- **Ambiente**: Testes em ambiente XPTO
  - **Pasta Trânsito**:
    1. Importação de trânsito
    2. Controle de trânsito da mercadoria
    3. Conferência relatório
  - **Pasta Notas Fiscais**:
    1. Retornos Simbólicos
    2. Faturamento de quebra
    3. Validação XML

## Funcionalidades Core

### 1. Gerenciamento de Usuários e Permissões

#### Tipos de Usuário
- **Administrador Global**: Acesso completo ao sistema
- **Gerente de Projeto**: Acesso completo aos projetos sob sua responsabilidade
- **Analista de Testes**: Acesso aos testes e cenários atribuídos
- **Usuário Convidado/Não Nominal**: Acesso limitado a cenários específicos

#### Sistema de Permissões por Cliente
```
CLIENTE (Empresa contratante)
├── Administrador do Cliente
├── Projetos do Cliente
│   ├── Projeto A
│   │   ├── Gerente do Projeto A
│   │   ├── Analistas do Projeto A
│   │   └── Usuários Convidados do Projeto A
│   └── Projeto B
│       ├── Gerente do Projeto B
│       ├── Analistas do Projeto B
│       └── Usuários Convidados do Projeto B
└── Configurações Globais do Cliente
    ├── Branding personalizado
    ├── URL personalizada (cliente.magna.com.br)
    └── Configurações de notificação
```

### 2. Usuários Não Nominais
**Diferencial de mercado**: Licenças para usuários "convidados" que atuam como clientes responsáveis por testar projetos específicos.

**Permissões limitadas**:
- Visualizar cenários de teste atribuídos
- Atualizar status dos cenários
- Anexar evidências de teste
- Comentar nos cenários

### 3. Dependência entre Cenários
Sistema de interdependência que permite definir que um cenário só pode ser iniciado após a finalização de outro. Exemplo: "Conferência de XML" só pode iniciar após "Emissão de nota fiscal".

### 4. Dados de Teste Compartilhados
Quando há dependência entre cenários, os dados do teste anterior ficam disponíveis para o próximo. Exemplo: número da nota fiscal gerada no primeiro cenário fica disponível para o cenário de conferência.

### 5. Sistema de Notificações
- **Notificação de início**: Usuário é notificado quando seu cenário está apto para execução
- **Notificação de erro**: Responsável pelo projeto é notificado quando um cenário apresenta erro
- **Notificação de conclusão**: Notificação quando cenários são finalizados

### 6. Status Avançados
- **Não Iniciado**
- **Em Execução**
- **Concluído com Sucesso**
- **Erro/Falha**
- **Reteste**: Para mensurar eficiência e rastrear retrabalho
- **Bloqueado**: Aguardando dependência

### 7. Histórico e Auditoria
- Linha do tempo completa de alterações em cada cenário
- Histórico de status e mudanças
- Rastreabilidade completa para compliance
- Métricas de qualidade baseadas no histórico

### 8. Área de Comentários
Espaço livre para anotações e observações em cada cenário de teste.

## Funcionalidades de Gestão

### 1. Modelos de Cenários
Criação de templates reutilizáveis para cenários frequentemente utilizados, economizando tempo na montagem de novos planos de teste.

### 2. Importação e Exportação
- **Importação**: Criação de planos de teste via planilha
- **Exportação**: Geração de documentos PDF ou planilhas para controle gerencial

### 3. Área de Documentos
Repositório centralizado para:
- Documentação do projeto (propostas, especificações)
- Evidências de teste anexadas pelos usuários
- Relatórios e exports

### 4. Dashboards e Relatórios
- Acompanhamento em tempo real do progresso dos testes
- Indicadores de performance e qualidade
- Métricas de eficiência (quantidade de retestes)
- Relatórios gerenciais personalizáveis

## Features Premium

### 1. Aplicativo Mobile
Aplicativo para acompanhamento gerencial em tempo real, permitindo que a diretoria monitore o andamento dos projetos.

### 2. URL Personalizada
Subdomínio personalizado para cada cliente (exemplo: microsoft.magna.com.br), oferecendo maior profissionalismo.

### 3. Visualização Kanban
Interface em kanban para metodologias ágeis, além da visualização em cascata tradicional.

### 4. Provisionamento Rápido
Alocação de usuários para testes em questão de horas, não dias.

## Principais Concorrentes

- Tuskr
- TestCollab
- TestPad
- PractiTest
- Testmo
- Kualitee
- Testlio
- Test Monitor

## Diferencial Competitivo

### Pontos Fortes
1. **Usuários não nominais**: Modelo único de licenciamento para usuários convidados
2. **Dependência entre cenários**: Funcionalidade não comum no mercado
3. **Dados compartilhados**: Passagem automática de dados entre cenários dependentes
4. **Foco no mercado brasileiro**: Produto nacional com suporte local
5. **URL personalizada**: White-label para clientes corporativos
6. **Pricing em moeda nacional**: Sem variação cambial

### Dores do Mercado que Resolvemos
- **Alto custo** das plataformas que cobram por usuário
- **Carência de relatórios** gerenciais adequados
- **Falta de organização** para gerenciar testes com muitos usuários
- **Dificuldade** de obter reports gerenciais
- **Baixa aderência** dos usuários às plataformas complexas

## Plano de Evolução

### Fase 1 - MVP (6 meses)
- Funcionalidades básicas de gerenciamento de testes
- Sistema de usuários e permissões
- Dependência entre cenários
- Dashboards básicos
- Teste de aderência no mercado

### Fase 2 - Consolidação (12 meses)
- Estabelecer presença no mercado
- Funcionalidades completas de gerenciamento
- Aplicativo mobile
- Relatórios avançados
- Área de documentos

### Fase 3 - Automação (18 meses)
- Integração com ferramentas de RPA
- Testes automatizados codeless
- Integrações com ferramentas de desenvolvimento
- Consultoria especializada

## Arquitetura Técnica para MVP

### Stack Tecnológico Recomendado
- **Frontend**: React.js com TypeScript
- **Backend**: Node.js com Express ou Python Django
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT com refresh tokens
- **Deploy**: Docker + AWS/Azure
- **Notificações**: WebSockets + Email (SendGrid/AWS SES)

### Estrutura do Banco de Dados

#### Entidades Principais
```sql
-- Clientes (empresas que contratam o serviço)
Clients
├── id
├── name
├── subdomain (para URL personalizada)
├── plan_type
└── settings (JSON)

-- Usuários
Users
├── id
├── client_id
├── email
├── role (admin, manager, analyst, guest)
├── permissions (JSON)
└── active

-- Projetos
Projects
├── id
├── client_id
├── name
├── description
├── manager_id
└── status

-- Planos de Teste
TestPlans
├── id
├── project_id
├── name
├── environment
└── description

-- Suites/Pastas
TestSuites
├── id
├── test_plan_id
├── name
├── description
└── order

-- Cenários
TestScenarios
├── id
├── test_suite_id
├── name
├── description
├── assigned_user_id
├── status
├── dependencies (JSON array de scenario_ids)
├── test_data (JSON)
└── order

-- Execuções
TestExecutions
├── id
├── scenario_id
├── executor_id
├── status
├── start_time
├── end_time
├── notes
└── evidence_files (JSON array)

-- Histórico
TestHistory
├── id
├── scenario_id
├── user_id
├── action
├── old_value
├── new_value
└── timestamp
```

## Considerações para Empresas por Porte

### Empresas de 100-400 funcionários
- **Usam assim**: Ferramentas simples, muitas vezes planilhas Excel
- **Por que não usam soluções enterprise**: Custo elevado, complexidade desnecessária
- **Nossa oportunidade**: Preço acessível, simplicidade, funcionalidades essenciais

### Empresas de 10k+ funcionários
- **Usam assim**: Soluções enterprise como Jira, Azure DevOps, ferramentas próprias
- **Por que podem migrar**: Funcionalidades específicas (usuários não nominais), flexibilidade, suporte nacional
- **Nossa estratégia**: Integração com ferramentas existentes, funcionalidades premium, suporte dedicado

## Métricas de Sucesso do MVP

### Métricas de Produto
- **Taxa de adoção**: % de usuários ativos mensalmente
- **Tempo de setup**: Tempo para criar primeiro projeto de teste
- **Retention**: % de clientes que renovam após período trial
- **NPS**: Net Promoter Score dos usuários

### Métricas de Negócio
- **CAC**: Custo de Aquisição de Cliente
- **LTV**: Lifetime Value do cliente
- **Churn Rate**: Taxa de cancelamento mensal
- **MRR**: Monthly Recurring Revenue

## Próximos Passos

1. **Validação do MVP** com empresas piloto
2. **Desenvolvimento iterativo** baseado em feedback
3. **Estratégia de go-to-market** focada no mercado brasileiro
4. **Parcerias estratégicas** com empresas de consultoria em TI
5. **Investimento em marketing digital** para geração de leads

---

*Projeto desenvolvido por Cintia Zanela - (47) 99988-7585*