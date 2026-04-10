import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TicketPriority } from '@prisma/client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date formatters ──────────────────────────────────────────

export function formatDate(date: Date | string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!date) return '—'
  return format(new Date(date), pattern, { locale: ptBR })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true })
}

/**
 * Formata o tempo restante ou vencido do SLA de forma legível.
 * Se `due` for no passado → "Vencido há X"
 * Se `due` for no futuro  → "Vence em X"
 */
export function formatSlaRemaining(due: Date | null | undefined): string {
  if (!due) return '—'
  const now = new Date()
  const isPast = due < now
  const distance = formatDistance(due, now, { locale: ptBR })
  return isPast ? `Vencido há ${distance}` : `Vence em ${distance}`
}

// ── String helpers ───────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── File size ────────────────────────────────────────────────

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginationMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function buildPaginationMeta(total: number, page: number, perPage: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  return {
    total,
    page,
    perPage,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// ── Priority / SLA ───────────────────────────────────────────

/** Mapa de horas de SLA por prioridade (padrão — sobrescrito pelas configs da empresa) */
export const DEFAULT_SLA_HOURS: Record<TicketPriority, number> = {
  CRITICAL: 2,
  HIGH:     8,
  MEDIUM:   24,
  LOW:      72,
}
