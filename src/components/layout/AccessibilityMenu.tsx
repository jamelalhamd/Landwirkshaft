'use client'

import { useState } from 'react'
import { Accessibility, Sun, Moon, Type, Contrast, Pause } from 'lucide-react'
import { useA11y } from './AccessibilityProvider'
import type { Dictionary } from '@/lib/i18n/getDictionary'
import { cn } from '@/lib/utils'

export function AccessibilityMenu({ dict }: { dict: Dictionary }) {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme, fontScale, setFontScale, highContrast, toggleHighContrast, reduceMotion, toggleReduceMotion } = useA11y()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={dict.common.accessibility}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated/60 px-3 py-1.5 text-fluid-xs font-medium text-ink-muted hover:bg-surface-muted"
      >
        <Accessibility className="size-4" aria-hidden />
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
            <h3 className="mb-3 text-fluid-sm font-semibold text-ink">{dict.accessibility.title}</h3>

            {/* Theme */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center gap-2 text-fluid-xs font-medium text-ink-muted">
                {theme === 'dark' ? <Moon className="size-3.5" aria-hidden /> : <Sun className="size-3.5" aria-hidden />}
                {dict.common.theme}
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-start text-fluid-sm hover:bg-surface-muted"
              >
                {theme === 'dark' ? dict.common.themeLight : dict.common.themeDark}
              </button>
            </div>

            {/* Font scale */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center gap-2 text-fluid-xs font-medium text-ink-muted">
                <Type className="size-3.5" aria-hidden />
                {dict.accessibility.fontSize}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['base', 'lg', 'xl', 'xxl'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFontScale(s)}
                    aria-pressed={fontScale === s}
                    className={cn(
                      'rounded-md border px-2 py-1.5 text-xs font-semibold',
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
                'mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-fluid-sm',
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
                'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-fluid-sm',
                reduceMotion ? 'border-primary-700 bg-primary-700 text-white' : 'border-border bg-surface hover:bg-surface-muted',
              )}
            >
              <span className="flex items-center gap-2">
                <Pause className="size-4" aria-hidden />
                {dict.accessibility.motion}
              </span>
              <span className="text-xs opacity-80">{reduceMotion ? '●' : '○'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
