'use client'

import { useState, useCallback } from 'react'
import { RefreshCw, ChevronDown, ChevronUp, Mail, Phone, Paperclip, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth/types'

type MsgStatus = 'new' | 'in_review' | 'replied' | 'closed'

interface ContactMessage {
  id: string
  full_name: string
  email: string
  phone: string | null
  subject: string
  body: string
  attachment_url: string | null
  status: MsgStatus
  created_at: string
  [key: string]: unknown
}

const STATUS_COLOR: Record<MsgStatus, string> = {
  new:       'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  replied:   'bg-green-100 text-green-700',
  closed:    'bg-gray-100 text-gray-600',
}

const NEXT_STATUS: Record<MsgStatus, MsgStatus> = {
  new:       'in_review',
  in_review: 'replied',
  replied:   'closed',
  closed:    'closed',
}

export function ContactAdminClient({
  locale,
  role,
  initialMessages,
}: {
  locale: string
  role: UserRole
  initialMessages: Record<string, unknown>[]
}) {
  const isAr = locale === 'ar'
  const canDelete = role === 'super_admin'

  const [messages, setMessages]   = useState<ContactMessage[]>(initialMessages as ContactMessage[])
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [filter, setFilter]       = useState<MsgStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const visible = filter === 'all' ? messages : messages.filter((m) => m.status === filter)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contact')
      if (res.ok) setMessages((await res.json()) as ContactMessage[])
    } finally { setLoading(false) }
  }, [])

  async function advanceStatus(msg: ContactMessage) {
    const next = NEXT_STATUS[msg.status]
    if (next === msg.status) return
    setUpdatingId(msg.id)
    try {
      const res = await fetch(`/api/admin/contact/${msg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: next } : m))
      }
    } finally { setUpdatingId(null) }
  }

  async function confirmDelete(id: string) {
    setLoading(true)
    try {
      await fetch(`/api/admin/contact/${id}`, { method: 'DELETE' })
      setMessages((prev) => prev.filter((m) => m.id !== id))
      setDeleteId(null)
    } finally { setLoading(false) }
  }

  const statusLabel: Record<MsgStatus | 'all', string> = {
    all:       isAr ? 'الكل'     : 'All',
    new:       isAr ? 'جديد'     : 'New',
    in_review: isAr ? 'قيد المراجعة' : 'In Review',
    replied:   isAr ? 'تم الرد'  : 'Replied',
    closed:    isAr ? 'مغلق'     : 'Closed',
  }

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={() => void refresh()} disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-fluid-sm text-ink-muted hover:bg-surface disabled:opacity-50">
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
        <div className="ms-auto flex flex-wrap gap-1">
          {(['all', 'new', 'in_review', 'replied', 'closed'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
                filter === s ? 'bg-primary-700 text-white' : 'text-ink-muted hover:bg-surface')}>
              {statusLabel[s]}
              {s !== 'all' && (
                <span className="ms-1 text-fluid-xs opacity-60">
                  ({messages.filter((m) => m.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <p className="py-16 text-center text-fluid-sm text-ink-muted">
            {isAr ? 'لا توجد رسائل.' : 'No messages.'}
          </p>
        )}
        {visible.map((msg) => (
          <div key={msg.id} className="gov-card overflow-hidden">
            <div
              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-surface/50"
              onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{msg.full_name}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-fluid-xs font-medium', STATUS_COLOR[msg.status])}>
                    {statusLabel[msg.status]}
                  </span>
                </div>
                <p className="truncate text-fluid-sm text-ink-muted">{msg.subject}</p>
              </div>
              <time className="hidden shrink-0 text-fluid-xs text-ink-muted md:block">
                {new Date(msg.created_at).toLocaleDateString(isAr ? 'ar-SY' : 'en-GB')}
              </time>
              {expanded === msg.id
                ? <ChevronUp className="size-4 shrink-0 text-ink-muted" aria-hidden />
                : <ChevronDown className="size-4 shrink-0 text-ink-muted" aria-hidden />}
            </div>

            {expanded === msg.id && (
              <div className="border-t border-border bg-surface/30 px-4 py-4 space-y-3">
                <div className="flex flex-wrap gap-4 text-fluid-sm text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" aria-hidden />
                    <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                  </span>
                  {msg.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5" aria-hidden />
                      {msg.phone}
                    </span>
                  )}
                  {msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-700 hover:underline">
                      <Paperclip className="size-3.5" aria-hidden />
                      {isAr ? 'المرفق' : 'Attachment'}
                    </a>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-fluid-sm text-ink" dir={isAr ? 'rtl' : 'ltr'}>
                  {msg.body}
                </p>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  {msg.status !== 'closed' && (
                    <button
                      onClick={() => void advanceStatus(msg)}
                      disabled={updatingId === msg.id}
                      className="rounded-lg bg-primary-700 px-3 py-1.5 text-fluid-xs font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
                    >
                      {updatingId === msg.id
                        ? '…'
                        : isAr
                          ? `تحديث إلى: ${statusLabel[NEXT_STATUS[msg.status]]}`
                          : `Mark as: ${statusLabel[NEXT_STATUS[msg.status]]}`}
                    </button>
                  )}
                  {canDelete && (
                    deleteId === msg.id ? (
                      <span className="flex items-center gap-2 text-fluid-xs">
                        <button onClick={() => void confirmDelete(msg.id)}
                          className="font-semibold text-red-600 hover:underline">
                          {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
                        </button>
                        <button onClick={() => setDeleteId(null)} className="text-ink-muted hover:underline">
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                      </span>
                    ) : (
                      <button onClick={() => setDeleteId(msg.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-fluid-xs text-red-600 hover:bg-red-50">
                        <Trash2 className="size-3.5" aria-hidden />
                        {isAr ? 'حذف' : 'Delete'}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
