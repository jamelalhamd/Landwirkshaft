'use client'

import { useState } from 'react'
import type { Locale } from '@/lib/i18n/config'

interface Props {
  locale: Locale
}

export function ContactForm({ locale }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    setError(null)
    try {
      const fd = new FormData(form)
      const res = await fetch('/api/contact', { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      setStatus('sent')
      form.reset()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const L = (ar: string, en: string) => (locale === 'ar' ? ar : en)

  return (
    <form onSubmit={onSubmit} className="gov-card grid gap-4 p-6">
      {/* Honeypot — bots fill this, humans don't see it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-fluid-sm font-medium text-ink" htmlFor="fullName">
            {L('الاسم الكامل', 'Full name')}
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            maxLength={120}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm focus:border-primary-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-fluid-sm font-medium text-ink" htmlFor="email">
            {L('البريد الإلكتروني', 'Email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm focus:border-primary-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-fluid-sm font-medium text-ink" htmlFor="phone">
            {L('الهاتف', 'Phone')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm focus:border-primary-600 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-fluid-sm font-medium text-ink" htmlFor="subject">
          {L('الموضوع', 'Subject')}
        </label>
        <input
          id="subject"
          name="subject"
          required
          maxLength={200}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm focus:border-primary-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-fluid-sm font-medium text-ink" htmlFor="body">
          {L('الرسالة', 'Message')}
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={6}
          maxLength={4000}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm focus:border-primary-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-fluid-sm font-medium text-ink" htmlFor="attachment">
          {L('مرفق (اختياري)', 'Attachment (optional)')}
        </label>
        <input
          id="attachment"
          name="attachment"
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="block w-full text-fluid-sm file:me-3 file:rounded-lg file:border-0 file:bg-primary-700 file:px-3 file:py-2 file:text-white"
        />
      </div>

      {status === 'sent' && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-fluid-sm text-emerald-800">
          {L('شكراً لتواصلك. سيتم الردّ في أقرب وقت.', 'Thanks for reaching out. We will respond shortly.')}
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-fluid-sm text-red-800">
          {error ?? L('حدث خطأ، حاول مرة أخرى.', 'Something went wrong, please try again.')}
        </div>
      )}

      <div>
        <button type="submit" disabled={status === 'sending'} className="btn-primary">
          {status === 'sending' ? L('جارٍ الإرسال…', 'Sending…') : L('إرسال', 'Send')}
        </button>
      </div>
    </form>
  )
}
