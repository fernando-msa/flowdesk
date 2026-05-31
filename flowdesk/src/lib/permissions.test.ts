import { describe, expect, it } from 'vitest'
import {
  hasRole,
  isAdmin,
  isManagerOrAbove,
  isAnalystOrAbove,
  canManageTicket,
  canCloseTicket,
  canManageUsers,
  canManageChecklists,
} from '@/lib/permissions'
import type { UserRole } from '@prisma/client'
import type { Session } from 'next-auth'

function makeSession(role: UserRole, overrides: Partial<Session['user']> = {}): Session {
  return {
    user: {
      id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      role,
      companyId: 'c1',
      sectorId: 's1',
      ...overrides,
    },
    expires: '2099-01-01',
  }
}

describe('hasRole', () => {
  it('ADMIN >= MANAGER >= ANALYST >= REQUESTER', () => {
    expect(hasRole('ADMIN', 'ADMIN')).toBe(true)
    expect(hasRole('ADMIN', 'MANAGER')).toBe(true)
    expect(hasRole('MANAGER', 'ANALYST')).toBe(true)
    expect(hasRole('ANALYST', 'REQUESTER')).toBe(true)
    expect(hasRole('REQUESTER', 'ANALYST')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('true apenas para ADMIN', () => {
    expect(isAdmin(makeSession('ADMIN'))).toBe(true)
    expect(isAdmin(makeSession('MANAGER'))).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })
})

describe('isManagerOrAbove', () => {
  it('true para ADMIN e MANAGER', () => {
    expect(isManagerOrAbove(makeSession('ADMIN'))).toBe(true)
    expect(isManagerOrAbove(makeSession('MANAGER'))).toBe(true)
    expect(isManagerOrAbove(makeSession('ANALYST'))).toBe(false)
    expect(isManagerOrAbove(makeSession('REQUESTER'))).toBe(false)
  })
})

describe('isAnalystOrAbove', () => {
  it('true para ADMIN, MANAGER e ANALYST', () => {
    expect(isAnalystOrAbove(makeSession('ADMIN'))).toBe(true)
    expect(isAnalystOrAbove(makeSession('MANAGER'))).toBe(true)
    expect(isAnalystOrAbove(makeSession('ANALYST'))).toBe(true)
    expect(isAnalystOrAbove(makeSession('REQUESTER'))).toBe(false)
  })
})

describe('canManageTicket', () => {
  const ticket = {
    requesterId: 'u1',
    assigneeId: 'u2',
    sectorId: 's1',
  }

  it('ADMIN e MANAGER podem tudo', () => {
    expect(canManageTicket(makeSession('ADMIN'), ticket)).toBe(true)
    expect(canManageTicket(makeSession('MANAGER'), ticket)).toBe(true)
  })

  it('ANALYST pode se for do mesmo setor ou atribuido', () => {
    expect(
      canManageTicket(makeSession('ANALYST', { id: 'u2', sectorId: 's1' }), ticket)
    ).toBe(true)
    expect(
      canManageTicket(makeSession('ANALYST', { id: 'u3', sectorId: 's1' }), ticket)
    ).toBe(true)
    expect(
      canManageTicket(makeSession('ANALYST', { id: 'u3', sectorId: 's2' }), ticket)
    ).toBe(false)
  })

  it('REQUESTER so ve proprios tickets', () => {
    expect(
      canManageTicket(makeSession('REQUESTER', { id: 'u1' }), ticket)
    ).toBe(true)
    expect(
      canManageTicket(makeSession('REQUESTER', { id: 'u9' }), ticket)
    ).toBe(false)
  })

  it('retorna false para sessao nula', () => {
    expect(canManageTicket(null, ticket)).toBe(false)
  })
})

describe('canCloseTicket', () => {
  it('ANALYST e acima podem fechar', () => {
    expect(canCloseTicket(makeSession('ADMIN'))).toBe(true)
    expect(canCloseTicket(makeSession('MANAGER'))).toBe(true)
    expect(canCloseTicket(makeSession('ANALYST'))).toBe(true)
    expect(canCloseTicket(makeSession('REQUESTER'))).toBe(false)
  })
})

describe('canManageUsers', () => {
  it('apenas ADMIN', () => {
    expect(canManageUsers(makeSession('ADMIN'))).toBe(true)
    expect(canManageUsers(makeSession('MANAGER'))).toBe(false)
  })
})

describe('canManageChecklists', () => {
  it('MANAGER e acima', () => {
    expect(canManageChecklists(makeSession('ADMIN'))).toBe(true)
    expect(canManageChecklists(makeSession('MANAGER'))).toBe(true)
    expect(canManageChecklists(makeSession('ANALYST'))).toBe(false)
  })
})
