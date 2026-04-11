import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  role: z.enum(['ADMIN', 'MANAGER', 'ANALYST', 'REQUESTER']),
  unitId: z.string().optional(),
  sectorId: z.string().optional(),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'ANALYST', 'REQUESTER']).optional(),
  unitId: z.string().nullable().optional(),
  sectorId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
