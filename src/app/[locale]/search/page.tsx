import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { getRepository } from '@/lib/data/repository'
import { PageHeader } from '@/components/ui/PageHeader'
import Link from 'next/link'
import { FileText, Newspaper, User, FlaskConical } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = await getDictionary(locale)
  const { q = '' } = await searchParams
  const query = q.trim().toLowerCase()

  const repo = await getRepository()
  const [news, staff, documents, research] = await Promise.all([
    repo.getLatestNews(100),
    repo.listStaff(),
    repo.listDocuments(),
    repo.listResearch(),
  ])

  const matchedNews = query
    ? news.filter(
        (n) =>
          n.title_ar.toLowerCase().includes(query) ||
          n.title_en.toLowerCase().includes(query) ||
          n.excerpt_ar?.toLowerCase().includes(query) ||
          n.excerpt_en?.toLowerCase().includes(query),
      )
    : []

  const matchedStaff = query
    ? staff.filter(
        (s) =>
          s.full_name_ar.toLowerCase().includes(query) ||
          s.full_name_en.toLowerCase().includes(query) ||
          s.position_ar.toLowerCase().includes(query) ||
          s.position_en.toLowerCase().includes(query),
      )
    : []

  const matchedDocuments = query
    ? documents.filter(
        (d) =>
          d.title_ar.toLowerCase().includes(query) ||
          d.title_en.toLowerCase().includes(query),
      )
    : []

  const matchedResearch = query
    ? research.filter(
        (r) =>
          r.title_ar.toLowerCase().includes(query) ||
          r.title_en.toLowerCase().includes(query) ||
          r.abstract_ar?.toLowerCase().includes(query) ||
          r.abstract_en?.toLowerCase().includes(query),
      )
    : []

  const totalCount =
    matchedNews.length + matchedStaff.length + matchedDocuments.length + matchedResearch.length

  return (
    <>
      <PageHeader
        title={dict.common.searchResults}
        subtitle={query ? `${dict.common.searchResultsFor} "${q}"` : undefined}
      />
      <section className="gov-section">
        <div className="container max-w-3xl space-y-10">
          {!query || totalCount === 0 ? (
            <p className="text-ink-muted">{dict.common.searchNoResults}</p>
          ) : (
            <>
              {/* News */}
              {matchedNews.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-fluid-lg font-bold text-ink">
                    <Newspaper className="size-5 text-primary-700" aria-hidden />
                    {dict.common.searchTypeNews}
                  </h2>
                  <ul className="space-y-3">
                    {matchedNews.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={`/${locale}/news/${n.slug}`}
                          className="gov-card block p-4 transition-shadow hover:shadow-gov-md"
                        >
                          <p className="font-semibold text-ink">
                            {locale === 'ar' ? n.title_ar : n.title_en}
                          </p>
                          {(locale === 'ar' ? n.excerpt_ar : n.excerpt_en) && (
                            <p className="mt-1 text-fluid-xs text-ink-muted line-clamp-2">
                              {locale === 'ar' ? n.excerpt_ar : n.excerpt_en}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Staff */}
              {matchedStaff.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-fluid-lg font-bold text-ink">
                    <User className="size-5 text-primary-700" aria-hidden />
                    {dict.common.searchTypeStaff}
                  </h2>
                  <ul className="space-y-3">
                    {matchedStaff.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/${locale}/staff`}
                          className="gov-card block p-4 transition-shadow hover:shadow-gov-md"
                        >
                          <p className="font-semibold text-ink">
                            {locale === 'ar' ? s.full_name_ar : s.full_name_en}
                          </p>
                          <p className="mt-1 text-fluid-xs text-ink-muted">
                            {locale === 'ar' ? s.position_ar : s.position_en}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {matchedDocuments.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-fluid-lg font-bold text-ink">
                    <FileText className="size-5 text-primary-700" aria-hidden />
                    {dict.common.searchTypeDocuments}
                  </h2>
                  <ul className="space-y-3">
                    {matchedDocuments.map((d) => (
                      <li key={d.id}>
                        <Link
                          href={`/${locale}/documents`}
                          className="gov-card block p-4 transition-shadow hover:shadow-gov-md"
                        >
                          <p className="font-semibold text-ink">
                            {locale === 'ar' ? d.title_ar : d.title_en}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Research */}
              {matchedResearch.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-fluid-lg font-bold text-ink">
                    <FlaskConical className="size-5 text-primary-700" aria-hidden />
                    {dict.common.searchTypeResearch}
                  </h2>
                  <ul className="space-y-3">
                    {matchedResearch.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/${locale}/research`}
                          className="gov-card block p-4 transition-shadow hover:shadow-gov-md"
                        >
                          <p className="font-semibold text-ink">
                            {locale === 'ar' ? r.title_ar : r.title_en}
                          </p>
                          {(locale === 'ar' ? r.abstract_ar : r.abstract_en) && (
                            <p className="mt-1 text-fluid-xs text-ink-muted line-clamp-2">
                              {locale === 'ar' ? r.abstract_ar : r.abstract_en}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
