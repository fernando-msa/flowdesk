// POST /api/tickets/[id]/attachments — persiste metadados após upload no Uploadthing
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { handleApiError } from '@/lib/api-errors'

const AttachmentSchema = z.object({
  fileName: z.string(),
  fileUrl:  z.string().url(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Verifica que o ticket pertence à empresa
    const ticket = await prisma.ticket.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
    })
    if (!ticket) return NextResponse.json({ error: 'Chamado não encontrado' }, { status: 404 })

    const body = await req.json()
    const files: z.infer<typeof AttachmentSchema>[] = Array.isArray(body) ? body : [body]
    const validated = files.map((f) => AttachmentSchema.parse(f))

    const attachments = await prisma.$transaction(
      validated.map((f) =>
        prisma.ticketAttachment.create({
          data: {
            ticketId: params.id,
            fileName: f.fileName,
            fileUrl:  f.fileUrl,
            fileSize: f.fileSize,
            mimeType: f.mimeType,
          },
        })
      )
    )

    // Registra no histórico
    await prisma.ticketHistory.create({
      data: {
        ticketId: params.id,
        actorId:  session.user.id,
        action:   'ATTACHMENT_ADDED',
        note:     `${validated.length} arquivo(s) anexado(s)`,
      },
    })

    return NextResponse.json({ data: attachments }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/tickets/[id]/attachments?attachmentId=xxx
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const attachmentId = searchParams.get('attachmentId')
    if (!attachmentId) return NextResponse.json({ error: 'attachmentId obrigatório' }, { status: 400 })

    const attachment = await prisma.ticketAttachment.findFirst({
      where: { id: attachmentId, ticketId: params.id, ticket: { companyId: session.user.companyId } },
    })
    if (!attachment) return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })

    await prisma.ticketAttachment.delete({ where: { id: attachmentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
