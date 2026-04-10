'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Ticket,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: string[]
  badge?: number
}

const NAV: NavItem[] = [
  { href: '/dashboard',         label: 'Dashboard',         icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'ANALYST'] },
  { href: '/tickets',           label: 'Chamados',           icon: Ticket },
  { href: '/checklists',        label: 'Checklists',         icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'ANALYST'] },
  { href: '/non-conformities',  label: 'Não Conformidades',  icon: AlertTriangle,  roles: ['ADMIN', 'MANAGER', 'ANALYST'] },
  { href: '/knowledge',         label: 'Conhecimento',       icon: BookOpen },
]

const BOTTOM_NAV: NavItem[] = [
  { href: '/users',    label: 'Usuários',      icon: Users,    roles: ['ADMIN'] },
  { href: '/settings', label: 'Configurações', icon: Settings, roles: ['ADMIN', 'MANAGER'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const role = session?.user?.role ?? 'REQUESTER'

  const isVisible = (item: NavItem) => !item.roles || item.roles.includes(role)
  const isActive  = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className={cn(
      'flex flex-col bg-white border-r border-gray-200 transition-all duration-200 relative',
      collapsed ? 'w-[60px]' : 'w-56'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2.5 px-4 h-14 border-b border-gray-200 flex-shrink-0',
        collapsed && 'justify-center px-0'
      )}>
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-gray-900 text-base tracking-tight">FlowDesk</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.filter(isVisible).map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 space-y-0.5 border-t border-gray-100">
        {BOTTOM_NAV.filter(isVisible).map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-brand-600 hover:border-brand-300 transition-colors shadow-sm z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
        collapsed && 'justify-center px-2.5',
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon size={17} className={cn('flex-shrink-0', active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600')} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && item.badge > 0 && (
        <span className="ml-auto bg-brand-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
          {item.badge}
        </span>
      )}
    </Link>
  )
}
