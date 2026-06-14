import Link from 'next/link'
import { BookOpen, FileText, Users, Image as ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

const PILLARS = [
  { key: 'research',  icon: BookOpen,  href: 'research',  tone: 'from-primary-700 to-primary-900' },
  { key: 'documents', icon: FileText,  href: 'documents', tone: 'from-secondary-600 to-secondary-800' },
  { key: 'staff',     icon: Users,     href: 'staff',     tone: 'from-sky-700 to-sky-900' },
  { key: 'gallery',   icon: ImageIcon, href: 'gallery',   tone: 'from-amber-600 to-amber-800' },
] as const

export function Pillars({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const ArrowEnd = locale === 'ar' ? ArrowLeft : ArrowRight
  return (
    <section className="gov-section">
      <div className="container">
        <header className="mb-8 text-center">
          <h2 className="text-fluid-2xl font-extrabold text-ink">{dict.home.sections.title}</h2>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon
            const meta = dict.home.sections[p.key as keyof typeof dict.home.sections] as { title: string; desc: string }
            return (
              <Link
                key={p.key}
                href={`/${locale}/${p.href}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-gov transition hover:shadow-gov-lg hover:-translate-y-0.5"
              >
                <div className={`relative h-32 bg-gradient-to-br ${p.tone}`}>
                  <Icon className="absolute end-4 top-4 size-24 text-white/15" aria-hidden />
                  <Icon className="absolute start-4 bottom-4 size-7 text-white" aria-hidden />
                </div>
                <div className="p-5">
                  <h3 className="text-fluid-base font-bold text-ink">{meta.title}</h3>
                  <p className="mt-1 text-fluid-sm text-ink-muted">{meta.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-fluid-xs font-semibold text-primary-700 group-hover:gap-2 transition-all">
                    {dict.common.readMore}
                    <ArrowEnd className="size-3.5 rtl-flip" aria-hidden />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
