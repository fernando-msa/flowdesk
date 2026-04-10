// API Route: PUT /api/profile — Atualizar perfil do usuário
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { name, image } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
         image: image && image.trim() !== '' ? image : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
         image: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[profile] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}
