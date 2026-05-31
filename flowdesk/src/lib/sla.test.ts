import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateSlaDueAt,
  isSlaBreached,
  getSlaStatus,
  formatSlaRemaining,
} from '@/lib/sla'

describe('calculateSlaDueAt', () => {
  it('retorna data correta para cada prioridade', () => {
    const base = new Date('2026-01-01T12:00:00.000Z')

    expect(calculateSlaDueAt('CRITICAL', base)).toEqual(
      new Date('2026-01-01T14:00:00.000Z')
    )
    expect(calculateSlaDueAt('HIGH', base)).toEqual(
      new Date('2026-01-01T20:00:00.000Z')
    )
    expect(calculateSlaDueAt('MEDIUM', base)).toEqual(
      new Date('2026-01-02T12:00:00.000Z')
    )
    expect(calculateSlaDueAt('LOW', base)).toEqual(
      new Date('2026-01-04T12:00:00.000Z')
    )
  })
})

describe('isSlaBreached', () => {
  it('retorna true quando vencido', () => {
    const past = new Date('2026-01-01T10:00:00.000Z')
    const due = new Date('2026-01-01T09:00:00.000Z')
    expect(isSlaBreached(due, past)).toBe(true)
  })

  it('retorna false quando dentro do prazo', () => {
    const now = new Date('2026-01-01T08:00:00.000Z')
    const due = new Date('2026-01-01T09:00:00.000Z')
    expect(isSlaBreached(due, now)).toBe(false)
  })

  it('retorna false para null', () => {
    expect(isSlaBreached(null)).toBe(false)
  })
})

describe('getSlaStatus', () => {
  it('retorna ok quando dentro do prazo', () => {
    const due = new Date('2026-01-01T20:00:00.000Z')
    const now = new Date('2026-01-01T12:00:00.000Z')
    expect(getSlaStatus(due, now)).toBe('ok')
  })

  it('retorna warning quando menos de 1 hora restante', () => {
    const due = new Date('2026-01-01T13:00:00.000Z')
    const now = new Date('2026-01-01T12:30:00.000Z')
    expect(getSlaStatus(due, now)).toBe('warning')
  })

  it('retorna breached quando vencido', () => {
    const due = new Date('2026-01-01T10:00:00.000Z')
    const now = new Date('2026-01-01T12:00:00.000Z')
    expect(getSlaStatus(due, now)).toBe('breached')
  })

  it('retorna ok para null', () => {
    expect(getSlaStatus(null)).toBe('ok')
  })
})

describe('formatSlaRemaining', () => {
  it('retorna dash para null', () => {
    expect(formatSlaRemaining(null)).toBe('—')
  })

  it('formata horas e minutos restantes', () => {
    const now = new Date('2026-01-01T10:00:00.000Z')
    vi.setSystemTime(now)
    const due = new Date('2026-01-01T12:30:00.000Z')
    expect(formatSlaRemaining(due)).toBe('2h 30m')
  })

  it('formata dias restantes', () => {
    const now = new Date('2026-01-01T10:00:00.000Z')
    vi.setSystemTime(now)
    const due = new Date('2026-01-03T10:00:00.000Z')
    expect(formatSlaRemaining(due)).toBe('2d 0h')
  })

  it('formata atraso em horas', () => {
    const now = new Date('2026-01-01T14:00:00.000Z')
    vi.setSystemTime(now)
    const due = new Date('2026-01-01T12:00:00.000Z')
    expect(formatSlaRemaining(due)).toBe('2h em atraso')
  })

  it('formata atraso em dias', () => {
    const now = new Date('2026-01-03T12:00:00.000Z')
    vi.setSystemTime(now)
    const due = new Date('2026-01-01T12:00:00.000Z')
    expect(formatSlaRemaining(due)).toBe('2d em atraso')
  })

  afterEach(() => {
    vi.useRealTimers()
  })
})
