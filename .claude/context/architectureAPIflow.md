# Arquitetura API - Magna MVP

## 🏗️ Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        🌐 HTTP REQUEST                          │
│                     GET /api/users/123                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  📍 ROUTE LAYER                                                 │
│  ├── /api/users/route.ts        → GET, POST                    │
│  ├── /api/users/[id]/route.ts   → GET, PUT, DELETE             │
│  ├── /api/health/route.ts       → GET                          │
│  │                                                             │
│  RESPONSABILIDADES:                                             │
│  • Apenas roteamento HTTP                                       │
│  • Chama Controller correspondente                              │
│  • NÃO contém lógica de negócio                                │
│  • NÃO acessa banco diretamente                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  🎮 CONTROLLER LAYER                                            │
│  ├── user.controller.ts                                        │
│  ├── health.controller.ts                                      │
│  │                                                             │
│  RESPONSABILIDADES:                                             │
│  • Validação de entrada (Zod schemas)                          │
│  • Parsing de parâmetros (ID, query params)                    │
│  • Tratamento de erros HTTP                                    │
│  • Formatação de resposta JSON                                 │
│  • Status codes apropriados                                    │
│  • NÃO contém lógica de negócio                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  ⚙️ SERVICE LAYER                                               │
│  ├── user.service.ts                                           │
│  ├── auth.service.ts (futuro)                                  │
│  │                                                             │
│  RESPONSABILIDADES:                                             │
│  • Lógica de negócio pura                                      │
│  • Regras de domínio                                           │
│  • Validações de negócio                                       │
│  • Orquestração de operações                                   │
│  • Reutilização entre controllers                              │
│  • NÃO acessa Prisma diretamente                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  🗂️ DATABASE OPERATIONS LAYER                                  │
│  ├── /lib/database/operations.ts                               │
│  ├── /lib/database/models.ts                                   │
│  │                                                             │
│  RESPONSABILIDADES:                                             │
│  • Operações CRUD genéricas                                    │
│  • Abstração total do ORM                                      │
│  • Reutilização entre domínios                                 │
│  • Desacoplamento tecnológico                                  │
│  • Type safety                                                 │
│  • Cache strategies (futuro)                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  🔧 PRISMA CLIENT                                               │
│  • Interface type-safe com banco                               │
│  • Migrations e schema management                              │
│  • Query optimization                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  🗃️ SQLITE DATABASE                                             │
│  • Armazenamento persistente                                   │
│  • ACID compliance                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Reutilização

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  UserController │    │ AuthController  │    │ProductController│
│                 │    │                 │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │     UserService       │
                    │                       │
                    │ • getUserByEmail()    │
                    │ • createUser()        │
                    │ • validateUser()      │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ DatabaseOperations<T> │
                    │                       │
                    │ • findMany()          │
                    │ • findUnique()        │
                    │ • create()            │
                    │ • update()            │
                    │ • delete()            │
                    └───────────────────────┘
```

## 🎯 Princípios Fundamentais

### 1. **Never Skip Layers**
```typescript
// ❌ ERRADO - Route acessando banco diretamente
export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}

// ✅ CORRETO - Seguindo todas as camadas
export async function GET() {
  return await UserController.getUsers()
}
```

### 2. **Single Responsibility**
- **Route**: Apenas roteamento
- **Controller**: HTTP + Validação
- **Service**: Lógica de negócio
- **DatabaseOps**: Operações de banco

### 3. **Dependency Injection**
```typescript
// Services usam DatabaseOperations
class UserService {
  static async createUser(data: UserCreate) {
    return await UserModel.create(data) // UserModel = DatabaseOperations<User>
  }
}
```

### 4. **Reusability First**
```typescript
// Service pode ser usado por múltiplos controllers
class AuthController {
  static async login(email: string) {
    const user = await UserService.getUserByEmail(email) // Reutilização
    // ... lógica de auth
  }
}
```

## 📁 Estrutura de Pastas Padrão

```
/src/app/api/[domain]/
├── [domain].service.ts     # Lógica de negócio
├── [domain].controller.ts  # Controle HTTP
├── route.ts               # GET, POST na coleção
└── [id]/
    └── route.ts          # GET, PUT, DELETE por ID

/src/lib/database/
├── operations.ts          # Classe genérica CRUD
└── models.ts             # Instâncias por domínio

Exemplo:
/src/app/api/users/
├── user.service.ts        # UserService
├── user.controller.ts     # UserController  
├── route.ts              # GET /users, POST /users
└── [id]/
    └── route.ts         # GET /users/123, PUT /users/123
```

## 🛠️ Padrões de Implementação

### A. Criando Novo Endpoint

```typescript
// 1. Criar Service
class ProductService {
  static async getProducts(): Promise<Product[]> {
    return await ProductModel.findMany({}, { createdAt: 'desc' })
  }
}

// 2. Criar Controller
class ProductController {
  static async getProducts(): Promise<NextResponse> {
    try {
      const products = await ProductService.getProducts()
      return NextResponse.json(products)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }
  }
}

// 3. Criar Route
export async function GET() {
  return await ProductController.getProducts()
}
```

### B. Reutilizando Services Existentes

```typescript
class OrderController {
  static async createOrder(request: NextRequest) {
    // Reutilizar UserService para validar usuário
    const user = await UserService.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Criar ordem...
  }
}
```

### C. Estendendo DatabaseOperations

```typescript
// Para operações específicas, estender DatabaseOperations
class UserModel extends DatabaseOperations<User> {
  constructor() {
    super('user')
  }
  
  // Operação específica de usuário
  async findByEmailDomain(domain: string): Promise<User[]> {
    const model = (prisma as any)[this.tableName]
    return await model.findMany({
      where: {
        email: {
          contains: `@${domain}`
        }
      }
    })
  }
}
```

## 🚨 Tratamento de Erros Padronizado

```typescript
// Controller sempre trata erros
static async createUser(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const validatedData = userCreateSchema.parse(body) // Zod validation
    
    const user = await UserService.createUser(validatedData)
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    // Erro de validação Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    // Erro de negócio do Service
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Erro genérico
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

## ✅ Checklist para Novas Features

- [ ] Service criado com lógica de negócio
- [ ] Controller criado com validações HTTP
- [ ] Route criada apenas com roteamento
- [ ] DatabaseOperations reutilizada
- [ ] Tipos TypeScript definidos
- [ ] Validações Zod criadas
- [ ] Tratamento de erros implementado
- [ ] Service reutilizável por outros controllers

## 🔮 Benefícios da Arquitetura

1. **Testabilidade**: Cada camada testada independentemente
2. **Manutenibilidade**: Responsabilidades bem definidas
3. **Reutilização**: Services usados por múltiplos controllers
4. **Flexibilidade**: Fácil troca de ORM sem afetar lógica
5. **Consistência**: Padrão uniforme em toda aplicação
6. **Escalabilidade**: Fácil adicionar novas features
7. **Type Safety**: TypeScript em todas as camadas

---

> 💡 **Lembre-se**: Esta arquitetura evita código espaguete mantendo cada camada com sua responsabilidade específica e promovendo reutilização máxima dos serviços.