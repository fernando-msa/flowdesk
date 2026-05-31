import { describe, expect, it, vi, beforeEach } from 'vitest'

const prismaMock = vi.hoisted(() => ({
  ticket: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    groupBy: vi.fn(),
  },
  ticketHistory: { create: vi.fn() },
  ticketComment: { create: vi.fn() },
  ticketAttachment: { create: vi.fn() },
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

import {
  findTickets,
  findTicketById,
  createTicket,
  updateTicket,
} from '@/server/repositories/ticket.repository'

describe('ticket.repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findTickets', () => {
    it('aplica companyId no filtro', async () => {
      prismaMock.ticket.findMany.mockResolvedValue([])
      prismaMock.ticket.count.mockResolvedValue(0)

      await findTickets(
        { companyId: 'c1' },
        { page: 1, perPage: 20 }
      )

      const where = prismaMock.ticket.findMany.mock.calls[0][0].where
      expect(where.companyId).toBe('c1')
    })

    it('aplica filtros opcionais', async () => {
      prismaMock.ticket.findMany.mockResolvedValue([])
      prismaMock.ticket.count.mockResolvedValue(0)

      await findTickets(
        {
          companyId: 'c1',
          status: 'OPEN',
          priority: 'HIGH',
          search: 'teste',
        },
        { page: 1, perPage: 10 }
      )

      const where = prismaMock.ticket.findMany.mock.calls[0][0].where
      expect(where.status).toBe('OPEN')
      expect(where.priority).toBe('HIGH')
      expect(where.OR).toBeDefined()
    })

    it('calcula paginacao corretamente', async () => {
      prismaMock.ticket.findMany.mockResolvedValue([])
      prismaMock.ticket.count.mockResolvedValue(50)

      const result = await findTickets(
        { companyId: 'c1' },
        { page: 3, perPage: 10 }
      )

      const args = prismaMock.ticket.findMany.mock.calls[0][0]
      expect(args.skip).toBe(20)
      expect(args.take).toBe(10)
      expect(result.total).toBe(50)
    })
  })

  describe('findTicketById', () => {
    it('inclui companyId no where clause', async () => {
      prismaMock.ticket.findFirst.mockResolvedValue(null)

      await findTicketById('t1', 'c1')

      expect(prismaMock.ticket.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1', companyId: 'c1' },
        })
      )
    })
  })

  describe('createTicket', () => {
    it('passa dados corretos', async () => {
      prismaMock.ticket.create.mockResolvedValue({ id: 't1' })
      const data = { title: 'Teste', status: 'OPEN' }

      await createTicket(data as any)

      expect(prismaMock.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({ data })
      )
    })
  })

  describe('updateTicket', () => {
    it('inclui companyId no where clause (regressao IDOR)', async () => {
      prismaMock.ticket.update.mockResolvedValue({ id: 't1' })

      await updateTicket('t1', 'c1', { status: 'CLOSED' })

      expect(prismaMock.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1', companyId: 'c1' },
        })
      )
    })
  })
})
