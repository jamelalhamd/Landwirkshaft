import Link from 'next/link'
import { ArrowLeft, ArrowRight, Sprout } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const ArrowEnd = locale === 'ar' ? ArrowLeft : ArrowRight
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white">
      {/* decorative pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden>
        <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40V0h40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -top-32 end-[-10%] size-[28rem] rounded-full bg-secondary-500/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 start-[-8%] size-[24rem] rounded-full bg-primary-400/20 blur-3xl" aria-hidden />

      <div className="container relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-fluid-xs font-semibold text-secondary-200 backdrop-blur">
            <Sprout className="size-3.5" aria-hidden />
            {dict.home.hero.eyebrow}
          </span>
          <h1 className="mt-5 text-balance text-fluid-4xl font-extrabold leading-[1.15]">
            {dict.home.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-fluid-base text-slate-200/90 leading-relaxed">
            {dict.home.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/research`} className="btn bg-secondary-600 text-white hover:bg-secondary-700 shadow-gov-md">
              {dict.home.hero.ctaPrimary}
              <ArrowEnd className="size-4 rtl-flip" aria-hidden />
            </Link>
            <Link href={`/${locale}/about`} className="btn border border-white/25 bg-white/5 text-white hover:bg-white/10">
              {dict.home.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Decorative card stack */}
        <div className="relative hidden lg:block" aria-hidden>
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-sm" />
          <div className="relative grid grid-cols-2 gap-4">
            {[
              { v: '1,247', l: dict.home.stats.research, c: 'from-secondary-500/30 to-secondary-700/10' },
              { v: '86',    l: dict.home.stats.projects, c: 'from-primary-400/30 to-primary-700/10' },
              { v: '312',   l: dict.home.stats.seeds,    c: 'from-emerald-400/30 to-emerald-700/10' },
              { v: '540',   l: dict.home.stats.researchers, c: 'from-sky-400/30 to-sky-700/10' },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl border border-white/15 bg-gradient-to-br ${s.c} p-5`}>
                <div className="text-3xl font-extrabold">{s.v}</div>
                <div className="mt-1 text-xs text-slate-200/80">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
