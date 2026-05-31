# FlowDesk

> Plataforma SaaS de gestao de chamados internos, checklists operacionais e acompanhamento de SLA para pequenas e medias empresas.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![License](https://img.shields.io/badge/License-Privado-red)

---

## Funcionalidades

- **Gestao de Chamados** -- criacao, atribuicao e acompanhamento com SLA automatico por prioridade
- **Checklists Operacionais** -- modelos periodicos (diario/semanal/mensal) com geracao automatica de nao conformidades
- **Dashboard com KPIs** -- metricas em tempo real com graficos interativos (Recharts)
- **RBAC com 4 perfis** -- Admin, Gestor, Analista, Solicitante com hierarquia de permissoes
- **Multi-tenant** -- isolamento de dados por empresa em todas as queries (companyId)
- **Base de Conhecimento** -- artigos internos para autoatendimento

---

## Stack Tecnico

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR + Route Handlers fullstack |
| Linguagem | TypeScript 5.x (strict) | Type-safety em toda a cadeia |
| ORM | Prisma 5.x | Schema declarativo, migrations, type-safe |
| Auth | NextAuth v5 (Auth.js) | JWT + RBAC integrado |
| Validacao | Zod | Schemas compartilhados front/back |
| Banco | PostgreSQL | Relacional, robusto, production-ready |
| Estilo | Tailwind CSS + shadcn/ui | Utility-first, design system consistente |
| Testes | Vitest + coverage-v8 | Rapido, ESM-native, cobertura detalhada |
| Upload | Uploadthing | CDN-ready, abstracao simples |
| Estado (server) | TanStack Query v5 | Cache, retry, stale-while-revalidate |
| Estado (client) | Zustand | Leve, sem boilerplate |
| Graficos | Recharts | Declarativo, customizavel |

---

## Arquitetura

```
Request
  -> NextAuth Middleware (auth check + RBAC)
  -> Route Handler / Server Component
  -> Service Layer (regras de negocio + orquestracao)
  -> Repository Layer (Prisma queries isoladas)
  -> PostgreSQL
```

### Camadas

- **Route Handlers** (`src/app/api/`) -- autenticacao, validacao de input com Zod, resposta HTTP
- **Services** (`src/server/services/`) -- regras de negocio, RBAC, orquestracao
- **Repositories** (`src/server/repositories/`) -- queries Prisma sempre escopadas por companyId
- **Validations** (`src/lib/validations/`) -- schemas Zod compartilhados entre front e back

### Multi-tenant

Todas as entidades possuem `companyId`. O isolamento e aplicado em cada query na camada de repository, garantindo que usuarios nunca acessem dados de outras empresas. Preparado para evoluir para multi-tenant real com subdominios.

### RBAC (Role-Based Access Control)

| Perfil | Chamados | Checklists | Dashboard | Usuarios |
|---|---|---|---|---|
| Admin | Todos | Todos | Sim | Sim |
| Gestor | Equipe/Setor | Gerenciar | Sim | Nao |
| Analista | Setor/Atribuido | Executar | Sim | Nao |
| Solicitante | Apenas proprios | -- | Nao | Nao |

### SLA por Prioridade

| Prioridade | Prazo |
|---|---|
| Critica | 2 horas |
| Alta | 8 horas |
| Media | 24 horas |
| Baixa | 72 horas |

---

## Getting Started

### Pre-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm

### Instalacao

```bash
# 1. Clonar e instalar dependencias
git clone <repo>
cd flowdesk
npm install

# 2. Configurar variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais de banco e NEXTAUTH_SECRET

# 3. Configurar banco de dados
npm run db:migrate    # Criar e aplicar migrations
npm run db:generate   # Gerar Prisma Client
npm run db:seed       # Popular com dados de demonstracao

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexao PostgreSQL |
| `NEXTAUTH_URL` | Sim | URL base (ex: http://localhost:3000) |
| `NEXTAUTH_SECRET` | Sim | Segredo do NextAuth (`openssl rand -base64 32`) |
| `UPLOADTHING_SECRET` | Sim | Chave secreta do Uploadthing |
| `UPLOADTHING_APP_ID` | Sim | ID da aplicacao Uploadthing |
| `RESEND_API_KEY` | Nao | Para notificacoes por e-mail (futuro) |

### Credenciais de Demonstracao (apenas desenvolvimento)

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@flowdesk.dev | Admin@123 |
| Gestor | gestor@flowdesk.dev | Gestor@123 |
| Analista | analista@flowdesk.dev | Analista@123 |
| Solicitante | solicitante@flowdesk.dev | Solicitante@123 |

---

## Estrutura do Projeto

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Rotas publicas (login)
│   ├── (app)/            # Rotas protegidas
│   └── api/              # Route Handlers REST
├── components/           # Componentes React
│   ├── ui/               # shadcn/ui base
│   ├── layout/           # AppShell, Sidebar, Header
│   ├── tickets/          # Modulo de chamados
│   ├── checklists/       # Modulo de checklists
│   ├── dashboard/        # Graficos e KPIs
│   └── shared/           # Componentes reutilizaveis
├── lib/                  # Utilitarios e config
│   ├── auth.ts           # NextAuth v5 config
│   ├── prisma.ts         # Prisma singleton
│   ├── sla.ts            # Calculo de SLA
│   ├── permissions.ts    # RBAC helpers
│   ├── api-errors.ts     # Error handler centralizado
│   ├── rate-limit.ts     # Rate limiter in-memory
│   └── validations/      # Schemas Zod
└── server/               # Logica server-only
    ├── repositories/     # Acesso a dados (Prisma)
    └── services/         # Regras de negocio
```

---

## Testes

```bash
npm run test          # Executar testes
npm run test:ci       # Executar com coverage
npm run test:watch    # Modo watch
```

O projeto utiliza Vitest com cobertura via @vitest/coverage-v8. Os testes cobrem:
- Schemas de validacao (Zod)
- Logica de SLA (calculo, status, formatacao)
- Permissoes RBAC (hierarquia, acesso por perfil)
- Repository layer (filtros, paginacao, isolamento multi-tenant)
- Service layer (regras de negocio, restricoes de acesso)

---

## Seguranca

- **Autenticacao** via JWT com sessoes de 8 horas e refresh automatico
- **RBAC** verificado em todas as camadas (middleware + service + repository)
- **Isolamento multi-tenant** por companyId em todas as queries
- **Validacao de input** com Zod em todos os endpoints
- **Security headers** -- CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Rate limiting** no endpoint de autenticacao (5 tentativas por email a cada 15min)
- **Error handler centralizado** com respostas padronizadas (422 para validacao, 403 para permissao, 404 para nao encontrado)

---

## Deploy

### Vercel (recomendado)

```bash
npm run build
# ou conecte o repositorio diretamente na Vercel
```

Configure as variaveis de ambiente no painel da Vercel. Para o banco, use **Supabase**, **Neon** ou **Railway** (PostgreSQL gerenciado).

---

## Roadmap

- [ ] Notificacoes por e-mail (Resend)
- [ ] Multi-tenant real (subdominios por empresa)
- [ ] Abertura de chamado por WhatsApp
- [ ] Automacoes por regra (ex: escalar apos X horas)
- [ ] IA para classificacao automatica de chamados
- [ ] Relatorios exportaveis (PDF/Excel)
- [ ] App mobile (React Native)
- [ ] API publica + webhooks
- [ ] Trilha de auditoria avancada

---

## Licenca

Privado. Todos os direitos reservados.
