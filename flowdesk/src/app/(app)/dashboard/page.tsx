// Página: Dashboard
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAnalystOrAbove } from '@/lib/permissions'
import { getDashboardStats } from '@/server/services/ticket.service'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { KPICard } from '@/components/shared/KPICard'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { Ticket, CheckSquare, AlertTriangle, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null
  if (!isAnalystOrAbove(session)) redirect('/tickets')

  const { companyId } = session.user

  const [stats, checklistExecutions, nonConformities, openTickets] = await Promise.all([
    getDashboardStats(session.user),
    prisma.checklistExecution.count({ where: { companyId } }),
    prisma.checklistExecutionItem.count({ where: { isNonConformity: true, execution: { companyId } } }),
    prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
  ])

  // Enrich sector names
  const sectorIds = stats.bySector.map((s) => s.sectorId).filter(Boolean) as string[]
  const sectors = sectorIds.length > 0
    ? await prisma.sector.findMany({ where: { id: { in: sectorIds } }, select: { id: true, name: true } })
    : []
  const sectorMap = Object.fromEntries(sectors.map((s) => [s.id, s.name]))

  const byStatusData = stats.byStatus.map((s) => ({
    name: STATUS_LABELS[s.status as keyof typeof STATUS_LABELS] ?? s.status,
    value: s._count.id,
    status: s.status,
  }))

  const byPriorityData = stats.byPriority.map((p) => ({
    name: PRIORITY_LABELS[p.priority as keyof typeof PRIORITY_LABELS] ?? p.priority,
    value: p._count.id,
    priority: p.priority,
  }))

  const bySectorData = stats.bySector.map((s) => ({
    name: sectorMap[s.sectorId!] ?? 'Desconhecido',
    value: s._count.id,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral operacional em tempo real"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total de chamados"
          value={stats.total}
          icon={Ticket}
          variant="info"
          className="col-span-1"
        />
        <KPICard
          title="Abertos agora"
          value={openTickets}
          icon={AlertTriangle}
          variant={openTickets > 10 ? 'warning' : 'default'}
        />
        <KPICard
          title="Resolvidos"
          value={stats.resolved}
          icon={CheckCircle2}
          variant="success"
        />
        <KPICard
          title="Checklists exec."
          value={checklistExecutions}
          icon={CheckSquare}
          variant="default"
        />
        <KPICard
          title="Não conformidades"
          value={nonConformities}
          icon={AlertTriangle}
          variant={nonConformities > 5 ? 'danger' : 'default'}
        />
        <KPICard
          title="SLA dentro do prazo"
          value={`${stats.slaCompliance}%`}
          icon={TrendingUp}
          variant={stats.slaCompliance >= 90 ? 'success' : stats.slaCompliance >= 70 ? 'warning' : 'danger'}
          subtitle={`TM resolução: ${stats.avgResolutionTime}h`}
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        byStatus={byStatusData}
        byPriority={byPriorityData}
        bySector={bySectorData}
        slaCompliance={stats.slaCompliance}
      />
    </div>
  )
}

const STATUS_LABELS = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  WAITING_RESPONSE: 'Aguardando',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
}

const PRIORITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}
