'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

interface Props {
  open: boolean
  onClose: () => void
  locale: Locale
  dict: Dictionary
}

export function SearchOverlay({ open, onClose, locale, dict }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    if (!q) return
    onClose()
    router.push(`/${locale}/search?q=${encodeURIComponent(q)}`)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-white dark:bg-surface shadow-gov-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={dict.common.search}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
          <Search className="ms-2 size-5 shrink-0 text-ink-muted" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            name="q"
            placeholder={dict.common.searchPlaceholder}
            className="flex-1 bg-transparent py-2 text-ink outline-none placeholder:text-ink-muted"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  )
}
