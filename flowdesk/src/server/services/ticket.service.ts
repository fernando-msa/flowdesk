// FlowDesk — Ticket Service
// Regras de negócio para chamados

import { prisma } from '@/lib/prisma'
import { calculateSlaDueAt, isSlaBreached } from '@/lib/sla'
import {
  findTickets,
  findTicketById,
  createTicket,
  updateTicket,
  createTicketHistory,
  createTicketComment,
  getTicketStats,
} from '@/server/repositories/ticket.repository'
import type { CreateTicketInput, UpdateTicketInput, CreateCommentInput, TicketFilters } from '@/lib/validations/ticket'
import type { TicketStatus, TicketPriority, UserRole } from '@prisma/client'

interface SessionUser {
  id: string
  role: UserRole
  companyId: string
}

export async function listTickets(
  user: SessionUser,
  filters: TicketFilters
) {
  const { page = 1, perPage = 20, status, priority, sectorId, unitId, assigneeId, requesterId, search, dateFrom, dateTo } = filters

  // Solicitante só vê seus próprios tickets
  const effectiveRequesterId = user.role === 'REQUESTER' ? user.id : requesterId

  return findTickets(
    {
      companyId: user.companyId,
      status: status as TicketStatus | undefined,
      priority: priority as TicketPriority | undefined,
      sectorId,
      unitId,
      assigneeId,
      requesterId: effectiveRequesterId,
      search,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    },
    { page, perPage }
  )
}

export async function getTicketDetail(id: string, user: SessionUser) {
  const ticket = await findTicketById(id, user.companyId)
  if (!ticket) return null

  // Verificar permissão
  if (user.role === 'REQUESTER' && ticket.requesterId !== user.id) {
    return null // não tem acesso
  }

  return ticket
}

export async function createNewTicket(input: CreateTicketInput, user: SessionUser) {
  const slaDueAt = calculateSlaDueAt(input.priority as TicketPriority)

  const ticket = await createTicket({
    title: input.title,
    description: input.description,
    priority: input.priority as TicketPriority,
    category: input.category,
    slaDueAt,
    company: { connect: { id: user.companyId } },
    requester: { connect: { id: user.id } },
    ...(input.unitId && { unit: { connect: { id: input.unitId } } }),
    ...(input.sectorId && { sector: { connect: { id: input.sectorId } } }),
    ...(input.assigneeId && { assignee: { connect: { id: input.assigneeId } } }),
  })

  // Registrar no histórico
  await createTicketHistory({
    action: 'CREATED',
    toValue: 'OPEN',
    note: 'Chamado criado',
    ticket: { connect: { id: ticket.id } },
    actor: { connect: { id: user.id } },
  })

  return ticket
}

export async function updateExistingTicket(
  id: string,
  input: UpdateTicketInput,
  user: SessionUser
) {
  const existing = await findTicketById(id, user.companyId)
  if (!existing) throw new Error('Chamado não encontrado')

  // Permissão: solicitante não pode editar
  if (user.role === 'REQUESTER') {
    throw new Error('Sem permissão para editar chamados')
  }

  const updateData: Record<string, unknown> = {}
  const historyEntries: Array<{ action: string; fromValue?: string; toValue?: string; note?: string }> = []

  // Detectar mudanças e registrar histórico
  if (input.status && input.status !== existing.status) {
    updateData.status = input.status
    historyEntries.push({
      action: 'STATUS_CHANGED',
      fromValue: existing.status,
      toValue: input.status,
    })

    if (input.status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
      updateData.slaBreached = isSlaBreached(existing.slaDueAt)
    }
    if (input.status === 'CLOSED') {
      updateData.closedAt = new Date()
      if (!existing.resolvedAt) {
        updateData.resolvedAt = new Date()
        updateData.slaBreached = isSlaBreached(existing.slaDueAt)
      }
    }
  }

  if (input.priority && input.priority !== existing.priority) {
    updateData.priority = input.priority
    updateData.slaDueAt = calculateSlaDueAt(input.priority as TicketPriority, existing.createdAt)
    historyEntries.push({
      action: 'PRIORITY_CHANGED',
      fromValue: existing.priority,
      toValue: input.priority,
    })
  }

  if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
    updateData.assigneeId = input.assigneeId ?? null
    historyEntries.push({
      action: 'ASSIGNEE_CHANGED',
      fromValue: existing.assigneeId ?? undefined,
      toValue: input.assigneeId ?? undefined,
    })
  }

  if (input.title) updateData.title = input.title
  if (input.description) updateData.description = input.description
  if (input.category !== undefined) updateData.category = input.category
  if (input.unitId !== undefined) updateData.unitId = input.unitId ?? null
  if (input.sectorId !== undefined) updateData.sectorId = input.sectorId ?? null

  const updated = await updateTicket(id, user.companyId, updateData)

  // Registrar histórico em paralelo
  await Promise.all(
    historyEntries.map((entry) =>
      createTicketHistory({
        action: entry.action as Parameters<typeof createTicketHistory>[0]['action'],
        fromValue: entry.fromValue,
        toValue: entry.toValue,
        note: entry.note,
        ticket: { connect: { id } },
        actor: { connect: { id: user.id } },
      })
    )
  )

  return updated
}

export async function addComment(
  ticketId: string,
  input: CreateCommentInput,
  user: SessionUser
) {
  const ticket = await findTicketById(ticketId, user.companyId)
  if (!ticket) throw new Error('Chamado não encontrado')

  // Solicitante não pode adicionar comentários internos
  if (user.role === 'REQUESTER' && input.isInternal) {
    throw new Error('Sem permissão para comentários internos')
  }

  const comment = await createTicketComment({
    content: input.content,
    isInternal: input.isInternal,
    ticket: { connect: { id: ticketId } },
    author: { connect: { id: user.id } },
  })

  await createTicketHistory({
    action: 'COMMENT_ADDED',
    note: input.isInternal ? 'Comentário interno adicionado' : 'Comentário adicionado',
    ticket: { connect: { id: ticketId } },
    actor: { connect: { id: user.id } },
  })

  return comment
}

export async function getDashboardStats(user: SessionUser, dateFrom?: string, dateTo?: string) {
  return getTicketStats(
    user.companyId,
    dateFrom ? new Date(dateFrom) : undefined,
    dateTo ? new Date(dateTo) : undefined
  )
}
