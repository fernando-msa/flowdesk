// GET /api/settings/company — dados da empresa
// PUT /api/settings/company — atualiza dados da empresa
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isManagerOrAbove, isAdmin } from '@/lib/permissions'
import { UpdateCompanySchema } from '@/lib/validations/settings'
import { handleApiError } from '@/lib/api-errors'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isManagerOrAbove(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { id: true, name: true, slug: true, logoUrl: true, isActive: true, createdAt: true },
    })

    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    return NextResponse.json({ data: company })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isAdmin(session)) return NextResponse.json({ error: 'Apenas administradores podem alterar dados da empresa' }, { status: 403 })

    const body = await req.json()
    const input = UpdateCompanySchema.parse(body)

    const updated = await prisma.company.update({
      where: { id: session.user.companyId },
      data:  { name: input.name, logoUrl: input.logoUrl },
      select: { id: true, name: true, logoUrl: true },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}
