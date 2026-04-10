// Página: Execução de Checklist
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { ChecklistExecutionForm } from '@/components/checklists/ChecklistExecutionForm'

export const metadata: Metadata = { title: 'Executar Checklist' }

interface PageProps { params: { id: string } }

export default async function ExecuteChecklistPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) return null

  const template = await prisma.checklistTemplate.findFirst({
    where: { id: params.id, companyId: session.user.companyId, isActive: true },
    include: { items: { orderBy: { order: 'asc' } }, sector: true, unit: true },
  })

  if (!template) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <Link href="/checklists" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={15} /> Voltar para checklists
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {template.sector?.name} {template.unit ? `· ${template.unit.name}` : ''}
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ChecklistExecutionForm template={template} />
      </div>
    </div>
  )
}
