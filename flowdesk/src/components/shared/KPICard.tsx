import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const VARIANT_STYLES = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  danger:  'bg-red-100 text-red-600',
  info:    'bg-blue-100 text-blue-600',
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, variant = 'default', className }: KPICardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
              trend.value >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            )}>
              <span>{trend.value >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3', VARIANT_STYLES[variant])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
