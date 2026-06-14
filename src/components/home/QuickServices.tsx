import Link from 'next/link'
import { Sprout, BookOpen, FileText, MapPinned } from 'lucide-react'
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

export function QuickServices({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = Object.entries(dict.home.quickServices.items) as [
    keyof typeof ICONS,
    { title: string; desc: string },
  ][]

  return (
    <section className="gov-section">
      <div className="container">
        <header className="mb-8">
          <h2 className="text-fluid-2xl font-extrabold text-ink">{dict.home.quickServices.title}</h2>
          <p className="mt-1 text-fluid-sm text-ink-muted">{dict.home.quickServices.subtitle}</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([key, item]) => {
            const Icon = ICONS[key]
            return (
              <Link
                key={key}
                href={`/${locale}/${HREFS[key]}`}
                className="gov-card-interactive group relative overflow-hidden p-5"
              >
                <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 transition group-hover:bg-primary-700 group-hover:text-white">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="text-fluid-base font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-fluid-sm text-ink-muted">{item.desc}</p>
                <span className="pointer-events-none absolute -bottom-6 -end-6 size-24 rounded-full bg-secondary-100/50 blur-2xl transition-opacity group-hover:opacity-100" aria-hidden />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
