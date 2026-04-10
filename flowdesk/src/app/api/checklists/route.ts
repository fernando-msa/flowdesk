// GET /api/checklists — lista templates
// POST /api/checklists — cria novo template
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAnalystOrAbove } from '@/lib/permissions'
import { CreateChecklistTemplateSchema } from '@/lib/validations/checklist'

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const templates = await prisma.checklistTemplate.findMany({
      where: { companyId: session.user.companyId, isActive: true },
      include: {
        sector: { select: { id: true, name: true } },
        unit:   { select: { id: true, name: true } },
        _count: { select: { items: true, executions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: templates })
  } catch (error) {
    console.error('[GET /api/checklists]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isAnalystOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await req.json()
    const input = CreateChecklistTemplateSchema.parse(body)

    const template = await prisma.checklistTemplate.create({
      data: {
        companyId:   session.user.companyId,
        name:        input.name,
        description: input.description,
        periodicity: input.periodicity,
        unitId:      input.unitId ?? null,
        sectorId:    input.sectorId ?? null,
        items: {
          create: input.items.map((item, idx) => ({
            title:       item.title,
            description: item.description,
            type:        item.type,
            order:       item.order ?? idx,
            isRequired:  item.isRequired,
          })),
        },
      },
      include: { items: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ data: template }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/checklists]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
