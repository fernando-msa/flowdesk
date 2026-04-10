'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { CreateTicketSchema, type CreateTicketInput } from '@/lib/validations/ticket'
import { cn } from '@/lib/utils'

interface SelectOption { id: string; name: string }

interface TicketFormProps {
  units?: SelectOption[]
  sectors?: SelectOption[]
  analysts?: SelectOption[]
}

const PRIORITY_OPTIONS = [
  { value: 'LOW',      label: 'Baixa' },
  { value: 'MEDIUM',   label: 'Média' },
  { value: 'HIGH',     label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

const CATEGORY_OPTIONS = [
  'Hardware', 'Software', 'Rede', 'Acesso/Permissão',
  'Cadastro', 'Infraestrutura', 'RH', 'Financeiro', 'Outro',
]

export function TicketForm({ units = [], sectors = [], analysts = [] }: TicketFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(CreateTicketSchema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const onSubmit = async (data: CreateTicketInput) => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao criar chamado')
        return
      }

      const { data: ticket } = await res.json()
      router.push(`/tickets/${ticket.id}`)
      router.refresh()
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Title */}
      <Field label="Título *" error={errors.title?.message}>
        <input
          {...register('title')}
          className={inputClass(!!errors.title)}
          placeholder="Descreva brevemente o problema ou solicitação"
        />
      </Field>

      {/* Description */}
      <Field label="Descrição *" error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={4}
          className={inputClass(!!errors.description)}
          placeholder="Descreva em detalhes o problema, o que aconteceu e como reproduzir..."
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority */}
        <Field label="Prioridade *" error={errors.priority?.message}>
          <select {...register('priority')} className={inputClass(!!errors.priority)}>
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>

        {/* Category */}
        <Field label="Categoria" error={errors.category?.message}>
          <select {...register('category')} className={inputClass(false)}>
            <option value="">Selecione uma categoria</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </Field>

        {/* Unit */}
        {units.length > 0 && (
          <Field label="Unidade" error={errors.unitId?.message}>
            <select {...register('unitId')} className={inputClass(false)}>
              <option value="">Selecione uma unidade</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
        )}

        {/* Sector */}
        {sectors.length > 0 && (
          <Field label="Setor" error={errors.sectorId?.message}>
            <select {...register('sectorId')} className={inputClass(false)}>
              <option value="">Selecione um setor</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        )}

        {/* Assignee */}
        {analysts.length > 0 && (
          <Field label="Atribuir para" error={errors.assigneeId?.message}>
            <select {...register('assigneeId')} className={inputClass(false)}>
              <option value="">Sem responsável</option>
              {analysts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 size={15} className="animate-spin" />}
          {isLoading ? 'Criando...' : 'Criar chamado'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
    hasError ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
  )
}
