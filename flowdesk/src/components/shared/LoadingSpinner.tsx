import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: number
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 20, className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 size={size} className="animate-spin text-brand-600" />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size={28} text="Carregando..." />
    </div>
  )
}
