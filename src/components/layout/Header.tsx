import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Search } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { LanguageSwitcher } from './LanguageSwitcher'
import { AccessibilityMenu } from './AccessibilityMenu'
import { MobileNav } from './MobileNav'

interface Props {
  locale: Locale
  dict: Dictionary
}

const NAV_KEYS = ['home', 'about', 'staff', 'news', 'documents', 'research', 'gallery', 'contact'] as const

export function Header({ locale, dict }: Props) {
  const nav = NAV_KEYS.map((key) => ({
    key,
    label: dict.nav[key],
    href: key === 'home' ? `/${locale}` : `/${locale}/${key}`,
  }))

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      {/* Top utility strip */}
      <div className="bg-primary-900 text-white">
        <div className="container flex h-9 items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5" aria-hidden />
            <span>{dict.common.officialBadge} · {dict.meta.country}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/admin`} className="opacity-80 hover:opacity-100">
              {dict.nav.admin}
            </Link>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-center gap-3" aria-label={dict.meta.siteName}>
          <span className="flex items-center gap-1.5">
            <Image src="/logos/gcsar-logo.svg" alt="" width={36} height={36} className="size-9" />
            <Image src="/logos/syria-eagle.svg" alt="" width={36} height={36} className="size-9" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-fluid-sm font-extrabold text-ink">{dict.meta.siteName}</span>
            <span className="text-[11px] text-ink-subtle">{dict.meta.tagline}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label={dict.common.menu} className="hidden lg:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-md px-3 py-2 text-fluid-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={dict.common.search}
            className="hidden sm:inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-elevated/60 text-ink-muted hover:bg-surface-muted"
          >
            <Search className="size-4" aria-hidden />
          </button>
          <LanguageSwitcher currentLocale={locale} label={dict.common.language} />
          <AccessibilityMenu dict={dict} />
          <MobileNav nav={nav} dict={dict} />
        </div>
      </div>
    </header>
  )
}
