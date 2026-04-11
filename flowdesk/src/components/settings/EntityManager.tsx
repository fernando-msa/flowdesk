'use client'

/**
 * EntityManager — componente genérico para gerenciar listas de entidades
 * (Unidades e Setores compartilham a mesma lógica de CRUD inline)
 */

import { useState } from 'react'
import { Plus, Pencil, CheckCircle2, X, Loader2, Building2, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EntityItem {
  id: string
  name: string
  description?: string | null
  isActive: boolean
}

interface EntityManagerProps {
  title: string
  icon?: 'building' | 'folder'
  items: EntityItem[]
  apiEndpoint: string        // ex: '/api/settings/units'
  canManage?: boolean
}

interface FormState {
  name: string
  description: string
}

export function EntityManager({ title, icon = 'building', items: initial, apiEndpoint, canManage = true }: EntityManagerProps) {
  const [items, setItems] = useState<EntityItem[]>(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<FormState>({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const Icon = icon === 'folder' ? FolderOpen : Building2

  const resetForm = () => { setForm({ name: '', description: '' }); setError(null) }

  const handleAdd = async () => {
    if (!form.name.trim()) { setError('Nome obrigatório'); return }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || undefined }),
      })
      if (!res.ok) { const b = await res.json(); setError(b.error ?? 'Erro'); return }
      const { data } = await res.json()
      setItems((prev) => [...prev, data])
      setShowAdd(false)
      resetForm()
    } catch { setError('Erro inesperado') }
    finally { setLoading(false) }
  }

  const handleEdit = async (id: string) => {
    if (!form.name.trim()) { setError('Nome obrigatório'); return }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || undefined }),
      })
      if (!res.ok) { const b = await res.json(); setError(b.error ?? 'Erro'); return }
      const { data } = await res.json()
      setItems((prev) => prev.map((it) => (it.id === id ? data : it)))
      setEditingId(null)
      resetForm()
    } catch { setError('Erro inesperado') }
    finally { setLoading(false) }
  }

  const handleToggleActive = async (item: EntityItem) => {
    try {
      const res = await fetch(`${apiEndpoint}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item.name, description: item.description, isActive: !item.isActive }),
      })
      if (res.ok) {
        setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, isActive: !it.isActive } : it))
      }
    } catch { /* ignore */ }
  }

  const startEdit = (item: EntityItem) => {
    setEditingId(item.id)
    setForm({ name: item.name, description: item.description ?? '' })
    setShowAdd(false)
    setError(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          <Icon size={15} className="text-brand-600" />
          {title} <span className="font-normal text-gray-400">({items.filter((i) => i.isActive).length} ativo{items.filter((i) => i.isActive).length !== 1 ? 's' : ''})</span>
        </h2>
        {canManage && (
          <button
            onClick={() => { setShowAdd(!showAdd); setEditingId(null); resetForm() }}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
              showAdd ? 'bg-gray-100 text-gray-600' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
            )}
          >
            <Plus size={13} /> Adicionar
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <InlineForm
          form={form}
          onChange={setForm}
          onSave={handleAdd}
          onCancel={() => { setShowAdd(false); resetForm() }}
          loading={loading}
          error={error}
          label="Nova entrada"
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">Nenhum registro. Clique em &quot;Adicionar&quot; para começar.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className={cn('px-4 py-3', !item.isActive && 'opacity-50')}>
                {editingId === item.id ? (
                  <InlineForm
                    form={form}
                    onChange={setForm}
                    onSave={() => handleEdit(item.id)}
                    onCancel={() => { setEditingId(null); resetForm() }}
                    loading={loading}
                    error={error}
                    label="Salvar"
                  />
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-400 truncate">{item.description}</p>}
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          )}
                        >
                          {item.isActive ? 'Ativo' : 'Inativo'}
                        </button>
                        <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
                          <Pencil size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function InlineForm({ form, onChange, onSave, onCancel, loading, error, label }: {
  form: FormState
  onChange: (f: FormState) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
  error: string | null
  label: string
}) {
  return (
    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        autoFocus
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && onSave()}
        placeholder="Nome *"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
      />
      <input
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
        placeholder="Descrição (opcional)"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          {label}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100"
        >
          <X size={12} /> Cancelar
        </button>
      </div>
    </div>
  )
}
