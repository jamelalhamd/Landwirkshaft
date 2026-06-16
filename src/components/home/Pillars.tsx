import Link from 'next/link'
import { BookOpen, FileText, Users, Image as ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

const PILLARS = [
  { key: 'research',  icon: BookOpen,   href: 'research',  accent: 'bg-primary-600',   ring: 'bg-primary-50 border-primary-100 text-primary-700' },
  { key: 'documents', icon: FileText,   href: 'documents', accent: 'bg-secondary-600', ring: 'bg-secondary-50 border-secondary-100 text-secondary-700' },
  { key: 'staff',     icon: Users,      href: 'staff',     accent: 'bg-sky-600',        ring: 'bg-sky-50 border-sky-100 text-sky-700' },
  { key: 'gallery',   icon: ImageIcon,  href: 'gallery',   accent: 'bg-amber-600',      ring: 'bg-amber-50 border-amber-100 text-amber-700' },
] as const

export function Pillars({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const ArrowEnd = locale === 'ar' ? ArrowLeft : ArrowRight

  return (
    <section className="gov-section bg-surface-muted">
      <div className="container">
        {/* Section header */}
        <header className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-3" aria-hidden>
            <div className="h-[3px] w-10 rounded-full bg-secondary-500" />
            <div className="size-1.5 rounded-full bg-secondary-500/60" />
            <div className="h-[3px] w-10 rounded-full bg-secondary-500" />
          </div>
          <h2 className="text-fluid-2xl font-extrabold text-ink">{dict.home.sections.title}</h2>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon
            const meta = dict.home.sections[p.key as keyof typeof dict.home.sections] as {
              title: string
              desc: string
            }
            return (
              <Link
                key={p.key}
                href={`/${locale}/${p.href}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-gov transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-gov-md"
              >
                {/* Top accent line */}
                <div className={`h-1 w-full ${p.accent} rounded-t-2xl`} aria-hidden />

                <div className="flex flex-1 flex-col p-6">
                  {/* Icon badge */}
                  <div className={`mb-5 inline-flex size-12 items-center justify-center rounded-xl border ${p.ring} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="size-5" aria-hidden />
                  </div>

                  <h3 className="text-fluid-base font-bold text-ink leading-snug">
                    {meta.title}
                  </h3>
                  <p className="mt-2 flex-1 text-fluid-sm text-ink-muted leading-relaxed">
                    {meta.desc}
                  </p>

                  {/* Read more */}
                  <span className="mt-5 inline-flex items-center gap-1 text-fluid-xs font-semibold text-primary-700 transition-all group-hover:gap-2">
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
