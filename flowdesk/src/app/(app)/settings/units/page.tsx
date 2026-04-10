// Página: Gestão de Unidades e Setores
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isManagerOrAbove } from '@/lib/permissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/lib/utils'
import { Building2, FolderOpen } from 'lucide-react'

export const metadata: Metadata = { title: 'Unidades e Setores' }

export default async function UnitsPage() {
  const session = await auth()
  if (!session?.user) return null
  if (!isManagerOrAbove(session)) redirect('/dashboard')

  const [units, sectors] = await Promise.all([
    prisma.unit.findMany({ where: { companyId: session.user.companyId }, orderBy: { name: 'asc' } }),
    prisma.sector.findMany({ where: { companyId: session.user.companyId }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="Unidades e Setores" description="Gerencie a estrutura organizacional da empresa" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Units */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={16} className="text-brand-600" />
              Unidades ({units.length})
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {units.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Nenhuma unidade cadastrada</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nome</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 hidden md:table-cell">Criada</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{unit.name}</p>
                        {unit.description && <p className="text-xs text-gray-400">{unit.description}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{formatDate(unit.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${unit.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {unit.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Sectors */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen size={16} className="text-brand-600" />
              Setores ({sectors.length})
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {sectors.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Nenhum setor cadastrado</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nome</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 hidden md:table-cell">Criado</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sectors.map((sector) => (
                    <tr key={sector.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{sector.name}</p>
                        {sector.description && <p className="text-xs text-gray-400">{sector.description}</p>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{formatDate(sector.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sector.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {sector.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
