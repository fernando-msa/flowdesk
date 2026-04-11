// Página: Gestão de Checklists
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAnalystOrAbove } from '@/lib/permissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { Plus, ClipboardList, Play, Calendar } from 'lucide-react'

export const metadata: Metadata = { title: 'Checklists' }

const PERIODICITY_LABELS = {
  DAILY:     'Diário',
  WEEKLY:    'Semanal',
  MONTHLY:   'Mensal',
  ON_DEMAND: 'Sob demanda',
}

const PERIODICITY_COLORS = {
  DAILY:     'bg-blue-50 text-blue-700',
  WEEKLY:    'bg-purple-50 text-purple-700',
  MONTHLY:   'bg-emerald-50 text-emerald-700',
  ON_DEMAND: 'bg-gray-100 text-gray-600',
}

export default async function ChecklistsPage() {
  const session = await auth()
  if (!session?.user) return null
  if (!isAnalystOrAbove(session)) redirect('/tickets')

  const templates = await prisma.checklistTemplate.findMany({
    where: { companyId: session.user.companyId, isActive: true },
    include: {
      sector: { select: { name: true } },
      unit: { select: { name: true } },
      _count: { select: { items: true, executions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-5">
      <PageHeader title="Checklists" description="Modelos e execuções de checklists operacionais">
        <Link
          href="/checklists/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo modelo
        </Link>
      </PageHeader>

      {templates.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum checklist cadastrado"
          description="Crie modelos de checklist para padronizar suas operações diárias."
          action={
            <Link href="/checklists/new" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700">
              Criar primeiro checklist
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <ClipboardList size={18} className="text-brand-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PERIODICITY_COLORS[template.periodicity]}`}>
                  {PERIODICITY_LABELS[template.periodicity]}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                {template.sector && <span>📁 {template.sector.name}</span>}
                {template.unit && <span>🏢 {template.unit.name}</span>}
                <span>{template._count.items} itens</span>
              </div>

              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={11} />
                {template._count.executions} execuções · Criado {formatDate(template.createdAt)}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/checklists/${template.id}/execute`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
                >
                  <Play size={13} />
                  Executar
                </Link>
                <Link
                  href={`/checklists/${template.id}`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
