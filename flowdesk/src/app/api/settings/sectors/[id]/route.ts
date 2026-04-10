import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isManagerOrAbove } from '@/lib/permissions'
import { z } from 'zod'

const SectorSchema = z.object({
  name:        z.string().min(2).max(200),
  description: z.string().optional(),
  isActive:    z.boolean().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isManagerOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const input = SectorSchema.parse(await req.json())
    const updated = await prisma.sector.update({
      where: { id: params.id, companyId: session.user.companyId },
      data:  input,
    })
    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isManagerOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    await prisma.sector.update({
      where: { id: params.id, companyId: session.user.companyId },
      data:  { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
