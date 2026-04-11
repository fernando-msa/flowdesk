// Configuração central do Uploadthing
// Docs: https://docs.uploadthing.com/nextjs/appdir

import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/lib/auth'

const f = createUploadthing()

// Middleware de auth compartilhado
async function authMiddleware() {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')
  return { userId: session.user.id, companyId: session.user.companyId }
}

// ============================================================
// Router de uploads do FlowDesk
// ============================================================
export const ourFileRouter = {
  // Anexos de chamados — imagens + docs, até 16MB, máx 10 por vez
  ticketAttachment: f({
    image: { maxFileSize: '16MB', maxFileCount: 10 },
    pdf:   { maxFileSize: '16MB', maxFileCount: 10 },
    'application/msword':             { maxFileSize: '16MB', maxFileCount: 5 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '16MB', maxFileCount: 5 },
    'application/vnd.ms-excel':       { maxFileSize: '16MB', maxFileCount: 5 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       { maxFileSize: '16MB', maxFileCount: 5 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      // O handler da API persiste no banco; aqui apenas logamos
      console.log('[uploadthing] ticketAttachment uploaded by', metadata.userId, file.url)
      return { url: file.url, name: file.name, size: file.size }
    }),

  // Anexos de item de checklist — imagens + docs
  checklistItemAttachment: f({
    image: { maxFileSize: '8MB', maxFileCount: 3 },
    pdf:   { maxFileSize: '8MB', maxFileCount: 3 },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[uploadthing] checklistItem uploaded by', metadata.userId, file.url)
      return { url: file.url, name: file.name, size: file.size }
    }),

  // Logo da empresa
  companyLogo: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[uploadthing] companyLogo uploaded by', metadata.userId, file.url)
      return { url: file.url }
    }),

  // Avatar do usuário
  userAvatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('[uploadthing] userAvatar uploaded by', metadata.userId, file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
