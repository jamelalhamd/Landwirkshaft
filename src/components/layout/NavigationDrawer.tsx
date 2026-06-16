'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  X, ChevronDown, ChevronRight, ChevronLeft, Search,
  Home, Info, Users, Phone, Newspaper, TrendingUp, Calendar,
  Atom, BookOpen, GraduationCap, Wrench, Mic,
  Leaf, FileText, Scale, Rss, MapPin, Film,
  Mail, Facebook, Youtube,
  ScrollText, Target, Building2, Presentation, Library,
  BarChart3, FlaskConical,
} from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

/* ── Types ─────────────────────────────────────────────── */

interface SubItem {
  labelKey: keyof Dictionary['drawer']
  href: string
}

interface NavItem {
  labelKey: keyof Dictionary['nav']
  href: string
  Icon: LucideIcon
  badge?: string
  children?: SubItem[]
  /** Hide on lg+ because the desktop navbar already shows this link */
  navbarLink?: boolean
}

interface Section {
  id: string
  titleKey: keyof Dictionary['drawer']
  items: NavItem[]
  /** Entire section is hidden on lg+ because all its links are in the desktop navbar */
  navbarSection?: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  locale: Locale
  dict: Dictionary
}

/* ── Component ──────────────────────────────────────────── */

export function NavigationDrawer({ open, onClose, locale, dict }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const closeRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const isRtl = locale === 'ar'

  /* Build section data */
  const sections: Section[] = [
    /* ── Mobile-only: mirrors desktop navbar ── */
    {
      id: 'main',
      titleKey: 'mainPages',
      navbarSection: true,
      items: [
        { labelKey: 'home',    href: `/${locale}`,         Icon: Home },
        { labelKey: 'about',   href: `/${locale}/about`,   Icon: Info },
        { labelKey: 'staff',   href: `/${locale}/staff`,   Icon: Users },
        { labelKey: 'contact', href: `/${locale}/contact`, Icon: Phone },
      ],
    },

    /* ── About sub-pages (not in navbar) ── */
    {
      id: 'about',
      titleKey: 'aboutSection',
      items: [
        { labelKey: 'regulation', href: `/${locale}/about/regulation`, Icon: ScrollText },
        { labelKey: 'strategy',   href: `/${locale}/about/strategy`,   Icon: Target },
        { labelKey: 'structure',  href: `/${locale}/about/structure`,  Icon: Building2 },
      ],
    },

    /* ── News & Events ── */
    {
      id: 'news',
      titleKey: 'newsEvents',
      items: [
        { labelKey: 'news',         href: `/${locale}/news`,   Icon: Newspaper,  navbarLink: true },
        { labelKey: 'latestTopics', href: `/${locale}/news`,   Icon: TrendingUp },
        {
          labelKey: 'events',
          href: `/${locale}/events`,
          Icon: Calendar,
          children: [
            { labelKey: 'upcomingEvents', href: `/${locale}/events/upcoming` },
            { labelKey: 'pastEvents',     href: `/${locale}/events/past` },
          ],
        },
      ],
    },

    /* ── Scientific Activities ── */
    {
      id: 'scientific',
      titleKey: 'scientificActivities',
      items: [
        { labelKey: 'conferences', href: `/${locale}/conferences`, Icon: Presentation },
        { labelKey: 'lectures',    href: `/${locale}/lectures`,    Icon: Mic },
        { labelKey: 'workshops',   href: `/${locale}/workshops`,   Icon: Wrench },
        { labelKey: 'seminars',    href: `/${locale}/seminars`,    Icon: Users },
      ],
    },

    /* ── Knowledge & Research ── */
    {
      id: 'knowledge',
      titleKey: 'knowledge',
      items: [
        { labelKey: 'research',  href: `/${locale}/research`,  Icon: Atom,          navbarLink: true },
        { labelKey: 'studies',   href: `/${locale}/studies`,   Icon: FlaskConical },
        { labelKey: 'training',  href: `/${locale}/training`,  Icon: GraduationCap },
        {
          labelKey: 'library',
          href: `/${locale}/library`,
          Icon: Library,
          children: [
            { labelKey: 'libraryDissertations', href: `/${locale}/library/dissertations` },
            { labelKey: 'libraryAnnualReports', href: `/${locale}/library/annual-reports` },
            { labelKey: 'libraryPublications',  href: `/${locale}/library/publications` },
            { labelKey: 'libraryBulletins',     href: `/${locale}/library/bulletins` },
          ],
        },
      ],
    },

    /* ── Services & Documents ── */
    {
      id: 'services',
      titleKey: 'servicesDocuments',
      items: [
        { labelKey: 'varieties',   href: `/${locale}/varieties`,   Icon: Leaf },
        { labelKey: 'documents',   href: `/${locale}/documents`,   Icon: FileText,  navbarLink: true },
        { labelKey: 'tenders',     href: `/${locale}/tenders`,     Icon: Scale },
        { labelKey: 'newsletters', href: `/${locale}/newsletters`, Icon: Rss },
        { labelKey: 'fieldDay',    href: `/${locale}/field-day`,   Icon: MapPin },
        { labelKey: 'gallery',     href: `/${locale}/gallery`,     Icon: Film,      navbarLink: true },
      ],
    },
  ]

  /* Helpers */
  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : !!pathname?.startsWith(href)

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  /* Effects */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const t = setTimeout(() => closeRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
    document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Slide direction — start-0 = right in RTL, left in LTR */
  const hiddenTranslate = isRtl ? 'translate-x-full' : '-translate-x-full'

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────── */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* ── Drawer panel ─────────────────────────────────── */}
      <div
        id="nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={dict.drawer.allSections}
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-[380px] max-w-[92vw] flex-col',
          'bg-surface-elevated shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : hiddenTranslate,
        )}
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className="shrink-0 bg-primary-950 px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logos */}
            <Link
              href={`/${locale}`}
              onClick={onClose}
              className="flex items-center gap-3 group"
              tabIndex={open ? 0 : -1}
            >
              <Image
                src="/logos/syria-eagle.svg"
                alt={dict.meta.country}
                width={44}
                height={44}
                style={{ width: 44, height: 44 }}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <div className="h-10 w-px bg-white/20" aria-hidden />
              <Image
                src="/logos/gcsar-logo.svg"
                alt=""
                width={38}
                height={38}
                style={{ width: 38, height: 38 }}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <div className="leading-tight">
                <p className="text-xs font-bold text-white/90 leading-snug max-w-[120px]">
                  {dict.meta.siteName}
                </p>
                <p className="text-[10px] text-white/45 mt-0.5">{dict.meta.country}</p>
              </div>
            </Link>

            {/* Close */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={dict.common.close}
              tabIndex={open ? 0 : -1}
              className="size-9 shrink-0 inline-flex items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40"
              aria-hidden
            />
            <input
              type="search"
              placeholder={dict.drawer.searchPlaceholder}
              aria-label={dict.drawer.searchPlaceholder}
              tabIndex={open ? 0 : -1}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 ps-9 pe-4 text-sm text-white placeholder:text-white/30 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            />
          </div>
        </div>

        {/* ── Scrollable nav ───────────────────────────── */}
        <nav
          className="flex-1 overflow-y-auto overscroll-contain py-3"
          aria-label={dict.drawer.allSections}
        >
          {sections.map((section, si) => (
            <div key={section.id} className={cn(si > 0 && 'mt-1', section.navbarSection && 'lg:hidden')}>
              {/* Section header */}
              <div className="flex items-center gap-2 px-5 pb-1 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-500">
                  {dict.drawer[section.titleKey]}
                </span>
                <div className="h-px flex-1 bg-border/40" aria-hidden />
              </div>

              {/* Items */}
              <ul role="list">
                {section.items.map((item) => {
                  const active      = isActive(item.href)
                  const hasChildren = !!item.children?.length
                  const isExpanded  = expanded.has(`${section.id}-${item.labelKey}`)
                  const expandId    = `${section.id}-${item.labelKey}`

                  return (
                    <li key={item.labelKey} className={cn(item.navbarLink && 'lg:hidden')}>
                      {hasChildren ? (
                        /* Collapsible trigger */
                        <>
                          <button
                            type="button"
                            onClick={() => toggleExpand(expandId)}
                            aria-expanded={isExpanded}
                            aria-controls={`sub-${expandId}`}
                            tabIndex={open ? 0 : -1}
                            className={cn(
                              'flex w-full items-center gap-3 px-5 py-3 text-sm font-medium transition-colors duration-150',
                              'hover:bg-surface-muted',
                              active
                                ? 'border-s-2 border-secondary-500 bg-primary-50/60 ps-[18px] text-primary-800 dark:bg-primary-950/40 dark:text-secondary-400'
                                : 'text-ink',
                            )}
                          >
                            <item.Icon
                              className={cn(
                                'size-4 shrink-0',
                                active ? 'text-secondary-500' : 'text-ink-subtle',
                              )}
                              aria-hidden
                            />
                            <span className="flex-1 text-start">{dict.nav[item.labelKey]}</span>
                            <ChevronDown
                              className={cn(
                                'size-4 shrink-0 text-ink-subtle transition-transform duration-200',
                                isExpanded && 'rotate-180',
                              )}
                              aria-hidden
                            />
                          </button>

                          {/* Sub-items */}
                          <ul
                            id={`sub-${expandId}`}
                            role="list"
                            className={cn(
                              'overflow-hidden transition-all duration-200',
                              isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0',
                            )}
                          >
                            {item.children!.map((child) => (
                              <li key={child.labelKey}>
                                <Link
                                  href={child.href}
                                  tabIndex={open && isExpanded ? 0 : -1}
                                  className={cn(
                                    'flex items-center gap-2.5 py-2.5 ps-14 pe-5 text-[13px] transition-colors hover:text-primary-700',
                                    isActive(child.href)
                                      ? 'font-semibold text-primary-700'
                                      : 'text-ink-muted',
                                  )}
                                >
                                  <span className="size-1.5 shrink-0 rounded-full bg-secondary-400/60" aria-hidden />
                                  {dict.drawer[child.labelKey]}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        /* Regular link */
                        <Link
                          href={item.href}
                          tabIndex={open ? 0 : -1}
                          className={cn(
                            'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors duration-150',
                            'hover:bg-surface-muted',
                            active
                              ? 'border-s-2 border-secondary-500 bg-primary-50/60 ps-[18px] text-primary-800 dark:bg-primary-950/40 dark:text-secondary-400'
                              : 'text-ink',
                          )}
                        >
                          <item.Icon
                            className={cn(
                              'size-4 shrink-0',
                              active ? 'text-secondary-500' : 'text-ink-subtle',
                            )}
                            aria-hidden
                          />
                          <span className="flex-1">{dict.nav[item.labelKey]}</span>
                          {isRtl
                            ? <ChevronLeft  className="size-3.5 shrink-0 text-ink-subtle/50" aria-hidden />
                            : <ChevronRight className="size-3.5 shrink-0 text-ink-subtle/50" aria-hidden />
                          }
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer ───────────────────────────────────── */}
        <div className="shrink-0 border-t border-border bg-surface-muted/60">
          {/* Quick contact */}
          <div className="border-b border-border/50 px-5 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-secondary-500">
              {dict.drawer.quickContact}
            </p>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="tel:+963112216901"
                  tabIndex={open ? 0 : -1}
                  className="flex items-center gap-2 text-xs text-ink-muted hover:text-primary-700 transition-colors"
                  dir="ltr"
                >
                  <Phone className="size-3.5 shrink-0 text-secondary-500" aria-hidden />
                  +963 11 2216901
                </a>
              </li>
              <li>
                <a
                  href="mailto:information@gcsar.gov.sy"
                  tabIndex={open ? 0 : -1}
                  className="flex items-center gap-2 text-xs text-ink-muted hover:text-primary-700 transition-colors"
                >
                  <Mail className="size-3.5 shrink-0 text-secondary-500" aria-hidden />
                  information@gcsar.gov.sy
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-2.5 flex gap-2">
              {[
                { Icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/gcsarsy/' },
                { Icon: Youtube,  label: 'YouTube',  href: 'https://youtube.com/' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  tabIndex={open ? 0 : -1}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-ink-subtle transition-all hover:border-secondary-500 hover:bg-secondary-600 hover:text-white"
                >
                  <Icon className="size-3.5" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Language switcher */}
          <div className="px-5 py-3">
            <LanguageSwitcher currentLocale={locale} label={dict.common.language} />
          </div>
        </div>
      </div>
    </>
  )
}
