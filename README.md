# Magna MVP

MVP desenvolvido com Next.js, TypeScript, SQLite e Tailwind CSS.

## Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Frontend**: React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite com Prisma ORM
- **Validação**: Zod

## Estrutura do Projeto

```
magna/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # Estilos globais + Tailwind
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx          # Página inicial
│   ├── components/            # Componentes React organizados por setor
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── common/           # Componentes comuns
│   │   └── ui/               # Componentes de UI base
│   ├── lib/                  # Utilitários e configurações
│   ├── services/            # Camada de serviços
│   └── types/               # Tipos TypeScript
├── prisma/                  # Schema e migrações do banco
└── public/                  # Arquivos estáticos
```

## Configuração e Execução

1. **Instalar dependências**:
```bash
npm install
```

2. **Configurar banco de dados**:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. **Executar em desenvolvimento**:
```bash
npm run dev
```

4. **Build para produção**:
```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/health` - Health check da aplicação
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário

## Recursos Implementados

- ✅ Configuração base do Next.js com TypeScript
- ✅ Tailwind CSS configurado
- ✅ Prisma com SQLite
- ✅ API Routes estruturadas
- ✅ Componentes UI básicos
- ✅ Validação com Zod
- ✅ Estrutura organizada por setores
- ✅ Página inicial simples

## Próximos Passos

- [ ] Implementar autenticação completa
- [ ] Criar interface de usuários
- [ ] Adicionar mais funcionalidades específicas do negócio
- [ ] Implementar testes
- [ ] Deploy e configuração de produção