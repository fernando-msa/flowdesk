'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'OPEN', label: 'Aberto' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'WAITING_RESPONSE', label: 'Aguardando retorno' },
  { value: 'RESOLVED', label: 'Resolvido' },
  { value: 'CLOSED', label: 'Fechado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas as prioridades' },
  { value: 'CRITICAL', label: '🔴 Crítica' },
  { value: 'HIGH', label: '🟠 Alta' },
  { value: 'MEDIUM', label: '🔵 Média' },
  { value: 'LOW', label: '⚪ Baixa' },
]

export function TicketFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [showMore, setShowMore] = useState(false)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('search', search)
  }

  const clearAll = () => {
    setSearch('')
    router.push(pathname)
  }

  const hasActiveFilters = Array.from(searchParams.entries()).some(([k]) =>
    ['status', 'priority', 'search', 'sectorId', 'unitId'].includes(k)
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </form>

        {/* Status */}
        <select
          value={searchParams.get('status') ?? ''}
          onChange={(e) => updateParam('status', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white min-w-[160px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={searchParams.get('priority') ?? ''}
          onChange={(e) => updateParam('priority', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white min-w-[160px]"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* More filters toggle */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors',
            showMore ? 'border-brand-500 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <SlidersHorizontal size={15} />
          Filtros
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <X size={14} />
            Limpar
          </button>
        )}
      </div>

      {showMore && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
          <div className="flex gap-3 flex-1">
            <input
              type="date"
              value={searchParams.get('dateFrom') ?? ''}
              onChange={(e) => updateParam('dateFrom', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="De"
            />
            <input
              type="date"
              value={searchParams.get('dateTo') ?? ''}
              onChange={(e) => updateParam('dateTo', e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Até"
            />
          </div>
        </div>
      )}
    </div>
  )
}
