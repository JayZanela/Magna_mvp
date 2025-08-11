# Mapeamento de Funcionalidades Backend - Magna

## 📊 **Cenários de Testes**

### **Core Services**
```javascript
// TestScenarioService
- createScenario(projectId, data) 
- updateScenarioStatus(scenarioId, status, evidence)
- getScenariosByProject(projectId)
- linkScenarios(parentId, childId) // Dependências
- cloneScenarioTemplate(templateId, projectId)
```

**Mercado:** Empresas de 100-400 funcionários usam planilhas Excel (como visto no modelo). Empresas de 10k+ usam Jira/Azure DevOps mas sem foco específico em testes. **Gap**: ferramentas especializadas em gerenciamento de teste com hierarquia clara.


---

## 🔄 **Importação**

### **Import Services**
```javascript
// ImportService  
- parseExcelFile(file, mapping) // Suporte a modelos Excel
- validateImportData(data)
- bulkCreateScenarios(scenarios)
- mapColumnsToFields(headers, template)
- generateImportReport(results)
```

**Mercado:** Empresas médias (100-400) sempre começam migrando planilhas existentes. Empresas grandes (10k+) precisam integrar com ALM tools. **Por que não fazem**: ferramentas atuais exigem re-trabalho total, sem aproveitamento.

### **Formatos Suportados**
- Excel (.xlsx) - padrão do mercado médio
- CSV - integração com ferramentas simples  
- JSON/XML - APIs enterprise

---

## 🔗 **Dependência entre Cenários**

### **Dependency Engine**
```javascript
// DependencyService
- createDependency(scenarioId, dependsOnId, type)
- validateDependencyChain(scenarioId) // Evita loops
- getExecutionOrder(projectId)
- notifyDependentScenarios(scenarioId)
- calculateCriticalPath(projectId)
```

**Mercado:** Empresas pequenas/médias executam testes lineares sem controle. Empresas grandes têm isso em ferramentas complexas (Quality Center) mas são caras e burocráticas. **Gap**: solução simples para dependências.

### **Status Flow**
```javascript
DEPENDENCY_TYPES = {
  BLOCKING: 'blocking',        // Deve terminar antes
  SOFT: 'soft',               // Preferível terminar antes  
  DATA_FLOW: 'data_flow'      // Passa dados entre cenários
}
```

---

## 📝 **Dados de Teste**

### **Test Data Management**
```javascript
// TestDataService
- storeTestData(scenarioId, data, dataType)
- getAvailableData(scenarioId) // Dados de cenários predecessores
- linkDataBetweenScenarios(sourceId, targetId, fieldMapping)
- generateTestDataReport(projectId)
- sanitizeTestData(data) // Remove dados sensíveis
```

**Mercado:** Empresas 100-400 funcionários copiam/colam dados manualmente entre testes. Empresas 10k+ usam ferramentas como Mockaroo ou fazem ETL complexo. **Oportunidade**: automação simples do fluxo de dados.

### **Data Types**
```javascript
TEST_DATA_TYPES = {
  USUARIO: 'user_data',
  DOCUMENTO: 'document_number', 
  NOTA_FISCAL: 'invoice_data',
  PRODUTO: 'product_data',
  CUSTOM: 'custom_field'
}
```

---

## 📁 **Área de Documentos**

### **Document Management**
```javascript
// DocumentService
- uploadFile(projectId, file, category)
- linkDocumentToScenario(docId, scenarioId)
- generateDocumentIndex(projectId)
- trackDocumentVersions(docId)
- setDocumentPermissions(docId, permissions)
```

**Mercado:** Empresas médias guardam evidências em pastas do Windows/SharePoint. Empresas grandes usam Confluence + Jira mas sem integração com execução de testes. **Diferencial**: evidências linkadas aos cenários automaticamente.

### **Storage Strategy**
```javascript
DOCUMENT_CATEGORIES = {
  SPECIFICATION: 'specs',
  EVIDENCE: 'evidences', 
  TEMPLATE: 'templates',
  REPORT: 'reports'
}
```

