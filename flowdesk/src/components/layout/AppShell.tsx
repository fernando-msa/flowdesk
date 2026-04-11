'use client'

import { useState } from 'react'
import type { Session } from 'next-auth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppShellProps {
  children: React.ReactNode
  session: Session
}

export function AppShell({ children, session }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        session={session}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          session={session}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileSidebarToggle={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto page-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
