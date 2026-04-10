'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, Mail } from 'lucide-react'
import { FileUploader, type UploadedFile } from '@/components/shared/FileUploader'
import { cn } from '@/lib/utils'

const Schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  image: z.string().url().optional().or(z.literal('')),
})
type FormData = z.infer<typeof Schema>

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: user.name,
      image: user.image ?? '',
    },
  })

  const image = watch('image')

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Erro ao salvar')
        return
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

   const handleImageUpload = (files: UploadedFile[]) => {
     if (files[0]) setValue('image', files[0].url, { shouldDirty: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 size={15} /> Alterações salvas com sucesso!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo *</label>
        <input {...register('name')} className={inputCls(!!errors.name)} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
          <Mail size={14} />
          E-mail (não editável)
        </label>
        <input value={user.email} disabled className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
        <p className="mt-1 text-xs text-gray-400">Entre em contato com o administrador para alterar seu e-mail.</p>
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto de perfil</label>
         {image && (
          <div className="mb-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
               src={image}
               alt="Perfil"
              className="h-16 w-16 rounded-full border border-gray-200 object-cover"
            />
            <button
              type="button"
               onClick={() => setValue('image', '', { shouldDirty: true })}
              className="text-xs text-red-500 hover:underline"
            >
               Remover foto
            </button>
          </div>
        )}
        <FileUploader
          endpoint="userAvatar"
           onUploadComplete={handleImageUpload}
          maxFiles={1}
          label="Envie sua foto de perfil (PNG ou JPG recomendado)"
        />
      </div>

      <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading || !isDirty}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {isLoading ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
    hasError ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
  )
}
