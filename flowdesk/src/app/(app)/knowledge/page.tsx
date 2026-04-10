// Página: Base de Conhecimento
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAnalystOrAbove } from '@/lib/permissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { BookOpen, Plus, Eye, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Base de Conhecimento' }

interface PageProps {
  searchParams: { search?: string; category?: string }
}

export default async function KnowledgePage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) return null

  const canManage = isAnalystOrAbove(session)
  const { search, category } = searchParams

  const articles = await prisma.knowledgeArticle.findMany({
    where: {
      companyId: session.user.companyId,
      status: 'PUBLISHED',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    },
    include: { author: { select: { name: true } } },
    orderBy: { views: 'desc' },
  })

  const categories = await prisma.knowledgeArticle.findMany({
    where: { companyId: session.user.companyId, status: 'PUBLISHED', category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  })

  const uniqueCategories = categories.map((c) => c.category).filter(Boolean) as string[]

  return (
    <div className="space-y-5">
      <PageHeader title="Base de Conhecimento" description="Artigos e procedimentos internos">
        {canManage && (
          <Link
            href="/knowledge/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Novo artigo
          </Link>
        )}
      </PageHeader>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="search"
            defaultValue={search ?? ''}
            placeholder="Buscar artigos..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>
        {uniqueCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/knowledge"
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                !category ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </Link>
            {uniqueCategories.map((cat) => (
              <Link
                key={cat}
                href={`/knowledge?category=${encodeURIComponent(cat)}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  category === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
      </div>

      {articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum artigo encontrado"
          description={search ? `Sem resultados para "${search}"` : 'A base de conhecimento ainda está vazia.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge/${article.id}`}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-blue-600" />
                </div>
                {article.category && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{article.category}</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                {article.title}
              </h3>
              {article.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{article.author.name}</span>
                <span className="flex items-center gap-1">
                  <Eye size={11} /> {article.views}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {article.publishedAt ? formatDate(article.publishedAt) : ''}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
