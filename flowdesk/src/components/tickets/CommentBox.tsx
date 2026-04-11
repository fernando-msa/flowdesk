'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentBoxProps {
  ticketId: string
  canPostInternal?: boolean
}

export function CommentBox({ ticketId, canPostInternal = false }: CommentBoxProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), isInternal }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao enviar comentário')
        return
      }

      setContent('')
      router.refresh()
    } catch {
      setError('Erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600">{error}</div>
      )}
      <div className={cn(
        'rounded-xl border-2 transition-colors',
        isInternal ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 focus-within:border-brand-400'
      )}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder={isInternal ? 'Adicionar nota interna (visível apenas para equipe)...' : 'Adicionar comentário...'}
          className="w-full px-4 py-3 text-sm bg-transparent resize-none focus:outline-none placeholder:text-gray-400"
        />
        <div className="flex items-center justify-between px-3 pb-2 border-t border-gray-100">
          {canPostInternal ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIsInternal(!isInternal)}
                className={cn(
                  'w-8 h-4 rounded-full transition-colors relative cursor-pointer',
                  isInternal ? 'bg-amber-500' : 'bg-gray-300'
                )}
              >
                <div className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
                  isInternal ? 'left-4' : 'left-0.5'
                )} />
              </div>
              <span className="text-xs text-gray-600">Nota interna</span>
            </label>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Enviar
          </button>
        </div>
      </div>
    </form>
  )
}
