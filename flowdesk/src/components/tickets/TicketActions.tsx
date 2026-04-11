'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from 'next-auth'
import { ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TicketStatus } from '@prisma/client'

interface TicketActionsProps {
  ticket: { id: string; status: TicketStatus; assigneeId?: string | null }
  session: Session
}

const STATUS_TRANSITIONS: Record<TicketStatus, { value: TicketStatus; label: string }[]> = {
  OPEN:             [{ value: 'IN_PROGRESS', label: 'Iniciar atendimento' }, { value: 'CANCELLED', label: 'Cancelar' }],
  IN_PROGRESS:      [{ value: 'WAITING_RESPONSE', label: 'Aguardar retorno' }, { value: 'RESOLVED', label: 'Resolver' }],
  WAITING_RESPONSE: [{ value: 'IN_PROGRESS', label: 'Retomar atendimento' }, { value: 'RESOLVED', label: 'Resolver' }],
  RESOLVED:         [{ value: 'CLOSED', label: 'Fechar chamado' }, { value: 'IN_PROGRESS', label: 'Reabrir' }],
  CLOSED:           [{ value: 'OPEN', label: 'Reabrir chamado' }],
  CANCELLED:        [{ value: 'OPEN', label: 'Reabrir chamado' }],
}

export function TicketActions({ ticket, session: _session }: TicketActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const transitions = STATUS_TRANSITIONS[ticket.status] ?? []

  const updateStatus = async (status: TicketStatus) => {
    try {
      setLoading(true)
      setOpen(false)
      await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (transitions.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Ações
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
          {transitions.map((t) => (
            <button
              key={t.value}
              onClick={() => updateStatus(t.value)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
