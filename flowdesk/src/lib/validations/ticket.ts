import { z } from 'zod'

export const CreateTicketSchema = z.object({
  title: z.string().min(5, 'Título deve ter ao menos 5 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.string().optional(),
  unitId: z.string().optional(),
  sectorId: z.string().optional(),
  assigneeId: z.string().optional(),
})

export const UpdateTicketSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_RESPONSE', 'RESOLVED', 'CLOSED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z.string().optional(),
  unitId: z.string().nullable().optional(),
  sectorId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode ser vazio').max(5000),
  isInternal: z.boolean().default(false),
})

export const TicketFiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  sectorId: z.string().optional(),
  unitId: z.string().optional(),
  assigneeId: z.string().optional(),
  requesterId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(20),
})

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type TicketFilters = z.infer<typeof TicketFiltersSchema>
