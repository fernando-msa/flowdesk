import { describe, expect, it } from 'vitest'
import {
  buildPaginationMeta,
  formatBytes,
  getInitials,
  slugify,
  truncate,
} from '@/lib/utils'

describe('utils', () => {
  it('truncate corta e adiciona reticencias quando excede o limite', () => {
    expect(truncate('abcdef', 3)).toBe('abc...')
    expect(truncate('abc', 3)).toBe('abc')
  })

  it('slugify normaliza string para url', () => {
    expect(slugify('  Olá Mundo!  ')).toBe('ol-mundo')
    expect(slugify('Teste   com   espaços')).toBe('teste-com-espaos')
  })

  it('getInitials retorna as iniciais em maiusculo', () => {
    expect(getInitials('Maria da Silva')).toBe('MD')
    expect(getInitials('joao')).toBe('J')
  })

  it('formatBytes converte tamanhos comuns', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('buildPaginationMeta calcula os metadados de paginação', () => {
    expect(buildPaginationMeta(100, 2, 10)).toEqual({
      total: 100,
      page: 2,
      perPage: 10,
      totalPages: 10,
      hasNext: true,
      hasPrev: true,
    })

    expect(buildPaginationMeta(0, 1, 10)).toEqual({
      total: 0,
      page: 1,
      perPage: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
  })
})
