// Página: Lista de Chamados
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { listTickets } from '@/server/services/ticket.service'
import { TicketTable } from '@/components/tickets/TicketTable'
import { TicketFilters } from '@/components/tickets/TicketFilters'
import { PageHeader } from '@/components/shared/PageHeader'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { TicketFiltersSchema } from '@/lib/validations/ticket'
import { buildPaginationMeta } from '@/lib/utils'

export const metadata: Metadata = { title: 'Chamados' }

interface PageProps {
  searchParams: Record<string, string>
}

export default async function TicketsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) return null

  const filters = TicketFiltersSchema.parse(searchParams)
  const { tickets, total } = await listTickets(session.user, filters)
  const meta = buildPaginationMeta(total, filters.page, filters.perPage)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Chamados"
        description={`${total} chamado${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
      >
        <Link
          href="/tickets/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo chamado
        </Link>
      </PageHeader>

      <TicketFilters />

      <TicketTable tickets={tickets as Parameters<typeof TicketTable>[0]['tickets']} />

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Exibindo {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.total)} de {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <PaginationLink
              href={`/tickets?page=${meta.page - 1}`}
              disabled={!meta.hasPrev}
              label="Anterior"
              icon={<ChevronLeft size={16} />}
            />
            <span className="text-sm text-gray-600 px-2">
              {meta.page} / {meta.totalPages}
            </span>
            <PaginationLink
              href={`/tickets?page=${meta.page + 1}`}
              disabled={!meta.hasNext}
              label="Próximo"
              icon={<ChevronRight size={16} />}
              iconRight
            />
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationLink({
  href,
  disabled,
  label,
  icon,
  iconRight,
}: {
  href: string
  disabled: boolean
  label: string
  icon: React.ReactNode
  iconRight?: boolean
}) {
  if (disabled) {
    return (
      <span className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 border border-gray-200 rounded-lg cursor-not-allowed">
        {!iconRight && icon} {label} {iconRight && icon}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {!iconRight && icon} {label} {iconRight && icon}
    </Link>
  )
}
