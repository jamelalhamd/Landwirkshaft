import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Flame } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { getRepository } from '@/lib/data/repository'
import { formatDate } from '@/lib/utils'

export async function LatestNews({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const repo = await getRepository()
  const news = await repo.getLatestNews(6)
  if (news.length === 0) return null

  const [hero, ...rest] = news
  const ArrowEnd = locale === 'ar' ? ArrowLeft : ArrowRight

  return (
    <section className="gov-section">
      <div className="container">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-fluid-2xl font-extrabold text-ink">{dict.home.latestNews.title}</h2>
            <p className="mt-1 text-fluid-sm text-ink-muted">{dict.home.latestNews.subtitle}</p>
          </div>
          <Link href={`/${locale}/news`} className="btn-outline">
            {dict.common.viewAll}
            <ArrowEnd className="size-4 rtl-flip" aria-hidden />
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hero article */}
          {hero && (
            <Link
              href={`/${locale}/news/${hero.slug}`}
              className="gov-card-interactive group relative col-span-1 overflow-hidden lg:col-span-2 lg:row-span-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900">
                <div className="absolute inset-0 grid place-items-center text-white/30 text-7xl font-black">
                  GCSAR
                </div>
                {hero.is_breaking && (
                  <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                    <Flame className="size-3" aria-hidden />
                    {dict.home.ticker.label}
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="mb-2 flex items-center gap-2 text-fluid-xs text-ink-subtle">
                  <Calendar className="size-3.5" aria-hidden />
                  <time dateTime={hero.publish_at ?? ''}>
                    {hero.publish_at ? formatDate(hero.publish_at, locale) : ''}
                  </time>
                </div>
                <h3 className="text-fluid-xl font-bold text-ink group-hover:text-primary-700">
                  {locale === 'ar' ? hero.title_ar : hero.title_en}
                </h3>
                <p className="mt-2 text-fluid-sm text-ink-muted text-pretty">
                  {locale === 'ar' ? hero.excerpt_ar : hero.excerpt_en}
                </p>
              </div>
            </Link>
          )}

          {/* Side cards */}
          {rest.slice(0, 4).map((n) => (
            <Link
              key={n.id}
              href={`/${locale}/news/${n.slug}`}
              className="gov-card-interactive group p-5"
            >
              <div className="mb-2 flex items-center gap-2 text-fluid-xs text-ink-subtle">
                <Calendar className="size-3.5" aria-hidden />
                <time dateTime={n.publish_at ?? ''}>
                  {n.publish_at ? formatDate(n.publish_at, locale) : ''}
                </time>
              </div>
              <h3 className="text-fluid-base font-bold text-ink group-hover:text-primary-700">
                {locale === 'ar' ? n.title_ar : n.title_en}
              </h3>
              <p className="mt-1 line-clamp-2 text-fluid-sm text-ink-muted">
                {locale === 'ar' ? n.excerpt_ar : n.excerpt_en}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
