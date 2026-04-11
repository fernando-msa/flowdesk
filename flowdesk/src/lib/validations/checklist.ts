import { z } from 'zod'

export const ChecklistTemplateItemSchema = z.object({
  title: z.string().min(2, 'Título do item é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['CONFORMITY', 'TEXT', 'NUMBER', 'DATE', 'ATTACHMENT']),
  order: z.number().default(0),
  isRequired: z.boolean().default(true),
})

export const CreateChecklistTemplateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres').max(200),
  description: z.string().optional(),
  periodicity: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ON_DEMAND']),
  unitId: z.string().optional(),
  sectorId: z.string().optional(),
  items: z.array(ChecklistTemplateItemSchema).min(1, 'Adicione ao menos um item'),
})

export const ExecuteChecklistItemSchema = z.object({
  templateItemId: z.string(),
  isConform: z.boolean().optional().nullable(),
  textValue: z.string().optional().nullable(),
  numberValue: z.number().optional().nullable(),
  dateValue: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  isNonConformity: z.boolean().default(false),
})

export const ExecuteChecklistSchema = z.object({
  templateId: z.string(),
  unitId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(ExecuteChecklistItemSchema),
})

export type CreateChecklistTemplateInput = z.infer<typeof CreateChecklistTemplateSchema>
export type ExecuteChecklistInput = z.infer<typeof ExecuteChecklistSchema>
