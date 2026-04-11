// FlowDesk — RBAC helpers
import type { UserRole } from '@prisma/client'
import type { Session } from 'next-auth'

// Hierarquia de roles
const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  MANAGER: 3,
  ANALYST: 2,
  REQUESTER: 1,
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'ADMIN'
}

export function isManagerOrAbove(session: Session | null): boolean {
  return hasRole(session?.user?.role ?? 'REQUESTER', 'MANAGER')
}

export function isAnalystOrAbove(session: Session | null): boolean {
  return hasRole(session?.user?.role ?? 'REQUESTER', 'ANALYST')
}

// Verifica se o usuário pode ver/editar um ticket
export function canManageTicket(
  session: Session | null,
  ticket: { requesterId: string; assigneeId?: string | null; sectorId?: string | null }
): boolean {
  if (!session?.user) return false

  const { id, role, sectorId } = session.user

  if (role === 'ADMIN' || role === 'MANAGER') return true
  if (role === 'ANALYST') {
    // Analista vê tickets do seu setor ou atribuídos a ele
    return ticket.assigneeId === id || (!!sectorId && ticket.sectorId === sectorId)
  }
  // Solicitante vê apenas seus próprios tickets
  return ticket.requesterId === id
}

// Verifica se pode fechar/cancelar tickets
export function canCloseTicket(session: Session | null): boolean {
  return isAnalystOrAbove(session)
}

// Verifica se pode criar/editar usuários
export function canManageUsers(session: Session | null): boolean {
  return isAdmin(session)
}

// Verifica se pode gerenciar checklists
export function canManageChecklists(session: Session | null): boolean {
  return isManagerOrAbove(session)
}

// Verifica se pode ver dashboard
export function canViewDashboard(session: Session | null): boolean {
  return isAnalystOrAbove(session)
}

// Verifica se pode ver base de conhecimento
export function canViewKnowledge(_session: Session | null): boolean {
  return true // todos os usuários podem ver
}

// Verifica se pode gerenciar artigos de conhecimento
export function canManageKnowledge(session: Session | null): boolean {
  return isAnalystOrAbove(session)
}
