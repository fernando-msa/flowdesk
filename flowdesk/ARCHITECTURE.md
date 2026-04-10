# FlowDesk — Arquitetura Técnica

## Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, Server Actions, Route Handlers — fullstack sem overhead |
| Linguagem | TypeScript (strict) | Tipagem forte, contratos claros entre camadas |
| Estilo | Tailwind CSS + shadcn/ui | Componentes prontos, design system consistente |
| Banco | PostgreSQL | Relacional, robusto, pronto para produção |
| ORM | Prisma | Schema declarativo, migrations, type-safety total |
| Auth | NextAuth v5 (Auth.js) | Session, JWT, providers, RBAC integrado |
| Validação | Zod | Schemas compartilhados entre frontend e backend |
| Upload | Uploadthing / S3-compatible | Abstração simples, CDN-ready |
| Gráficos | Recharts | Leve, customizável, declarativo |
| Estado | Zustand + React Query | Server state com RQ, client state com Zustand |
| Email | Resend + React Email | Transacional moderno, templates em React |

## Princípios Arquiteturais

### Separação de camadas
```
Request → Route Handler / Server Action
       → Service Layer (regras de negócio)
       → Repository Layer (acesso a dados via Prisma)
       → Database (PostgreSQL)
```

### Multi-tenant preparado
- Toda entidade principal tem `companyId`
- Middleware valida tenant por sessão
- Isolamento de dados por `companyId` em todas as queries

### RBAC
- Roles: ADMIN | MANAGER | ANALYST | REQUESTER
- Permissões verificadas na Service Layer (não apenas no frontend)
- Middleware de auth protege todas as rotas `/app/*`

## Padrões de código

- DTOs com Zod para input/output
- Erros tipados e tratados de forma consistente
- Nomes em inglês no código, português nos textos visíveis
- Sem regra de negócio em componentes React
- Sem chamadas diretas ao Prisma fora dos repositories
