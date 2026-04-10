// FlowDesk — SLA calculation helpers
import type { TicketPriority } from '@prisma/client'

// SLA em horas por prioridade (configurável futuramente por empresa)
export const SLA_HOURS: Record<TicketPriority, number> = {
  LOW: 72,      // 3 dias
  MEDIUM: 24,   // 1 dia
  HIGH: 8,      // 8 horas
  CRITICAL: 2,  // 2 horas
}

export function calculateSlaDueAt(priority: TicketPriority, createdAt: Date = new Date()): Date {
  const hours = SLA_HOURS[priority]
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000)
}

export function isSlaBreached(slaDueAt: Date | null, resolvedAt: Date | null = null): boolean {
  if (!slaDueAt) return false
  const compareDate = resolvedAt ?? new Date()
  return compareDate > slaDueAt
}

export function getSlaStatus(slaDueAt: Date | null, resolvedAt: Date | null = null): 'ok' | 'warning' | 'breached' {
  if (!slaDueAt) return 'ok'

  if (isSlaBreached(slaDueAt, resolvedAt)) return 'breached'

  const now = resolvedAt ?? new Date()
  const remainingMs = slaDueAt.getTime() - now.getTime()
  const remainingHours = remainingMs / (1000 * 60 * 60)

  // Warning se restar menos de 25% do prazo ou menos de 1 hora
  if (remainingHours < 1) return 'warning'

  return 'ok'
}

export function formatSlaRemaining(slaDueAt: Date | null): string {
  if (!slaDueAt) return '—'

  const now = new Date()
  const diffMs = slaDueAt.getTime() - now.getTime()

  if (diffMs < 0) {
    const overdueHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)))
    if (overdueHours < 24) return `${overdueHours}h em atraso`
    return `${Math.floor(overdueHours / 24)}d em atraso`
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
