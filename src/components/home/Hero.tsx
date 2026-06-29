import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { getSiteSettings } from '@/lib/data/getSiteSettings'

export async function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const ArrowEnd = locale === 'ar' ? ArrowLeft : ArrowRight
  const isAr = locale === 'ar'

  const settings = await getSiteSettings({
    siteName:     dict.meta.siteName,
    tagline:      dict.meta.tagline,
    heroTitle:    dict.home.hero.title,
    heroSubtitle: dict.home.hero.subtitle,
    heroEyebrow:  dict.home.hero.eyebrow,
  })

  const heroTitle    = isAr ? settings.hero_title_ar    : settings.hero_title_en
  const heroSubtitle = isAr ? settings.hero_subtitle_ar : settings.hero_subtitle_en
  const heroEyebrow  = isAr ? settings.hero_eyebrow_ar  : settings.hero_eyebrow_en

  const stats = [
    { value: '1,247', label: dict.home.stats.research },
    { value: '86',    label: dict.home.stats.projects },
    { value: '312',   label: dict.home.stats.seeds },
    { value: '540',   label: dict.home.stats.researchers },
  ]

  return (
    <section className="relative overflow-hidden bg-primary-950 text-white">
      {/* ── Gold identity accent top bar (mofaex style) ── */}
      <div
        className="h-1.5 bg-gradient-to-r from-secondary-800 via-secondary-500 to-secondary-800"
        aria-hidden
      />

      {/* ── Subtle grid texture ── */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden>
        <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="govgrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#govgrid)" />
        </svg>
      </div>

      {/* ── Ambient gold glow (centre) ── */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[52rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-secondary-500/10 blur-3xl"
        aria-hidden
      />

      {/* ── Main centred content ── */}
      <div className="container relative flex flex-col items-center py-20 text-center md:py-28">

        {/* Mofaex emblem — the imported logo */}
        <div className="relative mb-8 flex items-center justify-center">
          <div
            className="absolute size-56 rounded-full bg-secondary-500/5 blur-2xl"
            aria-hidden
          />
          <Image
            src="/logos/logo2.png"
            alt={dict.meta.siteName}
            width={192}
            height={201}
            priority
            className="relative w-36 sm:w-44 xl:w-48 drop-shadow-[0_0_32px_rgba(188,164,117,0.2)]"
          />
        </div>

        {/* Gold ornamental rule */}
        <div className="mb-6 flex items-center justify-center gap-3" aria-hidden>
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-secondary-500/50" />
          <div className="size-1.5 rounded-full bg-secondary-500" />
          <div className="size-2.5 rounded-full border border-secondary-500/60 bg-secondary-500/20" />
          <div className="size-1.5 rounded-full bg-secondary-500" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-secondary-500/50" />
        </div>

        {/* Eyebrow chip */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-secondary-500/30 bg-secondary-500/10 px-4 py-1.5 text-xs font-semibold text-secondary-300 backdrop-blur-sm">
          {heroEyebrow}
        </div>

        {/* Page title */}
        <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.1] text-white sm:text-5xl xl:text-[3.2rem]">
          {heroTitle}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300/75 sm:text-lg">
          {heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/research`}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-secondary-900/30 transition-all hover:bg-secondary-500 hover:-translate-y-0.5 active:scale-[0.98]"
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

      {/* ── Stats strip ── */}
      <div className="border-t border-secondary-500/15">
        <div className="container grid grid-cols-2 divide-x divide-secondary-500/15 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="px-4 py-5 text-center">
              <div className="text-2xl font-black tabular-nums text-white sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] font-medium text-secondary-400/80">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
