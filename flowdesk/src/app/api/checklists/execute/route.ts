// POST /api/checklists/execute — salva uma execução de checklist
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ExecuteChecklistSchema } from '@/lib/validations/checklist'
import { calculateSlaDueAt } from '@/lib/sla'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const input = ExecuteChecklistSchema.parse(body)

    const template = await prisma.checklistTemplate.findFirst({
      where: { id: input.templateId, companyId: session.user.companyId },
    })
    if (!template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

    // Cria execução + itens em transação
    const execution = await prisma.$transaction(async (tx) => {
      const exec = await tx.checklistExecution.create({
        data: {
          companyId: session.user.companyId,
          templateId: input.templateId,
          executedById: session.user.id,
          unitId: input.unitId ?? template.unitId,
          notes: input.notes,
          status: 'COMPLETED',
          completedAt: new Date(),
          items: {
            create: input.items.map((item) => ({
              templateItemId: item.templateItemId,
              isConform: item.isConform ?? null,
              textValue: item.textValue ?? null,
              numberValue: item.numberValue ?? null,
              dateValue: item.dateValue ? new Date(item.dateValue) : null,
              attachmentUrl: item.attachmentUrl ?? null,
              observation: item.observation ?? null,
              isNonConformity: item.isNonConformity,
            })),
          },
        },
        include: { items: true },
      })

      // Para cada não conformidade, gerar chamado automaticamente
      const nonConformItems = exec.items.filter((i) => i.isNonConformity)
      await Promise.all(
        nonConformItems.map(async (ncItem) => {
          const templateItem = await tx.checklistTemplateItem.findUnique({
            where: { id: ncItem.templateItemId },
          })

          return tx.ticket.create({
            data: {
              title: `NC: ${templateItem?.title ?? 'Item não conforme'}`,
              description: ncItem.observation ?? `Não conformidade detectada no checklist "${template.name}"`,
              status: 'OPEN',
              priority: 'MEDIUM',
              category: 'Não Conformidade',
              companyId: session.user.companyId,
              unitId: exec.unitId,
              requesterId: session.user.id,
              slaDueAt: calculateSlaDueAt('MEDIUM'),
              sourceChecklistExecutionItemId: ncItem.id,
            },
          })
        })
      )

      return exec
    })

    return NextResponse.json({ data: execution }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/checklists/execute]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
