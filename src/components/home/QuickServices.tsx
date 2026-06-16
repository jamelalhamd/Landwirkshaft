import Link from 'next/link'
import { Sprout, BookOpen, FileText, MapPinned, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

const ICONS = {
  seedRegistry: Sprout,
  library: BookOpen,
  decisions: FileText,
  contact: MapPinned,
} as const

const HREFS = {
  seedRegistry: 'research',
  library: 'research',
  decisions: 'documents',
  contact: 'contact',
} as const

const NUMBERS = ['01', '02', '03', '04'] as const

export function QuickServices({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const ArrowEnd = locale === 'ar' ? ArrowLeft : ArrowRight

  const items = Object.entries(dict.home.quickServices.items) as [
    keyof typeof ICONS,
    { title: string; desc: string },
  ][]

  return (
    <section className="gov-section bg-surface">
      <div className="container">
        {/* Section header */}
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-3" aria-hidden>
            <div className="h-[3px] w-10 rounded-full bg-secondary-500" />
            <div className="h-[3px] w-4 rounded-full bg-secondary-500/40" />
          </div>
          <h2 className="text-fluid-2xl font-extrabold text-ink">
            {dict.home.quickServices.title}
          </h2>
          <p className="mt-1.5 text-fluid-sm text-ink-muted">
            {dict.home.quickServices.subtitle}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([key, item], i) => {
            const Icon = ICONS[key]
            return (
              <Link
                key={key}
                href={`/${locale}/${HREFS[key]}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-6 shadow-gov transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-gov-md"
              >
                {/* Hover top accent */}
                <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-secondary-500 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />

                {/* Number badge */}
                <span className="mb-4 inline-block text-[11px] font-black tabular-nums tracking-widest text-secondary-500/60">
                  {NUMBERS[i]}
                </span>

                {/* Icon */}
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-primary-100 bg-primary-50 text-primary-700 transition-all duration-300 group-hover:border-primary-700 group-hover:bg-primary-700 group-hover:text-white">
                  <Icon className="size-5" aria-hidden />
                </div>

                <h3 className="text-fluid-base font-bold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-fluid-sm text-ink-muted leading-relaxed">{item.desc}</p>

                {/* Read more */}
                <span className="mt-4 inline-flex items-center gap-1 text-fluid-xs font-semibold text-primary-700 opacity-0 transition-all group-hover:gap-2 group-hover:opacity-100">
                  {dict.common.readMore}
                  <ArrowEnd className="size-3 rtl-flip" aria-hidden />
                </span>

                {/* Ambient glow */}
                <span className="pointer-events-none absolute -bottom-8 -end-8 size-28 rounded-full bg-secondary-100/60 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
