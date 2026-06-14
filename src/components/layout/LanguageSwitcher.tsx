'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Languages } from 'lucide-react'
import { i18n, type Locale, localeMeta } from '@/lib/i18n/config'

interface Props {
  currentLocale: Locale
  label: string
}

export function LanguageSwitcher({ currentLocale, label }: Props) {
  const pathname = usePathname() || '/'

  const swapLocale = (target: Locale) => {
    const segments = pathname.split('/')
    if (segments.length > 1 && i18n.locales.includes(segments[1] as Locale)) {
      segments[1] = target
    } else {
      segments.unshift('', target)
    }
    return segments.join('/') || `/${target}`
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface-elevated/60 p-0.5 text-fluid-xs">
      <Languages className="ms-2 size-3.5 text-ink-subtle" aria-hidden />
      <span className="sr-only">{label}</span>
      {i18n.locales.map((l) => {
        const active = l === currentLocale
        return (
          <Link
            key={l}
            href={swapLocale(l)}
            aria-current={active ? 'true' : undefined}
            className={[
              'rounded-full px-2.5 py-1 font-medium transition',
              active
                ? 'bg-primary-700 text-white shadow-sm'
                : 'text-ink-muted hover:bg-surface-muted',
            ].join(' ')}
          >
            {localeMeta[l].nativeName}
          </Link>
        )
      })}
    </div>
  )
}
