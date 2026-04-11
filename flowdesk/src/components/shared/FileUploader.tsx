'use client'

/**
 * FileUploader — componente genérico de upload via Uploadthing
 *
 * Uso:
 *   <FileUploader
 *     endpoint="ticketAttachment"
 *     onUploadComplete={(files) => handleFiles(files)}
 *   />
 */

import { useCallback, useState } from 'react'
import type { OurFileRouter } from '@/lib/uploadthing'
import { cn } from '@/lib/utils'
import { Upload, X, FileText, Image, CheckCircle2, Loader2 } from 'lucide-react'

export interface UploadedFile {
  url:  string
  name: string
  size: number
}

interface FileUploaderProps {
  endpoint: keyof OurFileRouter
  onUploadComplete: (files: UploadedFile[]) => void
  onUploadError?: (error: Error) => void
  maxFiles?: number
  accept?: string
  label?: string
  className?: string
  disabled?: boolean
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image')) return Image
  return FileText
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

async function uploadFiles(files: File[], endpoint: keyof OurFileRouter): Promise<UploadedFile[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  const res = await fetch(`/api/uploadthing?actionType=upload&slug=${String(endpoint)}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error ?? 'Upload failed')
  }

  const data = await res.json()
  return data
}

export function FileUploader({
  endpoint,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  label = 'Arraste arquivos ou clique para selecionar',
  className,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFilesUpload = useCallback(
    async (filesToUpload: File[]) => {
      if (disabled || isUploading) return
      if (filesToUpload.length === 0) return
      
      setError(null)
      setIsUploading(true)

      try {
        const uploaded = await uploadFiles(Array.from(filesToUpload), endpoint)
        setUploadedFiles((prev) => [...prev, ...uploaded])
        onUploadComplete(uploaded)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao fazer upload'
        setError(message)
        onUploadError?.(err instanceof Error ? err : new Error(message))
      } finally {
        setIsUploading(false)
      }
    },
    [endpoint, disabled, isUploading, onUploadComplete, onUploadError]
  )


  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      void handleFilesUpload(files)
    },
    [handleFilesUpload]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    void handleFilesUpload(files)
    e.target.value = '' // reset para permitir re-upload do mesmo arquivo
  }

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.url !== url))
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <label
        className={cn(
          'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
          isDragging ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
          'relative'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={maxFiles > 1}
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
            <span className="text-sm text-gray-500">Enviando...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={22} className={isDragging ? 'text-brand-500' : 'text-gray-400'} />
            <span className="text-sm text-gray-500 text-center px-4">{label}</span>
            <span className="text-xs text-gray-400">PDF, Word, Excel, imagens · máx. 16MB</span>
          </div>
        )}
      </label>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <ul className="space-y-2">
          {uploadedFiles.map((file) => {
            const Icon = getFileIcon(file.name.split('.').pop() ?? '')
            return (
              <li key={file.url} className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => removeFile(file.url)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
