'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { LoginSchema, type LoginInput } from '@/lib/validations/user'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  callbackUrl?: string
  initialEmail?: string
  initialPassword?: string
  autoSubmitOnMount?: boolean
}

export function LoginForm({
  callbackUrl = '/dashboard',
  initialEmail = '',
  initialPassword = '',
  autoSubmitOnMount = false,
}: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const autoSubmittedRef = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: initialEmail,
      password: initialPassword,
    },
  })

  const onSubmit = useCallback(
    async (data: LoginInput) => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          setError('E-mail ou senha inválidos. Verifique e tente novamente.')
          return
        }

        router.push(callbackUrl)
        router.refresh()
      } catch {
        setError('Ocorreu um erro inesperado. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    },
    [callbackUrl, router]
  )

  useEffect(() => {
    if (!autoSubmitOnMount || autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    void handleSubmit(onSubmit)()
  }, [autoSubmitOnMount, handleSubmit, onSubmit])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors',
            'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            errors.email ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
          )}
          placeholder="seu@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            className={cn(
              'w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm bg-white transition-colors',
              'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              errors.password ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
            )}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
          'bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>

      {/* Demo credentials */}
      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">Credenciais de demonstração:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>
            <span className="font-medium text-gray-700">Admin:</span>
            <br />admin@flowdesk.dev
          </div>
          <div>
            <span className="font-medium text-gray-700">Analista:</span>
            <br />analista@flowdesk.dev
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Senha padrão: [Role]@123</p>
      </div>
    </form>
  )
}
