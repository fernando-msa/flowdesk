'use client'

import Link from 'next/link'
import { formatRelativeTime, formatSlaRemaining, cn } from '@/lib/utils'
import { TicketStatusBadge } from './TicketStatusBadge'
import { TicketPriorityBadge } from './TicketPriorityBadge'
import { getSlaStatus } from '@/lib/sla'
import { MessageSquare, Paperclip, Clock } from 'lucide-react'
import type { TicketStatus, TicketPriority } from '@prisma/client'

interface TicketRow {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  category?: string | null
  slaDueAt?: Date | null
  createdAt: Date | string
  requester: { name: string }
  assignee?: { name: string } | null
  sector?: { name: string } | null
  unit?: { name: string } | null
  _count?: { comments: number; attachments: number }
}

interface TicketTableProps {
  tickets: TicketRow[]
}

const SLA_STYLES = {
  ok:      'text-emerald-600',
  warning: 'text-amber-600',
  breached: 'text-red-600 font-medium',
}

export function TicketTable({ tickets }: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
        <p className="text-gray-400 text-sm">Nenhum chamado encontrado.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="text-left px-4 py-3 font-medium text-gray-500 w-8">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Chamado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Prioridade</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">Setor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Responsável</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">SLA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Criado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => {
              const slaStatus = getSlaStatus(ticket.slaDueAt ? new Date(ticket.slaDueAt) : null)
              return (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      {ticket.id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <p className="font-medium text-gray-900 hover:text-brand-600 transition-colors line-clamp-1">
                        {ticket.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{ticket.requester.name}</span>
                        {ticket._count && (
                          <div className="flex items-center gap-2 text-gray-400">
                            {ticket._count.comments > 0 && (
                              <span className="flex items-center gap-0.5 text-xs">
                                <MessageSquare size={11} />
                                {ticket._count.comments}
                              </span>
                            )}
                            {ticket._count.attachments > 0 && (
                              <span className="flex items-center gap-0.5 text-xs">
                                <Paperclip size={11} />
                                {ticket._count.attachments}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Mobile: status inline */}
                        <span className="md:hidden">
                          <TicketStatusBadge status={ticket.status} />
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <TicketStatusBadge status={ticket.status} />
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <Link href={`/tickets/${ticket.id}`} className="block text-gray-600 text-xs">
                      {ticket.sector?.name ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Link href={`/tickets/${ticket.id}`} className="block text-gray-600 text-xs">
                      {ticket.assignee?.name ?? <span className="text-gray-300">Não atribuído</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <Link href={`/tickets/${ticket.id}`} className="block">
                      {ticket.slaDueAt ? (
                        <span className={cn('flex items-center gap-1 text-xs', SLA_STYLES[slaStatus])}>
                          <Clock size={11} />
                          {formatSlaRemaining(new Date(ticket.slaDueAt))}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Link href={`/tickets/${ticket.id}`} className="block text-gray-400 text-xs">
                      {formatRelativeTime(ticket.createdAt)}
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
