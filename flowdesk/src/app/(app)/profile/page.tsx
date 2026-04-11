// Página: Perfil do Usuário
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProfileForm } from '@/components/profile'

export const metadata: Metadata = { title: 'Meu Perfil' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) redirect('/dashboard')

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { name: true, slug: true },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e preferências"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          <ProfileForm user={user} />
        </div>

        {/* Info card */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{company?.name}</p>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Membro desde</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
