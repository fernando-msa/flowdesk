// GET /api/dashboard — estatísticas para o dashboard

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDashboardStats } from '@/server/services/ticket.service'
import { isAnalystOrAbove } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    if (!isAnalystOrAbove(session)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const dateFrom = searchParams.get('dateFrom') ?? undefined
    const dateTo = searchParams.get('dateTo') ?? undefined

    const [ticketStats, checklistStats] = await Promise.all([
      getDashboardStats(session.user, dateFrom, dateTo),
      prisma.checklistExecution.groupBy({
        by: ['status'],
        where: { companyId: session.user.companyId },
        _count: { id: true },
      }),
    ])

    const nonConformities = await prisma.checklistExecutionItem.count({
      where: {
        isNonConformity: true,
        execution: { companyId: session.user.companyId },
      },
    })

    return NextResponse.json({
      data: {
        tickets: ticketStats,
        checklists: {
          byStatus: checklistStats,
          nonConformities,
        },
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
