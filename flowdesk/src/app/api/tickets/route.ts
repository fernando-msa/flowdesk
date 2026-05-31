// GET /api/tickets — lista de chamados
// POST /api/tickets — criar chamado

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listTickets, createNewTicket } from '@/server/services/ticket.service'
import { CreateTicketSchema, TicketFiltersSchema } from '@/lib/validations/ticket'
import { buildPaginationMeta } from '@/lib/utils'
import { handleApiError } from '@/lib/api-errors'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const searchParams = Object.fromEntries(req.nextUrl.searchParams)
    const filters = TicketFiltersSchema.parse(searchParams)

    const { tickets, total } = await listTickets(session.user, filters)
    const meta = buildPaginationMeta(total, filters.page, filters.perPage)

    return NextResponse.json({ data: tickets, meta })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const input = CreateTicketSchema.parse(body)

    const ticket = await createNewTicket(input, session.user)

    return NextResponse.json({ data: ticket }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
