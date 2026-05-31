import { describe, expect, it } from 'vitest'
import {
  CreateTicketSchema,
  UpdateTicketSchema,
  CreateCommentSchema,
  TicketFiltersSchema,
} from '@/lib/validations/ticket'
import {
  CreateUserSchema,
  UpdateUserSchema,
  LoginSchema,
} from '@/lib/validations/user'
import {
  CreateChecklistTemplateSchema,
  ExecuteChecklistSchema,
} from '@/lib/validations/checklist'
import {
  SectorSchema,
  UnitSchema,
  UpdateCompanySchema,
  SlaConfigSchema,
} from '@/lib/validations/settings'

describe('CreateTicketSchema', () => {
  const validTicket = {
    title: 'Chamado de teste',
    description: 'Descricao valida com mais de 10 caracteres',
    priority: 'MEDIUM' as const,
  }

  it('aceita input valido', () => {
    expect(CreateTicketSchema.parse(validTicket)).toEqual(validTicket)
  })

  it('rejeita titulo muito curto', () => {
    expect(() =>
      CreateTicketSchema.parse({ ...validTicket, title: 'ab' })
    ).toThrow()
  })

  it('rejeita descricao muito curta', () => {
    expect(() =>
      CreateTicketSchema.parse({ ...validTicket, description: 'curta' })
    ).toThrow()
  })

  it('rejeita descricao acima de 10000 caracteres', () => {
    expect(() =>
      CreateTicketSchema.parse({ ...validTicket, description: 'a'.repeat(10001) })
    ).toThrow()
  })

  it('rejeita prioridade invalida', () => {
    expect(() =>
      CreateTicketSchema.parse({ ...validTicket, priority: 'INVALID' })
    ).toThrow()
  })
})

describe('UpdateTicketSchema', () => {
  it('aceita atualizacao parcial', () => {
    expect(UpdateTicketSchema.parse({ status: 'IN_PROGRESS' })).toEqual({
      status: 'IN_PROGRESS',
    })
  })

  it('aceita descricao com max length', () => {
    expect(() =>
      UpdateTicketSchema.parse({ description: 'a'.repeat(10000) })
    ).not.toThrow()
  })

  it('rejeita descricao acima de 10000 caracteres', () => {
    expect(() =>
      UpdateTicketSchema.parse({ description: 'a'.repeat(10001) })
    ).toThrow()
  })
})

describe('CreateCommentSchema', () => {
  it('aceita comentario valido', () => {
    expect(CreateCommentSchema.parse({ content: 'Comentario' })).toEqual({
      content: 'Comentario',
      isInternal: false,
    })
  })

  it('rejeita comentario vazio', () => {
    expect(() => CreateCommentSchema.parse({ content: '' })).toThrow()
  })

  it('rejeita comentario acima de 5000 caracteres', () => {
    expect(() =>
      CreateCommentSchema.parse({ content: 'a'.repeat(5001) })
    ).toThrow()
  })
})

describe('TicketFiltersSchema', () => {
  it('aplica defaults corretos', () => {
    expect(TicketFiltersSchema.parse({})).toEqual({
      page: 1,
      perPage: 20,
    })
  })

  it('rejeita page menor que 1', () => {
    expect(() => TicketFiltersSchema.parse({ page: 0 })).toThrow()
  })

  it('rejeita perPage acima de 100', () => {
    expect(() => TicketFiltersSchema.parse({ perPage: 101 })).toThrow()
  })
})

describe('CreateUserSchema', () => {
  const validUser = {
    name: 'Joao Silva',
    email: 'joao@test.com',
    password: 'Senha@123',
    role: 'ANALYST' as const,
  }

  it('aceita input valido', () => {
    expect(CreateUserSchema.parse(validUser)).toEqual(validUser)
  })

  it('rejeita email invalido', () => {
    expect(() =>
      CreateUserSchema.parse({ ...validUser, email: 'invalido' })
    ).toThrow()
  })

  it('rejeita senha muito curta', () => {
    expect(() =>
      CreateUserSchema.parse({ ...validUser, password: '123' })
    ).toThrow()
  })
})

describe('LoginSchema', () => {
  it('aceita credenciais validas', () => {
    expect(
      LoginSchema.parse({ email: 'a@b.com', password: '123456' })
    ).toEqual({ email: 'a@b.com', password: '123456' })
  })

  it('rejeita email invalido', () => {
    expect(() =>
      LoginSchema.parse({ email: 'invalido', password: '123456' })
    ).toThrow()
  })
})

describe('CreateChecklistTemplateSchema', () => {
  const validTemplate = {
    name: 'Checklist de teste',
    periodicity: 'DAILY' as const,
    items: [
      {
        title: 'Item 1',
        type: 'CONFORMITY' as const,
        order: 0,
        isRequired: true,
      },
    ],
  }

  it('aceita template valido', () => {
    expect(CreateChecklistTemplateSchema.parse(validTemplate)).toEqual(validTemplate)
  })

  it('rejeita sem itens', () => {
    expect(() =>
      CreateChecklistTemplateSchema.parse({ ...validTemplate, items: [] })
    ).toThrow()
  })

  it('rejeita periodicidade invalida', () => {
    expect(() =>
      CreateChecklistTemplateSchema.parse({
        ...validTemplate,
        periodicity: 'INVALID',
      })
    ).toThrow()
  })
})

describe('SectorSchema', () => {
  it('aceita setor valido', () => {
    expect(SectorSchema.parse({ name: 'TI' })).toEqual({
      name: 'TI',
      isActive: true,
    })
  })

  it('rejeita nome muito curto', () => {
    expect(() => SectorSchema.parse({ name: 'A' })).toThrow()
  })
})

describe('UnitSchema', () => {
  it('aceita unidade valida', () => {
    expect(UnitSchema.parse({ name: 'Matriz' })).toEqual({
      name: 'Matriz',
      isActive: true,
    })
  })
})

describe('UpdateCompanySchema', () => {
  it('aceita nome valido', () => {
    expect(UpdateCompanySchema.parse({ name: 'Empresa' })).toEqual({
      name: 'Empresa',
    })
  })

  it('aceita com logoUrl', () => {
    expect(
      UpdateCompanySchema.parse({
        name: 'Empresa',
        logoUrl: 'https://example.com/logo.png',
      })
    ).toEqual({
      name: 'Empresa',
      logoUrl: 'https://example.com/logo.png',
    })
  })

  it('rejeita nome muito curto', () => {
    expect(() => UpdateCompanySchema.parse({ name: 'A' })).toThrow()
  })
})

describe('SlaConfigSchema', () => {
  const validConfig = { CRITICAL: 2, HIGH: 8, MEDIUM: 24, LOW: 72 }

  it('aceita config valido', () => {
    expect(SlaConfigSchema.parse(validConfig)).toEqual(validConfig)
  })

  it('rejeita valor fora do range', () => {
    expect(() => SlaConfigSchema.parse({ ...validConfig, CRITICAL: 0 })).toThrow()
    expect(() => SlaConfigSchema.parse({ ...validConfig, LOW: 721 })).toThrow()
  })
})
