# Contexto do Projeto Magna MVP

## 📋 Instruções Obrigatórias para Claude

**SEMPRE leia TODOS os arquivos `.md` da pasta `.claude/context/` antes de trabalhar em qualquer funcionalidade relacionada à API.**

## 📁 Arquitetura de Contexto

### `.claude/context/architectureAPIflow.md`
**[OBRIGATÓRIO]** - Leia este arquivo para entender:
- Diagrama completo da arquitetura API
- Fluxo de dados entre camadas
- Princípios fundamentais (Never Skip Layers, Single Responsibility)
- Padrões de implementação
- Estrutura de pastas
- Tratamento de erros padronizado

## 🎯 Arquitetura Resumida

```
HTTP → Route → Controller → Service → DatabaseOps → Prisma → SQLite
```

### Responsabilidades por Camada:
- **Route**: Apenas roteamento HTTP
- **Controller**: Validação, tratamento de erros, formatação HTTP
- **Service**: Lógica de negócio, regras de domínio
- **DatabaseOps**: Abstração CRUD genérica e reutilizável

## 🚫 NUNCA Faça:
- Routes acessando Prisma diretamente
- Controllers com lógica de negócio
- Services acessando Prisma diretamente
- Pular camadas da arquitetura

## ✅ SEMPRE Faça:
- Seguir o fluxo completo de camadas
- Reutilizar Services existentes quando possível
- Usar DatabaseOperations para acesso a dados
- Implementar tratamento de erros nos Controllers
- Validar entrada com Zod nos Controllers

## 🛠️ Comandos Úteis

### Prisma
```bash
npx prisma generate      # Gerar cliente após mudanças no schema
npx prisma db push      # Sincronizar schema com banco
npx prisma studio       # Interface gráfica do banco
```

### Desenvolvimento
```bash
npm run dev            # Servidor de desenvolvimento
npm run build         # Build para produção
npm run lint          # Verificar linting
```

## 📂 Estrutura do Projeto

```
src/
├── app/api/[domain]/
│   ├── [domain].service.ts     # Lógica de negócio
│   ├── [domain].controller.ts  # Controle HTTP
│   ├── route.ts               # Rotas da coleção
│   └── [id]/route.ts         # Rotas por ID
├── lib/
│   ├── database/
│   │   ├── operations.ts      # CRUD genérico
│   │   └── models.ts         # Instâncias por domínio
│   ├── db.ts                 # Cliente Prisma
│   ├── validations.ts        # Schemas Zod
│   └── utils.ts             # Utilitários
└── components/              # Componentes React organizados por setor
```

## 🔄 Fluxo para Novas Features

1. **Leia** `.claude/context/architectureAPIflow.md`
2. **Crie** Service com lógica de negócio
3. **Crie** Controller com validações HTTP
4. **Crie** Route apenas com roteamento
5. **Reutilize** DatabaseOperations existentes
6. **Implemente** tratamento de erros padronizado
7. **Teste** seguindo o fluxo completo

## 🎨 Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Frontend**: React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco**: SQLite + Prisma ORM
- **Validação**: Zod
- **Estilo**: Tailwind CSS

---

> ⚠️ **IMPORTANTE**: Antes de implementar qualquer funcionalidade de API, SEMPRE consulte `.claude/context/architectureAPIflow.md` para garantir que está seguindo a arquitetura correta.