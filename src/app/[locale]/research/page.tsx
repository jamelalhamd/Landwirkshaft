import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { getRepository } from '@/lib/data/repository'
import { BookOpen, Quote } from 'lucide-react'

export const revalidate = 600

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const repo = await getRepository()
  const papers = await repo.listResearch()

  return (
    <>
      <PageHeader title={dict.nav.research} />
      <section className="gov-section">
        <div className="container">
          <ul className="space-y-4">
            {papers.map((p) => (
              <li key={p.id} className="gov-card p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-secondary-50 text-secondary-700">
                    <BookOpen className="size-5" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <span className="gov-chip">{p.field} · {p.year}</span>
                    <h3 className="mt-2 font-bold text-ink">{locale === 'ar' ? p.title_ar : p.title_en}</h3>
                    <p className="mt-1 text-fluid-sm text-ink-muted text-pretty">
                      {locale === 'ar' ? p.abstract_ar : p.abstract_en}
                    </p>
                    <p className="mt-2 text-fluid-xs text-ink-subtle">
                      {p.authors.join(' · ')}
                      {p.issn ? ` · ISSN ${p.issn}` : ''}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-fluid-xs text-ink-muted">
                      <Quote className="size-3.5" aria-hidden />
                      {p.citations_count} {locale === 'ar' ? 'استشهاد' : 'citations'}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
