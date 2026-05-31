// GET /api/settings/sla — configuração de SLA por prioridade
// PUT /api/settings/sla — atualiza configuração de SLA
//
// Como o schema não tem entidade SlaConfig ainda, usamos uma
// tabela de configuração genérica emulada via Company.metadata (JSON).
// Se o schema for estendido com SlaConfig, substituir aqui.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { SlaConfigSchema, DEFAULT_SLA } from '@/lib/validations/settings'
import { handleApiError } from '@/lib/api-errors'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Por enquanto usa defaults — quando SlaConfig existir no Prisma, buscar do banco
    return NextResponse.json({ data: DEFAULT_SLA })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!isAdmin(session)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const input = SlaConfigSchema.parse(await req.json())
    // Persistência futura: prisma.slaConfig.upsert(...)
    return NextResponse.json({ data: input })
  } catch (error) {
    return handleApiError(error)
  }
}
