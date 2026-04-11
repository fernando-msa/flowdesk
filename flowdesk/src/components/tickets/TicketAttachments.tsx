'use client'

/**
 * TicketAttachments — painel de anexos de um chamado
 * Permite visualizar, fazer download e adicionar novos anexos
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUploader, type UploadedFile } from '@/components/shared/FileUploader'
import { formatBytes } from '@/lib/utils'
import { Paperclip, Download, Trash2, Plus, FileText, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number | null
  mimeType: string | null
  uploadedAt: Date | string
}

interface TicketAttachmentsProps {
  ticketId: string
  attachments: Attachment[]
  canDelete?: boolean
}

function AttachmentIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith('image/')) return <ImageIcon size={15} className="text-blue-500" />
  return <FileText size={15} className="text-gray-500" />
}

export function TicketAttachments({ ticketId, attachments: initial, canDelete }: TicketAttachmentsProps) {
  const router = useRouter()
  const [showUploader, setShowUploader] = useState(false)
  const [attachments, setAttachments] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleUploadComplete = async (files: UploadedFile[]) => {
    const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(files.map((f) => ({
        fileName: f.name,
        fileUrl:  f.url,
        fileSize: f.size,
      }))),
    })

    if (res.ok) {
      setShowUploader(false)
      router.refresh()
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Remover este anexo?')) return
    try {
      setDeleting(attachmentId)
      await fetch(`/api/tickets/${ticketId}/attachments?attachmentId=${attachmentId}`, {
        method: 'DELETE',
      })
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip size={15} className="text-gray-400" />
          Anexos {attachments.length > 0 && <span className="text-gray-400 font-normal">({attachments.length})</span>}
        </h3>
        <button
          type="button"
          onClick={() => setShowUploader(!showUploader)}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
            showUploader
              ? 'bg-gray-100 text-gray-600'
              : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
          )}
        >
          <Plus size={13} />
          Adicionar
        </button>
      </div>

      {/* Uploader */}
      {showUploader && (
        <div className="mb-4">
          <FileUploader
            endpoint="ticketAttachment"
            onUploadComplete={handleUploadComplete}
            label="Arraste ou clique para adicionar anexos"
          />
        </div>
      )}

      {/* Lista */}
      {attachments.length === 0 && !showUploader ? (
        <p className="text-sm text-gray-400 text-center py-4">Nenhum anexo</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 group transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                <AttachmentIcon mimeType={att.mimeType} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{att.fileName}</p>
                {att.fileSize && (
                  <p className="text-xs text-gray-400">{formatBytes(att.fileSize)}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={att.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={att.fileName}
                  className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Baixar"
                >
                  <Download size={14} />
                </a>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(att.id)}
                    disabled={deleting === att.id}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
