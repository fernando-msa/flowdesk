import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  if (error instanceof Error) {
    if (error.message.includes('não encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error.message.includes('Sem permissão')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
  }

  console.error('[API Error]', error)
  return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
}
