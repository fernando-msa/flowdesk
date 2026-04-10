// Página: Criar novo template de checklist
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAnalystOrAbove } from '@/lib/permissions'
import { ChecklistTemplateForm } from '@/components/checklists/ChecklistTemplateForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Novo Checklist' }

export default async function NewChecklistPage() {
  const session = await auth()
  if (!session?.user) return null
  if (!isAnalystOrAbove(session)) redirect('/checklists')

  const { companyId } = session.user

  const [units, sectors] = await Promise.all([
    prisma.unit.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.sector.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/checklists" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={15} /> Voltar para checklists
        </Link>
        <PageHeader
          title="Novo Checklist"
          description="Configure o modelo e adicione os itens de verificação"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ChecklistTemplateForm units={units} sectors={sectors} />
      </div>
    </div>
  )
}
