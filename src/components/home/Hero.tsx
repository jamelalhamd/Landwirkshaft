import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sprout, ChevronDown } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const ArrowEnd = locale === 'ar' ? ArrowLeft : ArrowRight

  const stats = [
    { value: '1,247', label: dict.home.stats.research },
    { value: '86',    label: dict.home.stats.projects },
    { value: '312',   label: dict.home.stats.seeds },
    { value: '540',   label: dict.home.stats.researchers },
  ]

  return (
    <section className="relative overflow-hidden bg-primary-950 text-white">
      {/* ── Green identity accent top bar ── */}
      <div className="h-1.5 bg-gradient-to-r from-secondary-700 via-secondary-400 to-secondary-700" aria-hidden />

      {/* ── Arabesque geometric pattern ── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden>
        <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="arabesque" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M36 0L72 36L36 72L0 36Z" fill="none" stroke="white" strokeWidth="0.7" />
              <circle cx="36" cy="36" r="14" fill="none" stroke="white" strokeWidth="0.7" />
              <circle cx="0"  cy="0"  r="5" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="72" cy="0"  r="5" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="0"  cy="72" r="5" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="72" cy="72" r="5" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arabesque)" />
        </svg>
      </div>

      {/* ── Ambient light orbs ── */}
      <div className="pointer-events-none absolute -top-48 end-0 size-[40rem] rounded-full bg-secondary-500/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 start-[-8%] size-[28rem] rounded-full bg-primary-600/15 blur-3xl" aria-hidden />

      {/* ── Main content ── */}
      <div className="container relative grid items-center gap-12 py-20 md:py-28 lg:grid-cols-5">

        {/* Left: Text (3 cols) */}
        <div className="lg:col-span-3">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-500/25 bg-secondary-500/10 px-4 py-1.5 text-xs font-semibold text-secondary-300 backdrop-blur-sm">
            <Sprout className="size-3.5 text-secondary-400" aria-hidden />
            {dict.home.hero.eyebrow}
          </div>

          {/* Title */}
          <h1 className="mt-5 text-balance text-4xl font-black leading-[1.1] text-white sm:text-5xl xl:text-[3.4rem]">
            {dict.home.hero.title}
          </h1>

          {/* Green underline accent */}
          <div className="mt-4 flex items-center gap-3" aria-hidden>
            <div className="h-[3px] w-14 rounded-full bg-secondary-500" />
            <div className="h-[3px] w-5 rounded-full bg-secondary-500/40" />
            <div className="h-[3px] w-2 rounded-full bg-secondary-500/20" />
          </div>

          {/* Subtitle */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300/85 sm:text-lg">
            {dict.home.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/research`}
              className="inline-flex items-center gap-2 rounded-xl bg-secondary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-secondary-900/40 transition-all hover:bg-secondary-500 hover:shadow-secondary-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {dict.home.hero.ctaPrimary}
              <ArrowEnd className="size-4 rtl-flip" aria-hidden />
            </Link>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/35 active:scale-[0.98]"
            >
              {dict.home.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Right: Stat panels (2 cols) — desktop only */}
        <div className="hidden lg:col-span-2 lg:block" aria-hidden>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:border-secondary-500/30 hover:bg-white/[0.07]"
              >
                <div className="text-[2.5rem] font-black tabular-nums leading-none text-white">
                  {s.value}
                </div>
                <div className="mt-2 text-[11px] font-medium leading-snug text-slate-400">
                  {s.label}
                </div>
                <div className="pointer-events-none absolute -bottom-3 -end-3 size-16 rounded-full bg-secondary-500/10 transition-all group-hover:scale-150 group-hover:opacity-50" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile stats strip ── */}
      <div className="border-t border-white/[0.08] lg:hidden">
        <div className="container grid grid-cols-2 divide-x divide-white/[0.08] sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="px-4 py-4 text-center">
              <div className="text-2xl font-black tabular-nums text-white">{s.value}</div>
              <div className="mt-0.5 text-[10px] text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-5 start-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1" aria-hidden>
        <div className="h-5 w-px bg-white/20" />
        <ChevronDown className="size-4 text-white/30 animate-bounce" />
      </div>
    </section>
  )
}
