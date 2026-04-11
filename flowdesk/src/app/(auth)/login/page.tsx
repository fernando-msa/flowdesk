// FlowDesk — Login Page
import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Entrar' }

export default function LoginPage({
  searchParams,
}: {
  searchParams?: {
    callbackUrl?: string
    email?: string
    password?: string
  }
}) {
  const rawCallbackUrl = searchParams?.callbackUrl ?? '/dashboard'
  const callbackUrl =
    rawCallbackUrl.startsWith('/') &&
    rawCallbackUrl !== '/' &&
    !rawCallbackUrl.startsWith('/api/') &&
    !rawCallbackUrl.startsWith('/login') &&
    !rawCallbackUrl.startsWith('/forgot-password')
      ? rawCallbackUrl
      : '/dashboard'
  const initialEmail = searchParams?.email ?? ''
  const initialPassword = searchParams?.password ?? ''
  const autoSubmitOnMount =
    process.env.NODE_ENV === 'development' && Boolean(initialEmail && initialPassword)

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FlowDesk</h1>
          <p className="text-brand-300 mt-1 text-sm">Gestão operacional inteligente</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-gray-500 text-sm mb-6">Entre com suas credenciais para continuar</p>
          <LoginForm
            callbackUrl={callbackUrl}
            initialEmail={initialEmail}
            initialPassword={initialPassword}
            autoSubmitOnMount={autoSubmitOnMount}
          />
        </div>

        <p className="text-center text-brand-400 text-xs mt-6">
          © {new Date().getFullYear()} FlowDesk. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
