// GET /api/checklists/[id] — detalhe do template
// PUT /api/checklists/[id] — atualiza template
// DELETE /api/checklists/[id] — desativa template (soft delete)
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAnalystOrAbove, isManagerOrAbove } from '@/lib/permissions'
import { CreateChecklistTemplateSchema } from '@/lib/validations/checklist'
import { handleApiError } from '@/lib/api-errors'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const template = await prisma.checklistTemplate.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
      include: {
        items:  { orderBy: { order: 'asc' } },
        sector: { select: { id: true, name: true } },
        unit:   { select: { id: true, name: true } },
        executions: {
          orderBy: { completedAt: 'desc' },
          take: 10,
          include: { executedBy: { select: { name: true } } },
        },
        _count: { select: { items: true, executions: true } },
      },
    })

    if (!template) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({ data: template })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isAnalystOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const existing = await prisma.checklistTemplate.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const body = await req.json()
    const input = CreateChecklistTemplateSchema.parse(body)

    // Substitui todos os itens em transação
    const updated = await prisma.$transaction(async (tx) => {
      await tx.checklistTemplateItem.deleteMany({ where: { templateId: params.id } })

      return tx.checklistTemplate.update({
        where: { id: params.id },
        data: {
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
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isManagerOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const existing = await prisma.checklistTemplate.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    // Soft delete — mantém histórico de execuções
    await prisma.checklistTemplate.update({
      where: { id: params.id },
      data:  { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
