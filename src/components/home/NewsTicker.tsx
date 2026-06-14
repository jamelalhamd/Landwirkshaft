import Link from 'next/link'
import { Megaphone } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { getRepository } from '@/lib/data/repository'

export async function NewsTicker({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const repo = await getRepository()
  const items = await repo.getBreakingNews()
  if (items.length === 0) return null

  const animation = locale === 'ar' ? 'animate-marquee-rtl' : 'animate-marquee-ltr'

  return (
    <div className="border-y border-border bg-surface-elevated/80">
      <div className="container flex items-center gap-3 overflow-hidden py-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-fluid-xs font-bold text-white">
          <Megaphone className="size-3" aria-hidden />
          {dict.home.ticker.label}
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className={`flex whitespace-nowrap gap-10 ${animation}`}>
            {items.concat(items).map((n, idx) => (
              <Link
                key={`${n.id}-${idx}`}
                href={`/${locale}/news/${n.slug}`}
                className="text-fluid-sm font-medium text-ink-muted hover:text-ink"
              >
                {locale === 'ar' ? n.title_ar : n.title_en}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
