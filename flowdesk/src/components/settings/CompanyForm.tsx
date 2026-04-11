'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { FileUploader, type UploadedFile } from '@/components/shared/FileUploader'
import { cn } from '@/lib/utils'

const Schema = z.object({
  name:    z.string().min(2, 'Nome obrigatório'),
  logoUrl: z.string().url().optional().or(z.literal('')),
})
type FormData = z.infer<typeof Schema>

interface CompanyFormProps {
  company: { name: string; logoUrl?: string | null; slug: string }
}

export function CompanyForm({ company }: CompanyFormProps) {
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { name: company.name, logoUrl: company.logoUrl ?? '' },
  })

  const logoUrl = watch('logoUrl')

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/settings/company', {
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

  const handleLogoUpload = (files: UploadedFile[]) => {
    if (files[0]) setValue('logoUrl', files[0].url, { shouldDirty: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 size={15} /> Alterações salvas com sucesso!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da empresa *</label>
        <input {...register('name')} className={inputCls(!!errors.name)} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (identificador único)</label>
        <input value={company.slug} disabled className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
        <p className="mt-1 text-xs text-gray-400">O slug não pode ser alterado após a criação.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo da empresa</label>
        {logoUrl && (
          <div className="mb-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" className="h-12 w-auto rounded-lg border border-gray-200 object-contain p-1" />
            <button type="button" onClick={() => setValue('logoUrl', '', { shouldDirty: true })} className="text-xs text-red-500 hover:underline">
              Remover logo
            </button>
          </div>
        )}
        <FileUploader
          endpoint="companyLogo"
          onUploadComplete={handleLogoUpload}
          maxFiles={1}
          label="Envie o logo da empresa (PNG ou SVG recomendado)"
        />
      </div>

      <div className="pt-2">
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
