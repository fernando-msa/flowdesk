// PUT /api/settings/units/[id] — atualiza unidade
// DELETE /api/settings/units/[id] — desativa unidade
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isManagerOrAbove } from '@/lib/permissions'
import { UnitSchema } from '@/lib/validations/settings'
import { handleApiError } from '@/lib/api-errors'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isManagerOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const existing = await prisma.unit.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
    })
    if (!existing) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 })

    const input = UnitSchema.parse(await req.json())
    const updated = await prisma.unit.update({ where: { id: params.id }, data: input })
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

    await prisma.unit.update({
      where: { id: params.id, companyId: session.user.companyId },
      data:  { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
