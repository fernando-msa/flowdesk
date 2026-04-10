import { cn } from '@/lib/utils'
import type { TicketPriority } from '@prisma/client'

interface TicketPriorityBadgeProps {
  priority: TicketPriority
  className?: string
  showDot?: boolean
}

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; className: string; dotClass: string }> = {
  LOW:      { label: 'Baixa',    className: 'bg-gray-100 text-gray-600',    dotClass: 'bg-gray-400' },
  MEDIUM:   { label: 'Média',    className: 'bg-blue-50 text-blue-700',     dotClass: 'bg-blue-500' },
  HIGH:     { label: 'Alta',     className: 'bg-orange-50 text-orange-700', dotClass: 'bg-orange-500' },
  CRITICAL: { label: 'Crítica',  className: 'bg-red-50 text-red-700',       dotClass: 'bg-red-500' },
}

export function TicketPriorityBadge({ priority, className, showDot = true }: TicketPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
      config.className,
      className
    )}>
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />}
      {config.label}
    </span>
  )
}

export { PRIORITY_CONFIG }
