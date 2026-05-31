import { z } from 'zod'

export const SectorSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

export const UnitSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(200),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

export const UpdateCompanySchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(200),
  logoUrl: z.string().url().optional().nullable(),
})

export const SlaConfigSchema = z.object({
  CRITICAL: z.number().min(1).max(720),
  HIGH: z.number().min(1).max(720),
  MEDIUM: z.number().min(1).max(720),
  LOW: z.number().min(1).max(720),
})

export const DEFAULT_SLA = {
  CRITICAL: 2,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
}

export type SectorInput = z.infer<typeof SectorSchema>
export type UnitInput = z.infer<typeof UnitSchema>
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>
export type SlaConfig = z.infer<typeof SlaConfigSchema>
