import { BookText, FlaskConical, Sprout, Users } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { getRepository } from '@/lib/data/repository'
import { formatNumber } from '@/lib/utils'

const ICONS = {
  research:    BookText,
  projects:    FlaskConical,
  seeds:       Sprout,
  researchers: Users,
} as const

export async function Statistics({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const repo  = await getRepository()
  const stats = await repo.getSiteStats()
  const lookup = Object.fromEntries(stats.map((s) => [s.key, s.value]))

  const items = (['research', 'projects', 'seeds', 'researchers'] as const).map((k) => ({
    key:   k,
    Icon:  ICONS[k],
    label: dict.home.stats[k],
    value: lookup[k] ?? 0,
  }))

  return (
    <section className="relative overflow-hidden bg-primary-950 py-14 md:py-20">
      {/* Background arabesque (reuse same pattern id is fine — same SVG, different render) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]" aria-hidden>
        <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stats-bg" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M32 0L64 32L32 64L0 32Z" fill="none" stroke="white" strokeWidth="0.6" />
              <circle cx="32" cy="32" r="12" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stats-bg)" />
        </svg>
      </div>

      <div className="container relative">
        {/* Section header */}
        <header className="mb-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-3" aria-hidden>
            <div className="h-px w-12 bg-secondary-500/40" />
            <div className="size-1.5 rounded-full bg-secondary-500" />
            <div className="h-px w-12 bg-secondary-500/40" />
          </div>
          <h2 className="text-fluid-2xl font-extrabold text-white">
            {dict.home.stats.title}
          </h2>
        </header>

        {/* Stats grid — gap-px on dark bg creates 1px dividers */}
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.key}
              className="group flex flex-col items-center gap-3 bg-primary-950 px-8 py-10 text-center transition-colors hover:bg-primary-900/80"
            >
              {/* Icon circle */}
              <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-secondary-500/25 bg-secondary-500/10 text-secondary-400 transition-all group-hover:border-secondary-400/50 group-hover:bg-secondary-500/20">
                <it.Icon className="size-6" aria-hidden />
              </div>

              {/* Number */}
              <div className="text-[3rem] font-black tabular-nums leading-none text-white">
                {formatNumber(it.value, locale)}
              </div>

              {/* Label */}
              <div className="text-sm font-medium text-slate-400">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
