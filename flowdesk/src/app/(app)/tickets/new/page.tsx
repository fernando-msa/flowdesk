// Página: Novo Chamado
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TicketForm } from '@/components/tickets/TicketForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Novo Chamado' }

export default async function NewTicketPage() {
  const session = await auth()
  if (!session?.user) return null

  const { companyId } = session.user

  const [units, sectors, analysts] = await Promise.all([
    prisma.unit.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.sector.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({
      where: { companyId, isActive: true, role: { in: ['ADMIN', 'MANAGER', 'ANALYST'] } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={15} />
          Voltar para chamados
        </Link>
        <PageHeader
          title="Novo Chamado"
          description="Preencha os dados para abrir um novo chamado"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <TicketForm units={units} sectors={sectors} analysts={analysts} />
      </div>
    </div>
  )
}
