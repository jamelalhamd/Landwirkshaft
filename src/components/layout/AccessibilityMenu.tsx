'use client'

import { useState } from 'react'
import { Sun, Moon, Type, Contrast, Pause, Settings2, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useA11y } from './AccessibilityProvider'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import type { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

export function AccessibilityMenu({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme, fontScale, setFontScale, highContrast, toggleHighContrast, reduceMotion, toggleReduceMotion } = useA11y()

  return (
    <div className="relative">
      {/* Trigger — shows sun or moon based on current theme */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={dict.common.accessibility}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated/60 px-3 py-1.5 text-fluid-xs font-medium text-ink-muted hover:bg-surface-muted"
      >
        {theme === 'dark'
          ? <Moon className="size-4 text-indigo-400" aria-hidden />
          : <Sun className="size-4 text-amber-500" aria-hidden />
        }
        <span className="hidden sm:inline">{dict.common.accessibility}</span>
      </button>

      {open && (
        <>
          <button
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30"
            tabIndex={-1}
          />
          <div
            role="dialog"
            aria-label={dict.accessibility.title}
            className="absolute end-0 z-40 mt-2 w-72 rounded-xl border border-border bg-surface-elevated p-4 shadow-gov-lg animate-fade-in"
          >
            <h3 className="mb-4 flex items-center gap-2 text-fluid-sm font-semibold text-ink">
              <Settings2 className="size-4" aria-hidden />
              {dict.accessibility.title}
            </h3>

            {/* Theme — sun / moon toggle */}
            <div className="mb-4">
              <p className="mb-2 text-fluid-xs font-medium text-ink-muted">{dict.common.theme}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => theme === 'dark' && toggleTheme()}
                  aria-pressed={theme === 'light'}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-fluid-sm font-medium transition-all',
                    theme === 'light'
                      ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm dark:bg-amber-900/30 dark:text-amber-300'
                      : 'border-border bg-surface text-ink-muted hover:bg-surface-muted',
                  )}
                >
                  <Sun className={cn('size-4', theme === 'light' ? 'text-amber-500' : '')} aria-hidden />
                  {dict.common.themeLight}
                </button>
                <button
                  type="button"
                  onClick={() => theme === 'light' && toggleTheme()}
                  aria-pressed={theme === 'dark'}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-fluid-sm font-medium transition-all',
                    theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/40 dark:text-indigo-300'
                      : 'border-border bg-surface text-ink-muted hover:bg-surface-muted',
                  )}
                >
                  <Moon className={cn('size-4', theme === 'dark' ? 'text-indigo-400' : '')} aria-hidden />
                  {dict.common.themeDark}
                </button>
              </div>
            </div>

            {/* Font scale */}
            <div className="mb-4">
              <p className="mb-2 text-fluid-xs font-medium text-ink-muted">
                <span className="flex items-center gap-2">
                  <Type className="size-3.5" aria-hidden />
                  {dict.accessibility.fontSize}
                </span>
              </p>
              <div className="grid grid-cols-4 gap-1">
                {(['base', 'lg', 'xl', 'xxl'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFontScale(s)}
                    aria-pressed={fontScale === s}
                    className={cn(
                      'rounded-md border px-2 py-1.5 text-xs font-semibold transition-all',
                      fontScale === s
                        ? 'border-primary-700 bg-primary-700 text-white'
                        : 'border-border bg-surface hover:bg-surface-muted',
                    )}
                  >
                    {s === 'base' ? 'A' : s === 'lg' ? 'A+' : s === 'xl' ? 'A++' : 'A+++'}
                  </button>
                ))}
              </div>
            </div>

            {/* High contrast */}
            <button
              type="button"
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              className={cn(
                'mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-fluid-sm transition-all',
                highContrast ? 'border-primary-700 bg-primary-700 text-white' : 'border-border bg-surface hover:bg-surface-muted',
              )}
            >
              <span className="flex items-center gap-2">
                <Contrast className="size-4" aria-hidden />
                {dict.common.highContrast}
              </span>
              <span className="text-xs opacity-80">{highContrast ? '●' : '○'}</span>
            </button>

            {/* Reduce motion */}
            <button
              type="button"
              onClick={toggleReduceMotion}
              aria-pressed={reduceMotion}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-fluid-sm transition-all',
                reduceMotion ? 'border-primary-700 bg-primary-700 text-white' : 'border-border bg-surface hover:bg-surface-muted',
              )}
            >
              <span className="flex items-center gap-2">
                <Pause className="size-4" aria-hidden />
                {dict.accessibility.motion}
              </span>
              <span className="text-xs opacity-80">{reduceMotion ? '●' : '○'}</span>
            </button>

            {/* Admin link */}
            <div className="mt-3 border-t border-border pt-3">
              <Link
                href={`/${locale}/admin`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm font-medium text-ink-muted transition-all hover:border-primary-700 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-900/30"
              >
                <LayoutDashboard className="size-4 shrink-0" aria-hidden />
                {dict.nav.admin}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
