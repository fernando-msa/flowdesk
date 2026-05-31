<div align="center">

# FlowDesk

**Plataforma SaaS de gestao operacional para empresas**

Gestao de chamados | Checklists operacionais | SLA automatico | Multi-tenant

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.x-6E9F18?logo=vitest&logoColor=white)

</div>

---

## Sobre o projeto

O FlowDesk e uma plataforma web que centraliza a gestao operacional de pequenas e medias empresas. Nasceu da necessidade de substituir processos fragmentados entre WhatsApp, e-mail e planilhas por um sistema rastreavel, com metricas em tempo real e controle de acesso por perfil.

O sistema contempla o ciclo completo de um chamado -- desde a abertura ate o fechamento com SLA monitorado -- e se integra a checklists operacionais que geram nao conformidades automaticamente.

---

## Funcionalidades

**Gestao de Chamados**
- Criacao, atribuicao e acompanhamento com SLA automatico por prioridade
- Historico completo de alteracoes (audit trail)
- Comentarios internos e publicos
- Upload de anexos via CDN

**Checklists Operacionais**
- Modelos com periodicidade (diario, semanal, mensal, sob demanda)
- Execucao com campos tipados (conformidade, texto, numero, data, anexo)
- Geracao automatica de chamados para itens nao conformes

**Dashboard e Metricas**
- KPIs em tempo real (chamados abertos, SLA violado, nao conformidades)
- Graficos interativos com filtros por periodo

**Controle de Acesso (RBAC)**
- 4 hierarquias: Admin > Gestor > Analista > Solicitante
- Permissoes verificadas em todas as camadas (middleware, service, repository)

**Multi-tenant**
- Isolamento de dados por empresa em todas as queries
- Arquitetura preparada para evolucao com subdominios

---

## Arquitetura

```
Request
  -> NextAuth Middleware (autenticacao + RBAC)
  -> Route Handler (validacao de input com Zod)
  -> Service Layer (regras de negocio, orquestracao)
  -> Repository Layer (queries Prisma isoladas por companyId)
  -> PostgreSQL
```

### Camadas

| Camada | Diretorio | Responsabilidade |
|---|---|---|
| Route Handlers | `src/app/api/` | HTTP, autenticacao, validacao de input |
| Services | `src/server/services/` | Regras de negocio, RBAC, orquestracao |
| Repositories | `src/server/repositories/` | Acesso a dados, isolamento multi-tenant |
| Validations | `src/lib/validations/` | Schemas Zod compartilhados front/back |

### Decisoes de Design

- **Schemas Zod compartilhados** entre frontend e backend garantem consistencia de validacao sem duplicacao de codigo
- **Repository pattern** isola o Prisma do restante da aplicacao, facilitando testes e troca de ORM
- **Service layer** concentra regras de negocio e RBAC, mantendo os route handlers finos
- **Error handler centralizado** (`api-errors.ts`) mapeia erros de dominio para HTTP status codes (422, 403, 404, 500)
- **Rate limiting in-memory** no endpoint de autenticacao para prevencao de brute force

---

## Stack Tecnico

| Area | Tecnologia | Por que |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, Route Handlers fullstack, server components |
| Linguagem | TypeScript (strict mode) | Type-safety em toda a cadeia, menos bugs em producao |
| ORM | Prisma 5.x | Schema declarativo, migrations, type-safe queries |
| Autenticacao | NextAuth v5 (Auth.js) | JWT, credentials provider, middleware integrado |
| Validacao | Zod | Schemas compartilhados, inferencia de tipos |
| Banco de dados | PostgreSQL | ACID, robusto, production-ready |
| Estilizacao | Tailwind CSS + shadcn/ui | Design system consistente, utility-first |
| Testes | Vitest + @vitest/coverage-v8 | Rapido, ESM-native, cobertura detalhada |
| Upload de arquivos | Uploadthing | CDN integrado, abstracao simples |
| Estado servidor | TanStack Query v5 | Cache inteligente, retry, stale-while-revalidate |
| Estado cliente | Zustand | Leve, sem boilerplate, ideal para UI state |
| Graficos | Recharts | Declarativo, integrado com React |

---

## Seguranca

