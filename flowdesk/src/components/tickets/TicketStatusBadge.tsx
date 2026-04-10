import { cn } from '@/lib/utils'
import type { TicketStatus } from '@prisma/client'

interface TicketStatusBadgeProps {
  status: TicketStatus
  className?: string
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  OPEN:             { label: 'Aberto',              className: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  IN_PROGRESS:      { label: 'Em andamento',         className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  WAITING_RESPONSE: { label: 'Aguardando retorno',   className: 'bg-purple-50 text-purple-700 ring-purple-600/20' },
  RESOLVED:         { label: 'Resolvido',            className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  CLOSED:           { label: 'Fechado',              className: 'bg-gray-100 text-gray-600 ring-gray-500/20' },
  CANCELLED:        { label: 'Cancelado',            className: 'bg-red-50 text-red-700 ring-red-600/20' },
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
