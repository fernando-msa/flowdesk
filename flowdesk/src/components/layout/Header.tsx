'use client'

import { useState, useRef, useEffect } from 'react'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  PanelLeft,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface HeaderProps {
  session: Session
  onToggleSidebar: () => void
  onMobileSidebarToggle: () => void
}

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  MANAGER: 'Gestor',
  ANALYST: 'Analista',
  REQUESTER: 'Solicitante',
}

export function Header({ session, onToggleSidebar, onMobileSidebarToggle }: HeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tickets?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="flex items-center h-16 px-4 bg-white border-b border-gray-200 gap-4 flex-shrink-0">
      {/* Toggle sidebar — desktop */}
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <PanelLeft size={18} />
      </button>

      {/* Toggle sidebar — mobile */}
      <button
        onClick={onMobileSidebarToggle}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar chamados..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500
                       focus:border-transparent focus:bg-white transition-colors"
          />
        </div>
      </form>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications — placeholder */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(session.user.name ?? 'U')}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{session.user.name}</p>
              <p className="text-xs text-gray-500 leading-tight">
                {ROLE_LABELS[session.user.role as keyof typeof ROLE_LABELS]}
              </p>
            </div>
            <ChevronDown size={14} className={cn('text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={15} className="text-gray-400" />
                Meu perfil
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings size={15} className="text-gray-400" />
                Configurações
              </Link>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
