import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Flame, Tag } from 'lucide-react'
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
  const categoryLabel = locale === 'ar' ? 'أخبار' : 'News'

  return (
    <section className="gov-section bg-surface">
      <div className="container">
        {/* Section header */}
        <header className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3" aria-hidden>
              <div className="h-[3px] w-10 rounded-full bg-secondary-500" />
              <div className="h-[3px] w-4 rounded-full bg-secondary-500/40" />
            </div>
            <h2 className="text-fluid-2xl font-extrabold text-ink">
              {dict.home.latestNews.title}
            </h2>
            <p className="mt-1.5 text-fluid-sm text-ink-muted">
              {dict.home.latestNews.subtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/news`}
            className="btn-outline shrink-0 text-sm"
          >
            {dict.common.viewAll}
            <ArrowEnd className="size-4 rtl-flip" aria-hidden />
          </Link>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ── Hero article ── */}
          {hero && (
            <Link
              href={`/${locale}/news/${hero.slug}`}
              className="gov-card-interactive group relative col-span-1 flex flex-col overflow-hidden lg:col-span-2 lg:row-span-2"
            >
              {/* Thumbnail */}
              <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 shrink-0">
                {/* Decorative GCSAR watermark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl font-black text-white/10 select-none">GCSAR</span>
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent" />

                {/* Breaking badge */}
                {hero.is_breaking && (
                  <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold text-white shadow-lg">
                    <Flame className="size-3" aria-hidden />
                    {dict.home.ticker.label}
                  </span>
                )}

                {/* Category chip */}
                <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  <Tag className="size-3" aria-hidden />
                  {categoryLabel}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-2 text-fluid-xs text-ink-subtle">
                  <Calendar className="size-3.5 shrink-0" aria-hidden />
                  <time dateTime={hero.publish_at ?? ''}>
                    {hero.publish_at ? formatDate(hero.publish_at, locale) : ''}
                  </time>
                </div>
                <h3 className="text-fluid-xl font-bold text-ink leading-snug group-hover:text-primary-700 transition-colors">
                  {locale === 'ar' ? hero.title_ar : hero.title_en}
                </h3>
                <p className="mt-2 flex-1 text-fluid-sm text-ink-muted text-pretty leading-relaxed">
                  {locale === 'ar' ? hero.excerpt_ar : hero.excerpt_en}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-fluid-xs font-semibold text-primary-700 opacity-0 transition-all group-hover:gap-2.5 group-hover:opacity-100">
                  {dict.common.readMore}
                  <ArrowEnd className="size-3.5 rtl-flip" aria-hidden />
                </span>
              </div>
            </Link>
          )}

          {/* ── Side cards ── */}
          {rest.slice(0, 4).map((n) => (
            <Link
              key={n.id}
              href={`/${locale}/news/${n.slug}`}
              className="gov-card-interactive group flex gap-4 p-5"
            >
              {/* Thumbnail strip */}
              <div className="relative h-full w-16 shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-primary-600 to-primary-900" aria-hidden>
                <div className="absolute inset-0 flex items-end justify-center pb-1">
                  <span className="text-[7px] font-black text-white/20 leading-none">GCSAR</span>
                </div>
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-1.5 text-fluid-xs text-ink-subtle">
                  <Calendar className="size-3 shrink-0" aria-hidden />
                  <time dateTime={n.publish_at ?? ''}>
                    {n.publish_at ? formatDate(n.publish_at, locale) : ''}
                  </time>
                </div>
                <h3 className="line-clamp-2 text-fluid-sm font-bold text-ink leading-snug group-hover:text-primary-700 transition-colors">
                  {locale === 'ar' ? n.title_ar : n.title_en}
                </h3>
                <p className="mt-1 line-clamp-2 text-fluid-xs text-ink-muted">
                  {locale === 'ar' ? n.excerpt_ar : n.excerpt_en}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
