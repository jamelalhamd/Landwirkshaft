import { BookText, FlaskConical, Sprout, Users } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { getRepository } from '@/lib/data/repository'
import { formatNumber } from '@/lib/utils'

const ICONS = {
  research: BookText,
  projects: FlaskConical,
  seeds: Sprout,
  researchers: Users,
} as const

export async function Statistics({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const repo = await getRepository()
  const stats = await repo.getSiteStats()
  const lookup = Object.fromEntries(stats.map((s) => [s.key, s.value]))

  const items = (['research', 'projects', 'seeds', 'researchers'] as const).map((k) => ({
    key: k,
    icon: ICONS[k],
    label: dict.home.stats[k],
    value: lookup[k] ?? 0,
  }))

  return (
    <section className="gov-section bg-surface-muted">
      <div className="container">
        <header className="mb-8 text-center">
          <h2 className="text-fluid-2xl font-extrabold text-ink">{dict.home.stats.title}</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <div key={it.key} className="gov-card flex items-center gap-4 p-5">
                <div className="grid size-14 place-items-center rounded-xl bg-secondary-50 text-secondary-700">
                  <Icon className="size-6" aria-hidden />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-ink tabular-nums">
                    {formatNumber(it.value, locale)}
                  </div>
                  <div className="text-fluid-sm text-ink-muted">{it.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
