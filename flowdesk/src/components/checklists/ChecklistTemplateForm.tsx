'use client'

/**
 * ChecklistTemplateForm
 * Formulário completo de criação / edição de template de checklist
 * com reordenação de itens por drag-and-drop (sem lib externa —
 * usa a API nativa HTML5 DnD para manter o bundle enxuto)
 */

import { useCallback, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  GripVertical, Plus, Trash2, Loader2,
  ChevronDown, ChevronUp, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CreateChecklistTemplateSchema,
  type CreateChecklistTemplateInput,
} from '@/lib/validations/checklist'

interface SelectOption { id: string; name: string }

interface ChecklistTemplateFormProps {
  units?: SelectOption[]
  sectors?: SelectOption[]
  defaultValues?: Partial<CreateChecklistTemplateInput>
  templateId?: string          // se presente → modo edição
}

const PERIODICITY_OPTIONS = [
  { value: 'DAILY',     label: 'Diário' },
  { value: 'WEEKLY',    label: 'Semanal' },
  { value: 'MONTHLY',   label: 'Mensal' },
  { value: 'ON_DEMAND', label: 'Sob demanda' },
]

const ITEM_TYPE_OPTIONS = [
  { value: 'CONFORMITY',  label: '✅ Conforme / Não conforme' },
  { value: 'TEXT',        label: '📝 Texto livre' },
  { value: 'NUMBER',      label: '🔢 Número' },
  { value: 'DATE',        label: '📅 Data' },
  { value: 'ATTACHMENT',  label: '📎 Anexo' },
]

const EMPTY_ITEM: CreateChecklistTemplateInput['items'][number] = {
  title:       '',
  description: '',
  type:        'CONFORMITY',
  order:       0,
  isRequired:  true,
}

export function ChecklistTemplateForm({
  units = [],
  sectors = [],
  defaultValues,
  templateId,
}: ChecklistTemplateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})

  // DnD state
  const dragIdx = useRef<number | null>(null)
  const dragOverIdx = useRef<number | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateChecklistTemplateInput>({
    resolver: zodResolver(CreateChecklistTemplateSchema),
    defaultValues: {
      periodicity: 'DAILY',
      items: [{ ...EMPTY_ITEM }],
      ...defaultValues,
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  })

  const toggleItem = (idx: number) =>
    setExpandedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))

  // ---- Drag & Drop handlers ----
  const handleDragStart = (idx: number) => { dragIdx.current = idx }
  const handleDragEnter = (idx: number) => { dragOverIdx.current = idx }
  const handleDragEnd = () => {
    if (dragIdx.current !== null && dragOverIdx.current !== null && dragIdx.current !== dragOverIdx.current) {
      move(dragIdx.current, dragOverIdx.current)
    }
    dragIdx.current = null
    dragOverIdx.current = null
  }

  const onSubmit = async (data: CreateChecklistTemplateInput) => {
    try {
      setIsLoading(true)
      setError(null)

      // Normaliza order pelos índices atuais
      const payload = {
        ...data,
        items: data.items.map((item, idx) => ({ ...item, order: idx })),
      }

      const url    = templateId ? `/api/checklists/${templateId}` : '/api/checklists'
      const method = templateId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao salvar checklist')
        return
      }

      router.push('/checklists')
      router.refresh()
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── Informações do template ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
          Informações gerais
        </h2>

        <Field label="Nome *" error={errors.name?.message}>
          <input
            {...register('name')}
            placeholder="Ex.: Checklist de abertura da unidade"
            className={inputCls(!!errors.name)}
          />
        </Field>

        <Field label="Descrição" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Descreva o objetivo deste checklist..."
            className={inputCls(false)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Periodicidade *" error={errors.periodicity?.message}>
            <select {...register('periodicity')} className={inputCls(false)}>
              {PERIODICITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          {units.length > 0 && (
            <Field label="Unidade" error={errors.unitId?.message}>
              <select {...register('unitId')} className={inputCls(false)}>
                <option value="">Todas as unidades</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
          )}

          {sectors.length > 0 && (
            <Field label="Setor" error={errors.sectorId?.message}>
              <select {...register('sectorId')} className={inputCls(false)}>
                <option value="">Todos os setores</option>
                {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          )}
        </div>
      </section>

      {/* ── Itens do checklist ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Itens{' '}
            <span className="font-normal text-gray-400">({fields.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => append({ ...EMPTY_ITEM })}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} /> Adicionar item
          </button>
        </div>

        {errors.items?.root && (
          <p className="text-xs text-red-600">{errors.items.root.message}</p>
        )}

        {fields.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Clique em &quot;Adicionar item&quot; para começar
          </div>
        )}

        <ul className="space-y-2">
          {fields.map((field, idx) => {
            const isExpanded = expandedItems[idx] ?? true
            const itemErrors = errors.items?.[idx]

            return (
              <li
                key={field.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  'bg-white border rounded-xl transition-shadow',
                  itemErrors ? 'border-red-300' : 'border-gray-200',
                  'cursor-default'
                )}
              >
                {/* Item header */}
                <div className="flex items-center gap-3 p-3">
                  {/* Drag handle */}
                  <GripVertical
                    size={16}
                    className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
                  />

                  <span className="text-xs font-mono text-gray-400 w-5 flex-shrink-0">{idx + 1}</span>

                  {/* Title preview */}
                  <div className="flex-1 min-w-0">
                    <input
                      {...register(`items.${idx}.title`)}
                      placeholder={`Título do item ${idx + 1} *`}
                      className={cn(
                        'w-full text-sm font-medium bg-transparent focus:outline-none placeholder:text-gray-400',
                        itemErrors?.title && 'placeholder:text-red-400'
                      )}
                    />
                    {itemErrors?.title && (
                      <p className="text-xs text-red-500 mt-0.5">{itemErrors.title.message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleItem(idx)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Item body (expandable) */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-gray-100 space-y-3 bg-gray-50/40 rounded-b-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      {/* Tipo */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo de resposta</label>
                        <select
                          {...register(`items.${idx}.type`)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {ITEM_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Obrigatório */}
                      <div className="flex items-end pb-1.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            {...register(`items.${idx}.isRequired`)}
                            className="w-4 h-4 accent-brand-600 rounded"
                          />
                          <span className="text-sm text-gray-700">Resposta obrigatória</span>
                        </label>
                      </div>
                    </div>

                    {/* Descrição do item */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">
                        Instrução / descrição (opcional)
                      </label>
                      <textarea
                        {...register(`items.${idx}.description`)}
                        rows={2}
                        placeholder="Explique como o item deve ser avaliado..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {fields.length > 0 && (
          <button
            type="button"
            onClick={() => append({ ...EMPTY_ITEM })}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-400 hover:text-brand-600 transition-colors"
          >
            <Plus size={15} /> Adicionar mais um item
          </button>
        )}
      </section>

      {/* ── Ações ── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <ClipboardList size={13} />
          {fields.length} item{fields.length !== 1 ? 's' : ''} · arraste para reordenar
        </div>
        <div className="flex items-center gap-3">
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
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isLoading ? 'Salvando...' : templateId ? 'Salvar alterações' : 'Criar checklist'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ── helpers ──
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
    hasError ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
  )
}
