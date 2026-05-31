// Página: Configurações — hub principal com abas
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isManagerOrAbove, isAdmin } from '@/lib/permissions'
import { DEFAULT_SLA } from '@/lib/validations/settings'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export const metadata: Metadata = { title: 'Configurações' }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) return null
  if (!isManagerOrAbove(session)) redirect('/dashboard')

  const { companyId } = session.user

  const [company, units, sectors] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true, logoUrl: true },
    }),
    prisma.unit.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true, isActive: true },
    }),
    prisma.sector.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true, isActive: true },
    }),
  ])

  if (!company) redirect('/')

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie empresa, unidades, setores e parâmetros do sistema" />
      <SettingsTabs
        company={company}
        units={units}
        sectors={sectors}
        slaDefaults={DEFAULT_SLA}
        canAdmin={isAdmin(session)}
      />
    </div>
  )
}
