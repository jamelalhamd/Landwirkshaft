import Link from 'next/link'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { getRepository } from '@/lib/data/repository'
import { formatDate } from '@/lib/utils'
import { Calendar, Flame } from 'lucide-react'

export const revalidate = 120

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const repo = await getRepository()
  const news = await repo.getLatestNews(20)

  return (
    <>
      <PageHeader title={dict.nav.news} />
      <section className="gov-section">
        <div className="container">
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface-elevated">
            {news.map((n) => (
              <li key={n.id}>
                <Link href={`/${locale}/news/${n.slug}`} className="flex flex-col gap-2 p-5 hover:bg-surface-muted md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {n.is_breaking && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                          <Flame className="size-3" aria-hidden /> {dict.home.ticker.label}
                        </span>
                      )}
                      <h3 className="text-fluid-base font-bold text-ink">{locale === 'ar' ? n.title_ar : n.title_en}</h3>
                    </div>
                    <p className="mt-1 line-clamp-2 text-fluid-sm text-ink-muted">{locale === 'ar' ? n.excerpt_ar : n.excerpt_en}</p>
                  </div>
                  <div className="flex items-center gap-2 text-fluid-xs text-ink-subtle">
                    <Calendar className="size-3.5" aria-hidden />
                    <time dateTime={n.publish_at ?? ''}>{n.publish_at ? formatDate(n.publish_at, locale) : ''}</time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
