'use client'

import { formatDateTime, getInitials, cn } from '@/lib/utils'
import type { TicketStatus, HistoryActionType } from '@prisma/client'

interface TimelineItem {
  id: string
  action: HistoryActionType
  fromValue?: string | null
  toValue?: string | null
  note?: string | null
  createdAt: Date | string
  actor: { id: string; name: string; image?: string | null }
}

interface CommentItem {
  id: string
  content: string
  isInternal: boolean
  createdAt: Date | string
  author: { id: string; name: string; image?: string | null; role: string }
}

interface TicketTimelineProps {
  history: TimelineItem[]
  comments: CommentItem[]
  currentUserId: string
}

const ACTION_LABELS: Partial<Record<HistoryActionType, string>> = {
  CREATED:          'criou o chamado',
  STATUS_CHANGED:   'alterou o status',
  PRIORITY_CHANGED: 'alterou a prioridade',
  ASSIGNEE_CHANGED: 'alterou o responsável',
  COMMENT_ADDED:    'adicionou um comentário',
  ATTACHMENT_ADDED: 'anexou um arquivo',
  RESOLVED:         'resolveu o chamado',
  CLOSED:           'fechou o chamado',
  CANCELLED:        'cancelou o chamado',
  REOPENED:         'reabriu o chamado',
}

const STATUS_LABELS: Partial<Record<TicketStatus, string>> = {
  OPEN:             'Aberto',
  IN_PROGRESS:      'Em andamento',
  WAITING_RESPONSE: 'Aguardando retorno',
  RESOLVED:         'Resolvido',
  CLOSED:           'Fechado',
  CANCELLED:        'Cancelado',
}

// Merge e ordenar history + comments por data
type TimelineEntry =
  | { type: 'history'; data: TimelineItem }
  | { type: 'comment'; data: CommentItem }

function buildTimeline(history: TimelineItem[], comments: CommentItem[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...history.map((h) => ({ type: 'history' as const, data: h })),
    ...comments.map((c) => ({ type: 'comment' as const, data: c })),
  ]
  return entries.sort((a, b) =>
    new Date(a.data.createdAt).getTime() - new Date(b.data.createdAt).getTime()
  )
}

export function TicketTimeline({ history, comments, currentUserId }: TicketTimelineProps) {
  const timeline = buildTimeline(history, comments)

  if (timeline.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Nenhuma atividade registrada.</p>
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((entry, idx) => {
          const isLast = idx === timeline.length - 1

          if (entry.type === 'comment') {
            const comment = entry.data
            const isOwn = comment.author.id === currentUserId
            return (
              <li key={`comment-${comment.id}`}>
                <div className="relative pb-8">
                  {!isLast && <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200" />}
                  <div className="relative flex items-start gap-3">
                    <Avatar name={comment.author.name} />
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'rounded-xl px-4 py-3 border',
                        comment.isInternal
                          ? 'bg-amber-50 border-amber-200'
                          : isOwn ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-200'
                      )}>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
                          <div className="flex items-center gap-2">
                            {comment.isInternal && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                Interno
                              </span>
                            )}
                            <span className="text-xs text-gray-400">{formatDateTime(comment.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          }

          // history entry
          const item = entry.data
          const label = ACTION_LABELS[item.action] ?? item.action
          return (
            <li key={`history-${item.id}`}>
              <div className="relative pb-8">
                {!isLast && <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200" />}
                <div className="relative flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white">
                    <span className="text-xs font-medium text-gray-500">{getInitials(item.actor.name)}</span>
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{item.actor.name}</span>{' '}
                      {label}
                      {item.action === 'STATUS_CHANGED' && item.fromValue && item.toValue && (
                        <span>
                          {' '}de{' '}
                          <span className="font-medium text-gray-700">
                            {STATUS_LABELS[item.fromValue as TicketStatus] ?? item.fromValue}
                          </span>
                          {' '}para{' '}
                          <span className="font-medium text-gray-700">
                            {STATUS_LABELS[item.toValue as TicketStatus] ?? item.toValue}
                          </span>
                        </span>
                      )}
                      {item.note && item.action !== 'STATUS_CHANGED' && (
                        <span className="text-gray-500"> — {item.note}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(item.createdAt)}</p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 ring-2 ring-white">
      <span className="text-xs font-medium text-white">{getInitials(name)}</span>
    </div>
  )
}