---

## 📈 **Histórico**

### **Audit Trail Service**
```javascript
// HistoryService
- logScenarioChange(scenarioId, change, userId)
- getScenarioHistory(scenarioId)
- generateComplianceReport(projectId, dateRange)
- trackUserActivity(userId, projectId)
- exportAuditTrail(filters)
```

**Mercado:** Empresas 100-400 não têm rastreabilidade nenhuma. Empresas 10k+ exigem por compliance (SOX, ISO). **Vantagem competitiva**: histórico detalhado desde o início, não retrofit.

### **History Events**
```javascript
HISTORY_EVENTS = {
  STATUS_CHANGE: 'status_changed',
  ASSIGNMENT: 'assigned_user', 
  EVIDENCE_ADDED: 'evidence_uploaded',
  DEPENDENCY_CREATED: 'dependency_added',
  RETEST: 'retested'
}
```

---

## 💬 **Comentários**

### **Comments System**
```javascript
// CommentService
- addComment(scenarioId, userId, comment, type)
- getCommentThread(scenarioId)
- mentionUser(comment, userId) // @mentions
- resolveComment(commentId)
- exportComments(scenarioId)
```

**Mercado:** Empresas usam WhatsApp/Slack para discussões sobre testes - informação perdida. Empresas grandes usam Jira mas sem contexto específico do teste. **Oportunidade**: comunicação contextual.

### **Comment Types**
```javascript
COMMENT_TYPES = {
  GENERAL: 'general',
  ISSUE: 'issue',
  SOLUTION: 'solution', 
  QUESTION: 'question'
}
```

---

## 🚀 **APIs de Integração**

### **External Integration**
```javascript
// IntegrationService
- syncWithJira(projectId, jiraConfig)
- pushToAzureDevOps(scenarios, config)
- webhookHandler(source, event, data)
- generateAPIKey(clientId)
- validateExternalAuth(token)
```

**Mercado:** Empresas 100-400 não têm integrações. Empresas 10k+ precisam integrar com ecosystem existente (Jira, Azure, GitLab). **Estratégia**: começar simples, evoluir para enterprise.

---

## 🏗️ **Arquitetura Técnica Recomendada**

### **Tech Stack Para Mercado Brasileiro**
```javascript
Backend: Node.js + Express (rápido para MVP)
Database: PostgreSQL (confiável, JSON support)
File Storage: AWS S3 (escalável, barato)
Cache: Redis (performance)
Queue: Bull/BullMQ (processamento assíncrono)
```

**Por que essa stack?**
- **100-400 funcionários**: Precisa ser barato e simples de hospedar
- **10k+ funcionários**: Precisa escalar e integrar com enterprise tools
- **Cloud-first**: Brasil está migrando para cloud, on-premise está morrendo

### **Pricing Strategy** 
- **Starter (até 50 cenários)**: R$ 99/mês
- **Professional (até 500 cenários)**: R$ 299/mês  
- **Enterprise (ilimitado + integrações)**: R$ 899/mês

**Competitive advantage**: TestRail cobra em USD ($35/usuário), Zephyr é caro demais para médias empresas. Magna seria posicionado como "TestRail brasileiro" com preço justo.

---

## 🎯 **Roadmap de Desenvolvimento**

### **MVP (3 meses)**
1. CRUD de cenários
2. Importação Excel básica
3. Upload de evidências
4. Histórico simples

### **V2 (6 meses)**
1. Dependências entre cenários
2. Fluxo de dados automatizado
3. Comentários e colaboração
4. Dashboard executivo

### **V3 (12 meses)**
1. Integrações (Jira, Azure)
2. API robusta
3. Mobile app
4. Recursos avançados

O segredo é **começar simples** para empresas médias e **evoluir** para enterprise. Mercado brasileiro tem fome de ferramentas nacionais bem feitas e com suporte local.