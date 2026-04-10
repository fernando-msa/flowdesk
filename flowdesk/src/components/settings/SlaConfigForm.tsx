'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const Schema = z.object({
  CRITICAL: z.coerce.number().min(1, 'Mín. 1h').max(720),
  HIGH:     z.coerce.number().min(1).max(720),
  MEDIUM:   z.coerce.number().min(1).max(720),
  LOW:      z.coerce.number().min(1).max(720),
})
type FormData = z.infer<typeof Schema>

interface SlaConfigFormProps {
  defaultValues: FormData
}

const PRIORITY_LABELS = [
  { key: 'CRITICAL' as const, label: 'Crítica', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { key: 'HIGH'     as const, label: 'Alta',    color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { key: 'MEDIUM'   as const, label: 'Média',   color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { key: 'LOW'      as const, label: 'Baixa',   color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
]

export function SlaConfigForm({ defaultValues }: SlaConfigFormProps) {
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues,
  })

  const values = watch()

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/settings/sla', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) { const b = await res.json(); setError(b.error ?? 'Erro'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { setError('Erro inesperado') }
    finally { setIsLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 size={15} /> SLA atualizado com sucesso!
        </div>
      )}

      <p className="text-sm text-gray-500">
        Defina em horas quanto tempo a equipe tem para resolver chamados de cada prioridade.
      </p>

      <div className="space-y-3">
        {PRIORITY_LABELS.map(({ key, label, color, bg }) => (
          <div key={key} className={cn('flex items-center justify-between gap-4 p-3 rounded-xl border', bg)}>
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={15} className={color} />
              <span className={cn('text-sm font-medium', color)}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={720}
                {...register(key)}
                className="w-20 text-right px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
              <span className="text-sm text-gray-500 w-12">hora{values[key] !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>

      {(errors.CRITICAL || errors.HIGH || errors.MEDIUM || errors.LOW) && (
        <p className="text-xs text-red-600">Todos os valores devem ser entre 1 e 720 horas.</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-40 transition-colors"
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        {isLoading ? 'Salvando...' : 'Salvar configuração de SLA'}
      </button>
    </form>
  )
}
