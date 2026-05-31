// GET /api/settings/sectors
// POST /api/settings/sectors
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isManagerOrAbove } from '@/lib/permissions'
import { SectorSchema } from '@/lib/validations/settings'
import { handleApiError } from '@/lib/api-errors'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const sectors = await prisma.sector.findMany({
      where: { companyId: session.user.companyId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: sectors })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isManagerOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const input = SectorSchema.parse(await req.json())
    const sector = await prisma.sector.create({
      data: { ...input, companyId: session.user.companyId },
    })
    return NextResponse.json({ data: sector }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
