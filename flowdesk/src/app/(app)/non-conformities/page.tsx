// Página: Não Conformidades
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAnalystOrAbove } from '@/lib/permissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { formatRelativeTime, formatDateTime } from '@/lib/utils'
import { AlertTriangle, ExternalLink } from 'lucide-react'

export const metadata: Metadata = { title: 'Não Conformidades' }

export default async function NonConformitiesPage() {
  const session = await auth()
  if (!session?.user) return null
  if (!isAnalystOrAbove(session)) redirect('/tickets')

  const items = await prisma.checklistExecutionItem.findMany({
    where: {
      isNonConformity: true,
      execution: { companyId: session.user.companyId },
    },
    include: {
      templateItem: { select: { title: true } },
      execution: {
        include: {
          template: { select: { name: true } },
          executedBy: { select: { name: true } },
          unit: { select: { name: true } },
        },
      },
      generatedTickets: {
        select: { id: true, status: true, title: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Não Conformidades"
        description={`${items.length} não conformidade${items.length !== 1 ? 's' : ''} registrada${items.length !== 1 ? 's' : ''}`}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Nenhuma não conformidade registrada"
          description="Não conformidades são geradas automaticamente durante a execução de checklists."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Item</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Checklist</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Observação</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Responsável</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Chamado gerado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={12} className="text-red-600" />
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">{item.templateItem.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">
                      {item.execution.template.name}
                      {item.execution.unit && (
                        <span className="text-gray-400"> · {item.execution.unit.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs max-w-xs">
                      <span className="line-clamp-2">{item.observation ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">
                      {item.execution.executedBy.name}
                    </td>
                    <td className="px-4 py-3">
                      {item.generatedTickets.length > 0 ? (
                        <div className="space-y-1">
                          {item.generatedTickets.map((t) => (
                            <Link
                              key={t.id}
                              href={`/tickets/${t.id}`}
                              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700"
                            >
                              <ExternalLink size={11} />
                              <span className="font-mono">{t.id.slice(-6).toUpperCase()}</span>
                              <TicketStatusBadge status={t.status} />
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                      {formatRelativeTime(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
