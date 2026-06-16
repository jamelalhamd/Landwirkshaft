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
    <div className="bg-primary-800 text-white">
      <div className="container flex items-stretch overflow-hidden">
        {/* Fixed label */}
        <div className="flex shrink-0 items-center gap-2 bg-red-600 px-5 py-2.5">
          <Megaphone className="size-3.5" aria-hidden />
          <span className="text-[11px] font-black uppercase tracking-wider">
            {dict.home.ticker.label}
          </span>
        </div>

        {/* Vertical separator */}
        <div className="w-px shrink-0 bg-white/15" aria-hidden />

        {/* Scrolling news */}
        <div className="relative flex-1 overflow-hidden py-2.5 ps-5">
          <div className={`flex gap-12 whitespace-nowrap ${animation}`}>
            {items.concat(items).map((n, idx) => (
              <Link
                key={`${n.id}-${idx}`}
                href={`/${locale}/news/${n.slug}`}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-white/75 transition-colors hover:text-white"
              >
                <span className="size-1 shrink-0 rounded-full bg-secondary-400/60" aria-hidden />
                {locale === 'ar' ? n.title_ar : n.title_en}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
