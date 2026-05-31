// API Route: PUT /api/profile — Atualizar perfil do usuário
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError } from '@/lib/api-errors'

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(200),
  image: z.string().url().optional().nullable().or(z.literal('')),
})

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = UpdateProfileSchema.parse(await req.json())

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name.trim(),
        image: body.image && body.image.trim() !== '' ? body.image : null,
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
    return handleApiError(error)
  }
}
