'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n/getDictionary'

interface Item {
  key: string
  label: string
  href: string
}

export function MobileNav({ nav, dict }: { nav: Item[]; dict: Dictionary }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.common.menu}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface-elevated/60 text-ink-muted lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 end-0 w-80 max-w-[85vw] bg-surface-elevated p-5 shadow-gov-lg animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-fluid-base font-bold text-ink">{dict.common.menu}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.common.close}
                className="rounded-full p-1.5 hover:bg-surface-muted"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-fluid-base font-medium text-ink hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
