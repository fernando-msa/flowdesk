import { beforeEach, describe, expect, it, vi } from 'vitest'

const repoMocks = vi.hoisted(() => ({
  findTickets: vi.fn(),
  findTicketById: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  createTicketHistory: vi.fn(),
  createTicketComment: vi.fn(),
  getTicketStats: vi.fn(),
}))

const slaMocks = vi.hoisted(() => ({
  calculateSlaDueAt: vi.fn(() => new Date('2026-01-01T12:00:00.000Z')),
  isSlaBreached: vi.fn(() => false),
}))

vi.mock('@/server/repositories/ticket.repository', () => repoMocks)
vi.mock('@/lib/sla', () => slaMocks)
vi.mock('@/lib/prisma', () => ({ prisma: {} }))

import {
  addComment,
  createNewTicket,
  getTicketDetail,
  listTickets,
  updateExistingTicket,
} from '@/server/services/ticket.service'

describe('ticket.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listTickets força requesterId quando usuário é REQUESTER', async () => {
    repoMocks.findTickets.mockResolvedValueOnce({ tickets: [], total: 0 })

    await listTickets(
      { id: 'u1', role: 'REQUESTER', companyId: 'c1' } as any,
      { requesterId: 'outro', page: 1, perPage: 20 }
    )

    expect(repoMocks.findTickets).toHaveBeenCalledTimes(1)
    expect(repoMocks.findTickets.mock.calls[0][0]).toMatchObject({
      companyId: 'c1',
      requesterId: 'u1',
    })
  })

  it('getTicketDetail bloqueia acesso de requester para ticket de outro usuário', async () => {
    repoMocks.findTicketById.mockResolvedValueOnce({ id: 't1', requesterId: 'x2' })

    const result = await getTicketDetail('t1', {
      id: 'u1',
      role: 'REQUESTER',
      companyId: 'c1',
    } as any)

    expect(result).toBeNull()
  })

  it('createNewTicket cria ticket e histórico', async () => {
    repoMocks.createTicket.mockResolvedValueOnce({ id: 't1' })
    repoMocks.createTicketHistory.mockResolvedValueOnce({ id: 'h1' })

    const result = await createNewTicket(
      {
        title: 'Título de teste válido',
        description: 'Descrição válida para criação de chamado',
        priority: 'HIGH',
      } as any,
      { id: 'u1', role: 'TECHNICIAN', companyId: 'c1' } as any
    )

    expect(result).toEqual({ id: 't1' })
    expect(repoMocks.createTicket).toHaveBeenCalledTimes(1)
    expect(repoMocks.createTicketHistory).toHaveBeenCalledTimes(1)
  })

  it('updateExistingTicket nega edição para requester', async () => {
    repoMocks.findTicketById.mockResolvedValueOnce({
      id: 't1',
      status: 'OPEN',
      priority: 'LOW',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
      requesterId: 'u1',
      assigneeId: null,
      slaDueAt: new Date('2026-01-02T10:00:00.000Z'),
      resolvedAt: null,
    })

    await expect(
      updateExistingTicket(
        't1',
        { status: 'IN_PROGRESS' } as any,
        { id: 'u1', role: 'REQUESTER', companyId: 'c1' } as any
      )
    ).rejects.toThrow('Sem permissão para editar chamados')
  })

  it('addComment bloqueia comentário interno para requester', async () => {
    repoMocks.findTicketById.mockResolvedValueOnce({ id: 't1', requesterId: 'u1' })

    await expect(
      addComment(
        't1',
        { content: 'Comentário interno', isInternal: true },
        { id: 'u1', role: 'REQUESTER', companyId: 'c1' } as any
      )
    ).rejects.toThrow('Sem permissão para comentários internos')
  })
})
