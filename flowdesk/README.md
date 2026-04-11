# FlowDesk

> Plataforma SaaS de gestão de chamados internos, checklists operacionais e acompanhamento de SLA para pequenas e médias empresas.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)

---

## Visão geral

O FlowDesk substitui processos desorganizados feitos por WhatsApp, e-mail e planilhas. Centraliza operação, rastreabilidade e métricas em uma plataforma web moderna.

**Módulos do MVP:**
- 🎫 Gestão de chamados com SLA automático
- ✅ Checklists operacionais (diário/semanal/mensal)
- ⚠️ Não conformidades com geração automática de chamado
- 📊 Dashboard com KPIs e gráficos em tempo real
- 📚 Base de conhecimento interna
- 👥 Controle de acesso por perfil (RBAC)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS + shadcn/ui |
| Banco | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth v5 |
| Validação | Zod |
| Gráficos | Recharts |
| Estado servidor | TanStack Query |
| Estado cliente | Zustand |

---

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

---

## Instalação

### 1. Clonar e instalar dependências

```bash
git clone <repo>
cd flowdesk
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/flowdesk?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
```

### 3. Configurar banco de dados

```bash
# Criar e aplicar migrations
npm run db:migrate

# Gerar Prisma Client
npm run db:generate

# Popular com dados de demonstração
npm run db:seed
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Credenciais de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@flowdesk.dev | Admin@123 |
| Gestor | gestor@flowdesk.dev | Gestor@123 |
| Analista | analista@flowdesk.dev | Analista@123 |
| Solicitante | solicitante@flowdesk.dev | Solicitante@123 |

---

## Scripts disponíveis

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Servidor de produção
npm run lint             # ESLint

npm run db:migrate       # Executar migrations (dev)
npm run db:migrate:prod  # Executar migrations (prod)
npm run db:push          # Push schema sem migration (dev rápido)
npm run db:seed          # Popular banco com dados de demo
npm run db:studio        # Abrir Prisma Studio (GUI do banco)
npm run db:reset         # Resetar banco e re-aplicar seed
npm run db:generate      # Regenerar Prisma Client
```

---

## Estrutura do projeto

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Rotas públicas (login)
│   ├── (app)/            # Rotas protegidas
│   └── api/              # Route Handlers
├── components/           # Componentes React
│   ├── ui/               # shadcn/ui base
│   ├── layout/           # AppShell, Sidebar, Header
│   ├── tickets/          # Módulo de chamados
│   ├── checklists/       # Módulo de checklists
│   ├── dashboard/        # Gráficos e KPIs
│   └── shared/           # Componentes reutilizáveis
├── lib/                  # Utilitários e config
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma singleton
│   ├── sla.ts            # Cálculo de SLA
│   ├── permissions.ts    # RBAC helpers
│   └── validations/      # Schemas Zod
└── server/               # Lógica server-only
    ├── repositories/     # Acesso a dados
    └── services/         # Regras de negócio
```

---

## Arquitetura

```
Request
  → Middleware (auth check)
  → Route Handler / Server Component
  → Service Layer (regras de negócio + RBAC)
  → Repository Layer (Prisma queries)
  → PostgreSQL
```

### Multi-tenant

Toda entidade principal tem `companyId`. O isolamento é aplicado em todas as queries na camada de repository. Pronto para evoluir para multi-tenant real com subdomínios e planos.

### RBAC

| Perfil | Chamados | Checklists | Dashboard | Usuários |
|---|---|---|---|---|
| ADMIN | Total | Total | Sim | Sim |
| MANAGER | Equipe/Setor | Gerenciar | Sim | Não |
| ANALYST | Setor/Atribuído | Executar | Sim | Não |
| REQUESTER | Próprios | — | Não | Não |

### SLA por prioridade (padrão)

| Prioridade | Prazo |
|---|---|
| Crítica | 2 horas |
| Alta | 8 horas |
| Média | 24 horas |
| Baixa | 72 horas |

---

## Deploy

### Vercel (recomendado)

```bash
npm run build
# ou conecte o repositório diretamente na Vercel
```

Configure as variáveis de ambiente no painel da Vercel. Para o banco, use **Supabase**, **Neon** ou **Railway** (PostgreSQL gerenciado).

### Docker

```dockerfile
# Exemplo básico
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Roadmap

- [ ] Notificações por e-mail (Resend)
- [ ] Upload de anexos (Uploadthing / S3)
- [ ] Multi-tenant real (subdomínios por empresa)
- [ ] Abertura de chamado por WhatsApp
- [ ] Automações por regra (ex: escalar após X horas)
- [ ] IA para classificação automática de chamados
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] App mobile (React Native)
- [ ] API pública + webhooks
- [ ] Trilha de auditoria avançada

---

## Licença

Privado. Todos os direitos reservados.

