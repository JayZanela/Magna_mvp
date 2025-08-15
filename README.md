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
