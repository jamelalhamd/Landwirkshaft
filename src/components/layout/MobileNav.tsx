'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

interface NavItem {
  key: string
  label: string
  href: string
}

interface Props {
  nav: NavItem[]
  dict: Dictionary
  locale: Locale
}

export function MobileNav({ nav, dict, locale }: Props) {
  const [open, setOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const isRtl = locale === 'ar'

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // Delay focus to after transition starts
      const t = setTimeout(() => closeButtonRef.current?.focus(), 100)
      return () => clearTimeout(t)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Close when route changes
  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : !!pathname?.startsWith(href)

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.common.menu}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {/* Backdrop overlay */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Slide drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={dict.common.menu}
        className={cn(
          'fixed inset-y-0 end-0 z-50 flex w-80 max-w-[90vw] flex-col lg:hidden',
          'bg-surface-elevated shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          open
            ? 'translate-x-0'
            : isRtl
              ? '-translate-x-full'
              : 'translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex shrink-0 items-center justify-between bg-primary-950 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logos/syria-eagle.svg"
              alt={dict.meta.country}
              width={40}
              height={40}
              style={{ width: 40, height: 40 }}
            />
            <div className="h-9 w-px bg-white/15" aria-hidden />
            <Image
              src="/logos/gcsar-logo.svg"
              alt=""
              width={34}
              height={34}
              style={{ width: 34, height: 34 }}
            />
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={dict.common.close}
            className="inline-flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {/* Navigation links */}
        <nav
          className="flex-1 overflow-y-auto"
          aria-label={dict.common.menu}
        >
          <ul role="list" className="divide-y divide-border/40 py-1">
            {nav.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-5 py-4 text-[15px] font-medium transition-colors duration-150',
                      active
                        ? 'border-s-2 border-secondary-500 bg-primary-50 text-primary-800 dark:bg-primary-950/50 dark:text-white ps-[18px]'
                        : 'text-ink hover:bg-surface-muted hover:text-primary-700',
                    )}
                  >
                    <span>{item.label}</span>
                    <ArrowIcon
                      className="size-4 shrink-0 text-ink-subtle"
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Drawer footer — language switcher */}
        <div className="shrink-0 border-t border-border bg-surface-muted/50 p-4">
          <LanguageSwitcher currentLocale={locale} label={dict.common.language} />
        </div>
      </div>
    </>
  )
}
