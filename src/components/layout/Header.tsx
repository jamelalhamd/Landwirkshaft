'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Search, Menu, LayoutDashboard, LogIn, Clock3 } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { LanguageSwitcher } from './LanguageSwitcher'
import { AccessibilityMenu } from './AccessibilityMenu'
import { NavigationDrawer } from './NavigationDrawer'
import { SearchOverlay } from './SearchOverlay'
import { LiveClock } from './LiveClock'
import { useClientSession } from '@/lib/hooks/useClientSession'
import { cn } from '@/lib/utils'
import type { SiteSettings } from '@/lib/data/getSiteSettings'

interface Props {
  locale: Locale
  dict: Dictionary
  siteSettings?: SiteSettings
}

const NAV_KEYS = ['home', 'about', 'staff', 'news', 'documents', 'research', 'gallery', 'contact'] as const

export function Header({ locale, dict, siteSettings }: Props) {
  const isAr = locale === 'ar'
  const siteName = isAr
    ? (siteSettings?.site_name_ar ?? dict.meta.siteName)
    : (siteSettings?.site_name_en ?? dict.meta.siteName)
  const tagline = isAr
    ? (siteSettings?.tagline_ar ?? dict.meta.tagline)
    : (siteSettings?.tagline_en ?? dict.meta.tagline)
  const logo1 = siteSettings?.logo_url ?? '/logos/idsyria.jpg'
  const logo2 = siteSettings?.logo2_url ?? '/logos/logo2.png'
  const [scrolled,     setScrolled]    = useState(false)
  const [drawerOpen,   setDrawerOpen]  = useState(false)
  const [searchOpen,   setSearchOpen]  = useState(false)
  const pathname = usePathname()
  const session  = useClientSession()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openDrawer  = useCallback(() => setDrawerOpen(true),  [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const nav = NAV_KEYS.map((key) => ({
    key,
    label: dict.nav[key],
    href: key === 'home' ? `/${locale}` : `/${locale}/${key}`,
  }))

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : !!pathname?.startsWith(href)

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-shadow duration-300',
          scrolled && 'shadow-[0_4px_24px_rgba(0,0,0,0.18)]',
        )}
      >
        {/* ── 1. Official government strip ──────────────────── */}
        <div className="bg-primary-950">
          <div className="container flex h-9 items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="size-3.5 shrink-0 text-secondary-400/90" aria-hidden />
              <span className="font-semibold text-white/90">{dict.common.officialBadge}</span>
              <span className="text-white/25 hidden sm:inline">·</span>
              <span className="text-white/55 hidden sm:inline">{dict.meta.country}</span>
            </div>
            {/* Auth strip — login link OR user name + live clock */}
            {!session.loading && (
              session.authenticated ? (
                <Link
                  href={`/${locale}/admin`}
                  className="flex items-center gap-2 text-[11px] font-medium text-white/80 transition-colors hover:text-secondary-300"
                >
                  <LayoutDashboard className="size-3 shrink-0" aria-hidden />
                  <span className="max-w-[140px] truncate">{session.displayName}</span>
                  <span className="text-white/30" aria-hidden>·</span>
                  <Clock3 className="size-3 shrink-0 text-secondary-400" aria-hidden />
                  <span className="text-secondary-300">
                    <LiveClock locale={locale} />
                  </span>
                </Link>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-white/55 transition-colors hover:text-secondary-400"
                >
                  <LogIn className="size-3 shrink-0" aria-hidden />
                  {locale === 'ar' ? 'دخول المنظومة' : 'Staff login'}
                </Link>
              )
            )}
          </div>
        </div>

        {/* ── 2. Brand / identity bar ─────────────────────────── */}
        <div className="border-b border-border/60 bg-white dark:bg-surface">
          <div className="container flex items-center justify-between gap-4 py-3">
            {/* Logo + name */}
            <Link
              href={`/${locale}`}
              className="group flex shrink items-center gap-3 sm:gap-4 min-w-0"
              aria-label={dict.meta.siteName}
            >
              <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                <Image
                  src={logo1}
                  alt={dict.meta.country}
                  width={64}
                  height={64}
                  priority
                  unoptimized={logo1.startsWith('https://firebasestorage')}
                  className="rounded-full object-cover ring-2 ring-primary-200 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                  style={{ width: 64, height: 64 }}
                />
                <div className="hidden h-10 w-px bg-border/60 sm:block" aria-hidden />
                <Image
                  src={logo2}
                  alt=""
                  width={56}
                  height={58}
                  unoptimized={logo2.startsWith('https://firebasestorage') || logo2.endsWith('.svg')}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  style={{ width: 56, height: 58 }}
                />
              </div>

              <div className="hidden min-w-0 leading-tight sm:block">
                <span className="block truncate text-sm font-bold text-primary-900 dark:text-white sm:text-base">
                  {siteName}
                </span>
                <span className="block text-[11px] text-ink-subtle sm:text-xs">
                  {tagline}
                </span>
              </div>
            </Link>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label={dict.common.search}
                className="hidden size-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline sm:inline-flex"
              >
                <Search className="size-4" aria-hidden />
              </button>
              <LanguageSwitcher currentLocale={locale} label={dict.common.language} />
              <AccessibilityMenu dict={dict} locale={locale} />

              {/* Admin / login icon — visible on all screen sizes */}
              {!session.loading && (
                <Link
                  href={session.authenticated ? `/${locale}/admin` : `/${locale}/login`}
                  aria-label={session.authenticated ? dict.nav.admin : (locale === 'ar' ? 'تسجيل الدخول' : 'Sign in')}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline',
                    session.authenticated
                      ? 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100'
                      : 'border-border text-ink-muted hover:bg-surface-muted hover:text-ink',
                  )}
                >
                  {session.authenticated
                    ? <LayoutDashboard className="size-4" aria-hidden />
                    : <LogIn className="size-4" aria-hidden />}
                </Link>
              )}

              {/* Mobile hamburger → opens comprehensive drawer */}
              <button
                type="button"
                onClick={openDrawer}
                aria-label={dict.drawer.allSections}
                aria-expanded={drawerOpen}
                aria-haspopup="dialog"
                aria-controls="nav-drawer"
                className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline lg:hidden"
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. Desktop navigation bar ───────────────────────── */}
        <nav
          aria-label={dict.common.menu}
          className="hidden bg-primary-700 dark:bg-primary-800 lg:block"
        >
          <div className="container flex items-stretch">
            {nav.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block border-b-2 px-4 py-3.5 text-[13px] font-medium transition-all duration-200',
                    'hover:bg-primary-800/60 hover:text-white hover:border-secondary-500',
                    active
                      ? 'border-secondary-500 bg-primary-800/70 font-semibold text-white'
                      : 'border-transparent text-white/80',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}

            {/* Desktop "all sections" hamburger — end of nav bar */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={dict.drawer.allSections}
              aria-expanded={drawerOpen}
              aria-haspopup="dialog"
              aria-controls="nav-drawer"
              className="ms-auto flex items-center gap-2 border-s border-white/15 px-5 py-3.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-primary-800 hover:text-white focus-visible:outline focus-visible:outline-white"
            >
              <Menu className="size-4" aria-hidden />
              <span>{dict.drawer.allSections}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ── Navigation Drawer (portal-like, outside sticky header) ── */}
      <NavigationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        locale={locale}
        dict={dict}
      />

      {/* ── Search Overlay ── */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
        dict={dict}
      />
    </>
  )
}
