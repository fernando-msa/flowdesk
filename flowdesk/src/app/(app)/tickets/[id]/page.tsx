// Página: Detalhes do Chamado
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { ArrowLeft, Calendar, User, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Detalhes do Chamado' }

const STATUS_CONFIG = {
  OPEN: { label: 'Aberto', className: 'bg-blue-50 text-blue-700' },
  IN_PROGRESS: { label: 'Em Andamento', className: 'bg-purple-50 text-purple-700' },
  WAITING_RESPONSE: { label: 'Aguardando Resposta', className: 'bg-yellow-50 text-yellow-700' },
  RESOLVED: { label: 'Resolvido', className: 'bg-emerald-50 text-emerald-700' },
  CLOSED: { label: 'Fechado', className: 'bg-gray-50 text-gray-700' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-50 text-red-700' },
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Baixa', className: 'bg-gray-100 text-gray-700' },
  MEDIUM: { label: 'Média', className: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
  CRITICAL: { label: 'Crítica', className: 'bg-red-100 text-red-700' },
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return null

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      unit: { select: { name: true } },
      sector: { select: { name: true } },
      comments: {
        include: { author: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!ticket || ticket.companyId !== session.user.companyId) {
    notFound()
  }

  const statusConfig = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG]

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={15} />
          Voltar para chamados
        </Link>

        <PageHeader
          title={ticket.title}
          description={`Chamado #${ticket.id.slice(0, 8).toUpperCase()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Descrição</p>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-500 mb-3">Comentários</p>
              <div className="space-y-3">
                {ticket.comments.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
                ) : (
                  ticket.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex items-start gap-2 mb-1">
                        {comment.author.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={comment.author.image}
                            alt={comment.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{comment.author.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Prioridade</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${priorityConfig.className}`}>
                {priorityConfig.label}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Solicitante</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{ticket.requester.name}</p>
                <p className="text-xs text-gray-500">{ticket.requester.email}</p>
              </div>
            </div>

            {ticket.assignee && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Responsável</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{ticket.assignee.name}</p>
                  <p className="text-xs text-gray-500">{ticket.assignee.email}</p>
                </div>
              </div>
            )}

            {ticket.unit && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Unidade</p>
                <p className="text-sm text-gray-900">{ticket.unit.name}</p>
              </div>
            )}

            {ticket.sector && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Setor</p>
                <p className="text-sm text-gray-900">{ticket.sector.name}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Criado em</p>
              <p className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</p>
            </div>

            {ticket.resolvedAt && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Resolvido em</p>
                <p className="text-sm text-gray-900">{formatDate(ticket.resolvedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
