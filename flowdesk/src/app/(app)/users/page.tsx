// Página: Gestão de Usuários (Admin only)
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { getInitials, formatDate } from '@/lib/utils'
import { Users, ShieldCheck, UserCheck, User, UserMinus } from 'lucide-react'

export const metadata: Metadata = { title: 'Usuários' }

const ROLE_CONFIG = {
  ADMIN:     { label: 'Administrador', icon: ShieldCheck, className: 'bg-red-50 text-red-700' },
  MANAGER:   { label: 'Gestor',        icon: UserCheck,   className: 'bg-purple-50 text-purple-700' },
  ANALYST:   { label: 'Analista',      icon: User,        className: 'bg-blue-50 text-blue-700' },
  REQUESTER: { label: 'Solicitante',   icon: UserMinus,   className: 'bg-gray-100 text-gray-600' },
}

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user) return null
  if (!isAdmin(session)) redirect('/dashboard')

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId },
    include: {
      sector: { select: { name: true } },
      unit: { select: { name: true } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="space-y-5">
      <PageHeader title="Usuários" description={`${users.length} usuário${users.length !== 1 ? 's' : ''} cadastrado${users.length !== 1 ? 's' : ''}`}>
        {/* TODO: Add user modal */}
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Usuário</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Perfil</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Setor / Unidade</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden xl:table-cell">Cadastrado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const roleConf = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]
              return (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{getInitials(user.name)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${roleConf.className}`}>
                      {roleConf.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">
                    <div>
                      {user.sector?.name && <span>{user.sector.name}</span>}
                      {user.unit?.name && <span className="text-gray-400"> · {user.unit.name}</span>}
                      {!user.sector && !user.unit && <span className="text-gray-300">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-gray-400 text-xs">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
