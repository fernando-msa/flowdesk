'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChecklistItemType } from '@prisma/client'

interface TemplateItem {
  id: string
  title: string
  description?: string | null
  type: ChecklistItemType
  isRequired: boolean
  order: number
}

interface ChecklistExecutionFormProps {
  template: {
    id: string
    name: string
    items: TemplateItem[]
  }
}

interface ItemResponse {
  templateItemId: string
  isConform?: boolean | null
  textValue?: string
  numberValue?: number | string
  dateValue?: string
  observation?: string
  isNonConformity: boolean
}

export function ChecklistExecutionForm({ template }: ChecklistExecutionFormProps) {
  const router = useRouter()
  const [responses, setResponses] = useState<Record<string, ItemResponse>>(() =>
    Object.fromEntries(
      template.items.map((item) => [
        item.id,
        { templateItemId: item.id, isNonConformity: false },
      ])
    )
  )
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateResponse = (itemId: string, patch: Partial<ItemResponse>) => {
    setResponses((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required items
    const missing = template.items.filter((item) => {
      if (!item.isRequired) return false
      const resp = responses[item.id]
      if (item.type === 'CONFORMITY') return resp.isConform === undefined || resp.isConform === null
      if (item.type === 'TEXT') return !resp.textValue?.trim()
      if (item.type === 'NUMBER') return resp.numberValue === undefined || resp.numberValue === ''
      return false
    })

    if (missing.length > 0) {
      setError(`Preencha os itens obrigatórios: ${missing.map((m) => m.title).join(', ')}`)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const payload = {
        templateId: template.id,
        notes,
        items: Object.values(responses).map((r) => ({
          ...r,
          numberValue: r.numberValue !== '' ? Number(r.numberValue) : undefined,
        })),
      }

      const res = await fetch('/api/checklists/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao salvar execução')
        return
      }

      router.push('/checklists')
      router.refresh()
    } catch {
      setError('Erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  const nonConformCount = Object.values(responses).filter((r) => r.isNonConformity).length

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {nonConformCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-700">
          <AlertTriangle size={15} />
          {nonConformCount} não conformidade{nonConformCount > 1 ? 's' : ''} detectada{nonConformCount > 1 ? 's' : ''}
        </div>
      )}

      <div className="space-y-4">
        {template.items.map((item, idx) => (
          <div
            key={item.id}
            className={cn(
              'rounded-xl border p-4 transition-colors',
              responses[item.id]?.isNonConformity
                ? 'border-red-200 bg-red-50/40'
                : 'border-gray-200 bg-gray-50/30'
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-xs text-gray-400 font-mono mr-2">#{idx + 1}</span>
                <span className="text-sm font-medium text-gray-900">{item.title}</span>
                {item.isRequired && <span className="text-red-500 ml-1 text-xs">*</span>}
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5 ml-6">{item.description}</p>
                )}
              </div>
            </div>

            {/* CONFORMITY */}
            {item.type === 'CONFORMITY' && (
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => updateResponse(item.id, { isConform: true, isNonConformity: false })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                    responses[item.id]?.isConform === true
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                  )}
                >
                  <CheckCircle2 size={16} />
                  Conforme
                </button>
                <button
                  type="button"
                  onClick={() => updateResponse(item.id, { isConform: false, isNonConformity: true })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                    responses[item.id]?.isConform === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:border-red-300'
                  )}
                >
                  <XCircle size={16} />
                  Não conforme
                </button>
              </div>
            )}

            {/* TEXT */}
            {item.type === 'TEXT' && (
              <textarea
                rows={2}
                value={responses[item.id]?.textValue ?? ''}
                onChange={(e) => updateResponse(item.id, { textValue: e.target.value })}
                placeholder="Insira a resposta..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            )}

            {/* NUMBER */}
            {item.type === 'NUMBER' && (
              <input
                type="number"
                step="any"
                value={responses[item.id]?.numberValue ?? ''}
                onChange={(e) => updateResponse(item.id, { numberValue: e.target.value })}
                placeholder="0"
                className="w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}

            {/* DATE */}
            {item.type === 'DATE' && (
              <input
                type="date"
                value={responses[item.id]?.dateValue ?? ''}
                onChange={(e) => updateResponse(item.id, { dateValue: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}

            {/* Non-conformity observation */}
            {responses[item.id]?.isNonConformity && (
              <div className="mt-3">
                <label className="text-xs font-medium text-red-700 mb-1 block">
                  Observação sobre a não conformidade *
                </label>
                <textarea
                  rows={2}
                  value={responses[item.id]?.observation ?? ''}
                  onChange={(e) => updateResponse(item.id, { observation: e.target.value })}
                  placeholder="Descreva o problema encontrado..."
                  className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white resize-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Observações gerais</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione observações gerais sobre esta execução..."
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {isLoading ? 'Salvando...' : 'Concluir execução'}
        </button>
      </div>
    </form>
  )
}