| Camada | Pratica |
|---|---|
| Autenticacao | JWT com sessoes de 8 horas, refresh automatico a cada 1 hora |
| Autorizacao | RBAC verificado em middleware, service e repository |
| Isolamento | Multi-tenant por companyId em todas as queries |
| Validacao | Zod em todos os endpoints (422 para dados invalidos) |
| Headers | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Rate limiting | 5 tentativas de login por email a cada 15 minutos |
| Senhas | bcrypt com 12 salt rounds |
| Erros | Handler centralizado, mensagens genericas para o cliente |

---

## Testes

```bash
npm run test          # Executar todos os testes
npm run test:ci       # Executar com relatorio de cobertura
npm run test:watch    # Modo watch para desenvolvimento
```

**Cobertura atual:** 74 testes em 7 arquivos

| Modulo | O que e testado |
|---|---|
| Validations (Zod) | Todos os schemas com inputs validos e invalidos, boundary tests |
| SLA | Calculo de prazo, deteccao de violacao, status, formatacao |
| RBAC | Hierarquia de permissoes, acesso por perfil, isolamento por setor |
| Repository | Filtros, paginacao, isolamento multi-tenant, regressao IDOR |
| Rate Limiter | Limites, reset de janela, isolamento por chave |

---

## Getting Started

### Pre-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm

### Instalacao

```bash
# Clonar repositorio
git clone https://github.com/fernando-msa/flowdesk.git
cd flowdesk

# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Configurar banco de dados
npm run db:migrate    # Criar e aplicar migrations
npm run db:generate   # Gerar Prisma Client
npm run db:seed       # Popular com dados de demonstracao

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

### Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexao PostgreSQL |
| `NEXTAUTH_URL` | Sim | URL base da aplicacao |
| `NEXTAUTH_SECRET` | Sim | Segredo para assinatura de JWT |
| `UPLOADTHING_SECRET` | Sim | Chave de API do Uploadthing |
| `UPLOADTHING_APP_ID` | Sim | ID da aplicacao Uploadthing |
| `RESEND_API_KEY` | Nao | Chave de API do Resend (notificacoes futuras) |

### Credenciais de Demonstracao

Disponiveis apenas em ambiente de desenvolvimento (via `npm run db:seed`):

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
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas publicas (login)
│   ├── (app)/                  # Rotas protegidas (dashboard, tickets, etc.)
│   └── api/                    # Route Handlers REST
├── components/                 # Componentes React
│   ├── ui/                     # Primitivos UI (shadcn/ui)
│   ├── layout/                 # AppShell, Sidebar, Header
│   ├── tickets/                # Modulo de chamados
│   ├── checklists/             # Modulo de checklists
│   ├── dashboard/              # Graficos e KPIs
│   └── shared/                 # Componentes reutilizaveis
├── lib/                        # Utilitarios e configuracao
│   ├── auth.ts                 # Configuracao do NextAuth v5
│   ├── prisma.ts               # Singleton do Prisma Client
│   ├── sla.ts                  # Calculo e formatacao de SLA
│   ├── permissions.ts          # Funcoes auxiliares de RBAC
│   ├── api-errors.ts           # Error handler centralizado
│   ├── rate-limit.ts           # Rate limiter in-memory
│   └── validations/            # Schemas Zod (tickets, checklists, users, settings)
└── server/                     # Logica exclusiva do servidor
    ├── repositories/           # Camada de acesso a dados (Prisma)
    └── services/               # Regras de negocio e orquestracao
```

---

## Deploy

### Vercel (recomendado)

Conecte o repositorio diretamente na [Vercel](https://vercel.com) ou faca o build manual:

```bash
npm run build
```

Para o banco de dados, utilize um provedor gerenciado como **Supabase**, **Neon** ou **Railway**.

---

## Roadmap

- [ ] Notificacoes por e-mail (Resend)
- [ ] Multi-tenant real com subdominios por empresa
- [ ] Abertura de chamado via WhatsApp
- [ ] Automacoes por regras (escalar apos X horas sem resposta)
- [ ] Classificacao automatica de chamados com IA
- [ ] Relatorios exportaveis (PDF/Excel)
- [ ] Aplicativo mobile (React Native)
- [ ] API publica com autenticacao por API key + webhooks
- [ ] Trilha de auditoria avancada

---

## Licenca

Projeto privado. Todos os direitos reservados.

---

<div align="center">

**Fernando S. De Santana Junior**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/fernando-msa)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/fernando-msa)

</div>
