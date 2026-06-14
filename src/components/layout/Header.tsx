'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Search, Menu } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { LanguageSwitcher } from './LanguageSwitcher'
import { AccessibilityMenu } from './AccessibilityMenu'
import { NavigationDrawer } from './NavigationDrawer'
import { cn } from '@/lib/utils'

interface Props {
  locale: Locale
  dict: Dictionary
}

const NAV_KEYS = ['home', 'about', 'staff', 'news', 'documents', 'research', 'gallery', 'contact'] as const

export function Header({ locale, dict }: Props) {
  const [scrolled,    setScrolled]    = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const pathname = usePathname()

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
              <ShieldCheck className="size-3.5 shrink-0 text-secondary-400" aria-hidden />
              <span className="font-semibold text-white/90">{dict.common.officialBadge}</span>
              <span className="text-white/25 hidden sm:inline">·</span>
              <span className="text-white/55 hidden sm:inline">{dict.meta.country}</span>
            </div>
            <Link
              href={`/${locale}/admin`}
              className="text-[11px] font-medium text-white/55 transition-colors hover:text-secondary-400"
            >
              {dict.nav.admin}
            </Link>
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
                  src="/logos/syria-eagle.svg"
                  alt={dict.meta.country}
                  width={52}
                  height={52}
                  priority
                  className="drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                  style={{ width: 52, height: 52 }}
                />
                <div className="hidden h-10 w-px bg-border/60 sm:block" aria-hidden />
                <Image
                  src="/logos/gcsar-logo.svg"
                  alt=""
                  width={44}
                  height={44}
                  className="transition-transform duration-300 group-hover:scale-105"
                  style={{ width: 44, height: 44 }}
                />
              </div>

              <div className="hidden min-w-0 leading-tight sm:block">
                <span className="block truncate text-sm font-bold text-primary-900 dark:text-white sm:text-base">
                  {dict.meta.siteName}
                </span>
                <span className="block text-[11px] text-ink-subtle sm:text-xs">
                  {dict.meta.tagline}
                </span>
              </div>
            </Link>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                aria-label={dict.common.search}
                className="hidden size-9 items-center justify-center rounded-lg border border-border text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline sm:inline-flex"
              >
                <Search className="size-4" aria-hidden />
              </button>
              <LanguageSwitcher currentLocale={locale} label={dict.common.language} />
              <AccessibilityMenu dict={dict} />

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
                    'hover:bg-primary-800/60 hover:text-white hover:border-secondary-400',
                    active
                      ? 'border-secondary-400 bg-primary-800/70 font-semibold text-white'
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
    </>
  )
}
