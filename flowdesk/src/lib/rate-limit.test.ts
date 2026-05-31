import { describe, expect, it, vi, beforeEach } from 'vitest'

// Import the module fresh each time to avoid state leakage
let rateLimit: typeof import('@/lib/rate-limit').rateLimit

beforeEach(async () => {
  vi.useFakeTimers()
  const mod = await import('@/lib/rate-limit')
  rateLimit = mod.rateLimit
})

describe('rateLimit', () => {
  it('permite requests dentro do limite', () => {
    expect(rateLimit('test:key', 3, 60000)).toBe(true)
    expect(rateLimit('test:key', 3, 60000)).toBe(true)
    expect(rateLimit('test:key', 3, 60000)).toBe(true)
  })

  it('bloqueia apos exceder o limite', () => {
    rateLimit('test:key2', 2, 60000)
    rateLimit('test:key2', 2, 60000)
    expect(rateLimit('test:key2', 2, 60000)).toBe(false)
  })

  it('reseta apos a janela de tempo', () => {
    rateLimit('test:key3', 1, 60000)
    expect(rateLimit('test:key3', 1, 60000)).toBe(false)

    vi.advanceTimersByTime(61000)
    expect(rateLimit('test:key3', 1, 60000)).toBe(true)
  })

  it('chaves diferentes sao independentes', () => {
    rateLimit('test:a', 1, 60000)
    expect(rateLimit('test:a', 1, 60000)).toBe(false)
    expect(rateLimit('test:b', 1, 60000)).toBe(true)
  })
})
