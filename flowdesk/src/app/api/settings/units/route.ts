// GET /api/settings/units — lista unidades
// POST /api/settings/units — cria unidade
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isManagerOrAbove } from '@/lib/permissions'
import { z } from 'zod'

const UnitSchema = z.object({
  name:        z.string().min(2, 'Nome obrigatório').max(200),
  description: z.string().optional(),
  isActive:    z.boolean().optional().default(true),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const units = await prisma.unit.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: units })
  } catch (error) {
    console.error('[GET /api/settings/units]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isManagerOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await req.json()
    const input = UnitSchema.parse(body)

    const unit = await prisma.unit.create({
      data: { ...input, companyId: session.user.companyId },
    })
    return NextResponse.json({ data: unit }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/settings/units]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
