// FlowDesk — Ticket Repository
// Todas as queries Prisma para tickets ficam aqui

import { prisma } from '@/lib/prisma'
import type { TicketStatus, TicketPriority, Prisma } from '@prisma/client'

export interface TicketFilters {
  companyId: string
  status?: TicketStatus
  priority?: TicketPriority
  sectorId?: string
  unitId?: string
  assigneeId?: string
  requesterId?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface PaginationOptions {
  page: number
  perPage: number
}

export async function findTickets(
  filters: TicketFilters,
  pagination: PaginationOptions
) {
  const { companyId, status, priority, sectorId, unitId, assigneeId, requesterId, search, dateFrom, dateTo } = filters
  const { page, perPage } = pagination

  const where: Prisma.TicketWhereInput = {
    companyId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(sectorId && { sectorId }),
    ...(unitId && { unitId }),
    ...(assigneeId && { assigneeId }),
    ...(requesterId && { requesterId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        requester: { select: { id: true, name: true, email: true, image: true } },
        assignee: { select: { id: true, name: true, email: true, image: true } },
        sector: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ])

  return { tickets, total }
}

export async function findTicketById(id: string, companyId: string) {
  return prisma.ticket.findFirst({
    where: { id, companyId },
    include: {
      requester: { select: { id: true, name: true, email: true, image: true, role: true } },
      assignee: { select: { id: true, name: true, email: true, image: true, role: true } },
      sector: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, name: true, email: true, image: true, role: true } },
        },
      },
      attachments: { orderBy: { uploadedAt: 'desc' } },
      history: {
        orderBy: { createdAt: 'asc' },
        include: {
          actor: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })
}

export async function createTicket(data: Prisma.TicketCreateInput) {
  return prisma.ticket.create({
    data,
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function updateTicket(id: string, companyId: string, data: Prisma.TicketUpdateInput) {
  return prisma.ticket.update({
    where: { id, companyId },
    data,
    include: {
      requester: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      sector: { select: { id: true, name: true } },
      unit: { select: { id: true, name: true } },
    },
  })
}

export async function createTicketHistory(data: Prisma.TicketHistoryCreateInput) {
  return prisma.ticketHistory.create({ data })
}

export async function createTicketComment(data: Prisma.TicketCommentCreateInput) {
  return prisma.ticketComment.create({
    data,
    include: {
      author: { select: { id: true, name: true, email: true, image: true, role: true } },
    },
  })
}

export async function createTicketAttachment(data: Prisma.TicketAttachmentCreateInput) {
  return prisma.ticketAttachment.create({ data })
}

// Stats para dashboard
export async function getTicketStats(companyId: string, dateFrom?: Date, dateTo?: Date) {
  const dateFilter = dateFrom || dateTo
    ? { createdAt: { ...(dateFrom && { gte: dateFrom }), ...(dateTo && { lte: dateTo }) } }
    : {}

  const [
    total,
    byStatus,
    byPriority,
    bySector,
    recentResolved,
  ] = await Promise.all([
    prisma.ticket.count({ where: { companyId, ...dateFilter } }),

    prisma.ticket.groupBy({
      by: ['status'],
      where: { companyId, ...dateFilter },
      _count: { id: true },
    }),

    prisma.ticket.groupBy({
      by: ['priority'],
      where: { companyId, ...dateFilter },
      _count: { id: true },
    }),

    prisma.ticket.groupBy({
      by: ['sectorId'],
      where: { companyId, sectorId: { not: null }, ...dateFilter },
      _count: { id: true },
    }),

    prisma.ticket.findMany({
      where: {
        companyId,
        status: { in: ['RESOLVED', 'CLOSED'] },
        resolvedAt: { not: null },
        ...dateFilter,
      },
      select: { createdAt: true, resolvedAt: true, slaBreached: true },
    }),
  ])

  // Tempo médio de resolução em horas
  const resolvedTimes = recentResolved
    .filter((t) => t.resolvedAt)
    .map((t) => (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60))

  const avgResolutionTime =
    resolvedTimes.length > 0
      ? resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length
      : 0

  const slaCompliance =
    recentResolved.length > 0
      ? (recentResolved.filter((t) => !t.slaBreached).length / recentResolved.length) * 100
      : 100

  return {
    total,
    byStatus,
    byPriority,
    bySector,
    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    slaCompliance: Math.round(slaCompliance),
    resolved: recentResolved.length,
  }
}
