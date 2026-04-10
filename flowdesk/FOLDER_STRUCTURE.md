# FlowDesk — Estrutura de Pastas

```
flowdesk/
├── prisma/
│   ├── schema.prisma          # Schema completo do banco
│   ├── migrations/            # Migrations geradas pelo Prisma
│   └── seed.ts                # Seed inicial com dados de exemplo
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Grupo de rotas públicas
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (app)/             # Grupo de rotas protegidas
│   │   │   ├── layout.tsx     # Shell com sidebar + header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx               # Lista de chamados
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx           # Novo chamado
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx           # Detalhe do chamado
│   │   │   ├── checklists/
│   │   │   │   ├── page.tsx               # Gestão de modelos
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx           # Detalhe do modelo
│   │   │   │       └── execute/
│   │   │   │           └── page.tsx       # Execução do checklist
│   │   │   ├── non-conformities/
│   │   │   │   └── page.tsx
│   │   │   ├── knowledge/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── units/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── sectors/
│   │   │   │       └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/               # Route Handlers
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── tickets/
│   │       │   ├── route.ts               # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── route.ts           # GET, PUT, DELETE
│   │       │       ├── comments/
│   │       │       │   └── route.ts
│   │       │       └── attachments/
│   │       │           └── route.ts
│   │       ├── checklists/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── execute/
│   │       │           └── route.ts
│   │       ├── dashboard/
│   │       │   └── route.ts
│   │       ├── knowledge/
│   │       │   └── route.ts
│   │       ├── users/
│   │       │   └── route.ts
│   │       └── upload/
│   │           └── route.ts
│   │
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── AppShell.tsx
│   │   ├── tickets/
│   │   │   ├── TicketCard.tsx
│   │   │   ├── TicketTable.tsx
│   │   │   ├── TicketFilters.tsx
│   │   │   ├── TicketForm.tsx
│   │   │   ├── TicketStatusBadge.tsx
│   │   │   ├── TicketPriorityBadge.tsx
│   │   │   ├── TicketTimeline.tsx
│   │   │   └── CommentBox.tsx
│   │   ├── checklists/
│   │   │   ├── ChecklistTemplateForm.tsx
│   │   │   ├── ChecklistExecutionForm.tsx
│   │   │   └── ChecklistItemInput.tsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── TicketsByStatusChart.tsx
│   │   │   ├── TicketsByPriorityChart.tsx
│   │   │   ├── SLAComplianceChart.tsx
│   │   │   └── TicketTrendChart.tsx
│   │   └── shared/
│   │       ├── DataTable.tsx
│   │       ├── FilterBar.tsx
│   │       ├── PageHeader.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── FileUpload.tsx
│   │
│   ├── lib/                   # Utilitários e configurações
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── utils.ts           # Funções utilitárias gerais
│   │   ├── sla.ts             # Lógica de cálculo de SLA
│   │   ├── permissions.ts     # Helpers de RBAC
│   │   └── validations/       # Schemas Zod
│   │       ├── ticket.ts
│   │       ├── checklist.ts
│   │       ├── user.ts
│   │       └── knowledge.ts
│   │
│   ├── server/                # Lógica exclusiva do servidor
│   │   ├── repositories/      # Acesso a dados (Prisma)
│   │   │   ├── ticket.repository.ts
│   │   │   ├── checklist.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── knowledge.repository.ts
│   │   │   └── dashboard.repository.ts
│   │   └── services/          # Regras de negócio
│   │       ├── ticket.service.ts
│   │       ├── checklist.service.ts
│   │       ├── user.service.ts
│   │       ├── knowledge.service.ts
│   │       └── dashboard.service.ts
│   │
│   ├── hooks/                 # React hooks customizados
│   │   ├── useTickets.ts
│   │   ├── useChecklists.ts
│   │   ├── useDashboard.ts
│   │   └── useAuth.ts
│   │
│   ├── store/                 # Zustand stores (estado client-side)
│   │   ├── ui.store.ts
│   │   └── filters.store.ts
│   │
│   └── types/                 # Types e interfaces globais
│       ├── index.ts
│       ├── ticket.types.ts
│       ├── checklist.types.ts
│       ├── user.types.ts
│       └── next-auth.d.ts     # Extensão de tipos do NextAuth
│
├── public/
│   ├── logo.svg
│   └── icons/
│
├── .env.example
├── .env.local                 # NÃO commitar
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
