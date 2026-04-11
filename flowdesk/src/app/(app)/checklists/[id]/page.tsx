// Página: Detalhe + edição de template de checklist
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAnalystOrAbove } from '@/lib/permissions'
import { ChecklistTemplateForm } from '@/components/checklists/ChecklistTemplateForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { ArrowLeft, Play } from 'lucide-react'

export const metadata: Metadata = { title: 'Editar Checklist' }

interface PageProps { params: { id: string } }

const PERIODICITY_LABELS = {
  DAILY: 'DAILY', WEEKLY: 'WEEKLY', MONTHLY: 'MONTHLY', ON_DEMAND: 'ON_DEMAND',
} as const

export default async function ChecklistDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) return null
  if (!isAnalystOrAbove(session)) notFound()

  const { companyId } = session.user

  const [template, units, sectors] = await Promise.all([
    prisma.checklistTemplate.findFirst({
      where: { id: params.id, companyId },
      include: { items: { orderBy: { order: 'asc' } } },
    }),
    prisma.unit.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.sector.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  if (!template) notFound()

  const defaultValues = {
    name:        template.name,
    description: template.description ?? '',
    periodicity: template.periodicity as typeof PERIODICITY_LABELS[keyof typeof PERIODICITY_LABELS],
    unitId:      template.unitId ?? '',
    sectorId:    template.sectorId ?? '',
    items:       template.items.map((item) => ({
      title:       item.title,
      description: item.description ?? '',
      type:        item.type as 'CONFORMITY' | 'TEXT' | 'NUMBER' | 'DATE' | 'ATTACHMENT',
      order:       item.order,
      isRequired:  item.isRequired,
    })),
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/checklists" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={15} /> Voltar para checklists
        </Link>
        <PageHeader title={`Editar: ${template.name}`}>
          <Link
            href={`/checklists/${template.id}/execute`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            <Play size={14} /> Executar
          </Link>
        </PageHeader>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ChecklistTemplateForm
          units={units}
          sectors={sectors}
          defaultValues={defaultValues}
          templateId={template.id}
        />
      </div>
    </div>
  )
}
