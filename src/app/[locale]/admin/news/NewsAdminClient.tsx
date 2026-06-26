'use client'

import { useState, useCallback } from 'react'
import { PlusCircle, Edit2, Trash2, X, Save, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth/types'

type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

interface Article {
  id: string
  title_ar: string
  title_en: string
  slug: string
  excerpt_ar: string
  excerpt_en: string
  body_ar: string
  body_en: string
  status: ContentStatus
  is_breaking: boolean
  publish_at: string | null
  tags: string[]
  author_id: string | null
  created_at: string
  [key: string]: unknown
}

interface FormState {
  title_ar: string
  title_en: string
  slug: string
  excerpt_ar: string
  excerpt_en: string
  body_ar: string
  body_en: string
  status: ContentStatus
  is_breaking: boolean
  publish_at: string
  tagsText: string
}

const EMPTY: FormState = {
  title_ar: '', title_en: '', slug: '',
  excerpt_ar: '', excerpt_en: '',
  body_ar: '', body_en: '',
  status: 'draft', is_breaking: false,
  publish_at: '', tagsText: '',
}

const STATUS_COLOR: Record<ContentStatus, string> = {
  draft:     'bg-gray-100 text-gray-700',
  review:    'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-red-100 text-red-700',
}

const STATUS_AR: Record<ContentStatus, string> = {
  draft: 'مسودة', review: 'مراجعة', published: 'منشور', archived: 'مؤرشف',
}

// Erzeugt einen URL-freundlichen Slug aus englischem Text
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function articleToForm(a: Article): FormState {
  return {
    title_ar: a.title_ar,
    title_en: a.title_en,
    slug: a.slug,
    excerpt_ar: a.excerpt_ar,
    excerpt_en: a.excerpt_en,
    body_ar: a.body_ar,
    body_en: a.body_en,
    status: a.status,
    is_breaking: a.is_breaking,
    publish_at: a.publish_at ? a.publish_at.slice(0, 16) : '',
    tagsText: (a.tags ?? []).join(', '),
  }
}

export function NewsAdminClient({
  locale,
  role,
  initialArticles,
}: {
  locale: string
  role: UserRole
  initialArticles: Record<string, unknown>[]
}) {
  const isAr = locale === 'ar'
  const canPublish = role === 'admin' || role === 'super_admin'
  const canDelete  = role === 'admin' || role === 'super_admin'

  const [articles, setArticles] = useState<Article[]>(initialArticles as Article[])
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all')

  const visible = filter === 'all' ? articles : articles.filter((a) => a.status === filter)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/news')
      if (res.ok) setArticles((await res.json()) as Article[])
    } finally {
      setLoading(false)
    }
  }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setError('')
    setPanelOpen(true)
  }

  function openEdit(a: Article) {
    setEditing(a)
    setForm(articleToForm(a))
    setError('')
    setPanelOpen(true)
  }

  function close() {
    setPanelOpen(false)
    setEditing(null)
    setError('')
  }

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Slug automatisch aus englischem Titel ableiten (nur bei neuem Artikel)
      if (key === 'title_en' && !editing) {
        next.slug = slugify(String(value))
      }
      return next
    })
  }

  async function save() {
    setLoading(true)
    setError('')
    try {
      const payload = {
        title_ar: form.title_ar,
        title_en: form.title_en,
        slug: form.slug,
        excerpt_ar: form.excerpt_ar,
        excerpt_en: form.excerpt_en,
        body_ar: form.body_ar,
        body_en: form.body_en,
        status: form.status,
        is_breaking: form.is_breaking,
        publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
        tags: form.tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }
      const url    = editing ? `/api/admin/news/${editing.id}` : '/api/admin/news'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) { setError(json.error ?? 'Fehler beim Speichern'); return }
      await refresh()
      close()
    } catch {
      setError('Netzwerkfehler')
    } finally {
      setLoading(false)
    }
  }

  async function confirmDelete(id: string) {
    setLoading(true)
    try {
      await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
      setArticles((prev) => prev.filter((a) => a.id !== id))
      setDeleteId(null)
    } finally {
      setLoading(false)
    }
  }

  const filterLabels: Record<ContentStatus | 'all', { ar: string; de: string }> = {
    all:       { ar: 'الكل',   de: 'Alle'        },
    draft:     { ar: 'مسودة', de: 'Entwurf'      },
    review:    { ar: 'مراجعة',de: 'Prüfung'      },
    published: { ar: 'منشور', de: 'Veröffentlicht'},
    archived:  { ar: 'مؤرشف', de: 'Archiviert'   },
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-primary-800"
        >
          <PlusCircle className="size-4" aria-hidden />
          {isAr ? 'مقال جديد' : 'Neuer Artikel'}
        </button>
        <button
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-fluid-sm text-ink-muted hover:bg-surface disabled:opacity-50"
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          {isAr ? 'تحديث' : 'Aktualisieren'}
        </button>

        {/* Statusfilter */}
        <div className="ms-auto flex flex-wrap gap-1">
          {(['all', 'draft', 'review', 'published', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
                filter === s ? 'bg-primary-700 text-white' : 'text-ink-muted hover:bg-surface',
              )}
            >
              {isAr ? filterLabels[s].ar : filterLabels[s].de}
            </button>
          ))}
        </div>
      </div>

      {/* Artikeltabelle */}
      <div className="gov-card overflow-hidden">
        <table className="w-full text-fluid-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {isAr ? 'العنوان' : 'Titel'}
              </th>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {isAr ? 'الحالة' : 'Status'}
              </th>
              <th className="hidden px-4 py-3 text-start font-semibold text-ink md:table-cell">
                {isAr ? 'تاريخ النشر' : 'Veröffentlicht'}
              </th>
              <th className="px-4 py-3 text-end font-semibold text-ink">
                {isAr ? 'الإجراءات' : 'Aktionen'}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-muted">
                  {isAr ? 'لا توجد مقالات.' : 'Keine Artikel vorhanden.'}
                </td>
              </tr>
            )}
            {visible.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-surface/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">
                    {isAr ? a.title_ar : a.title_en}
                  </p>
                  <p className="text-fluid-xs text-ink-muted">{a.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-fluid-xs font-medium', STATUS_COLOR[a.status])}>
                    {isAr ? STATUS_AR[a.status] : a.status}
                  </span>
                  {a.is_breaking && (
                    <span className="ms-1 rounded-full bg-red-100 px-2 py-0.5 text-fluid-xs font-medium text-red-700">
                      {isAr ? 'عاجل' : 'Breaking'}
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                  {a.publish_at
                    ? new Date(a.publish_at).toLocaleDateString(isAr ? 'ar-SY' : 'de-DE')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fluid-xs text-primary-700 hover:bg-primary-50"
                    >
                      <Edit2 className="size-3" aria-hidden />
                      {isAr ? 'تعديل' : 'Bearbeiten'}
                    </button>
                    {canDelete && (
                      deleteId === a.id ? (
                        <span className="flex items-center gap-2 text-fluid-xs">
                          <button
                            onClick={() => void confirmDelete(a.id)}
                            className="font-semibold text-red-600 hover:underline"
                          >
                            {isAr ? 'تأكيد' : 'Bestätigen'}
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="text-ink-muted hover:underline"
                          >
                            {isAr ? 'إلغاء' : 'Abbrechen'}
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fluid-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-3" aria-hidden />
                          {isAr ? 'حذف' : 'Löschen'}
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schiebe-Panel für Formular */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isAr ? 'rtl' : 'ltr'}>
          <button
            className="flex-1 bg-black/30"
            onClick={close}
            aria-label={isAr ? 'إغلاق' : 'Schließen'}
          />
          <aside className="flex w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900">
            {/* Panel-Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-fluid-lg font-bold text-ink">
                {editing
                  ? isAr ? 'تعديل المقال' : 'Artikel bearbeiten'
                  : isAr ? 'مقال جديد' : 'Neuer Artikel'}
              </h2>
              <button onClick={close} className="rounded-full p-1 hover:bg-surface">
                <X className="size-5 text-ink-muted" aria-hidden />
              </button>
            </div>

            {/* Formular */}
            <form
              onSubmit={(e) => { e.preventDefault(); void save() }}
              className="flex flex-1 flex-col gap-4 p-6"
            >
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-fluid-sm text-red-700">
                  {error}
                </div>
              )}

              <Field label={isAr ? 'العنوان (عربي) *' : 'Titel (Arabisch) *'}>
                <input type="text" required dir="rtl" value={form.title_ar}
                  onChange={(e) => patch('title_ar', e.target.value)}
                  className="field-input" />
              </Field>

              <Field label={isAr ? 'العنوان (إنجليزي) *' : 'Titel (Englisch) *'}>
                <input type="text" required dir="ltr" value={form.title_en}
                  onChange={(e) => patch('title_en', e.target.value)}
                  className="field-input" />
              </Field>

              <Field label="Slug *">
                <input type="text" required dir="ltr" pattern="^[a-z0-9-]+$"
                  value={form.slug}
                  onChange={(e) => patch('slug', e.target.value)}
                  className="field-input font-mono" />
              </Field>

              <Field label={isAr ? 'مقتطف (عربي) *' : 'Auszug (Arabisch) *'}>
                <textarea required rows={2} dir="rtl" value={form.excerpt_ar}
                  onChange={(e) => patch('excerpt_ar', e.target.value)}
                  className="field-input" />
              </Field>

              <Field label={isAr ? 'مقتطف (إنجليزي) *' : 'Auszug (Englisch) *'}>
                <textarea required rows={2} dir="ltr" value={form.excerpt_en}
                  onChange={(e) => patch('excerpt_en', e.target.value)}
                  className="field-input" />
              </Field>

              <Field label={isAr ? 'المحتوى (عربي) *' : 'Inhalt (Arabisch) *'}>
                <textarea required rows={5} dir="rtl" value={form.body_ar}
                  onChange={(e) => patch('body_ar', e.target.value)}
                  className="field-input" />
              </Field>

              <Field label={isAr ? 'المحتوى (إنجليزي) *' : 'Inhalt (Englisch) *'}>
                <textarea required rows={5} dir="ltr" value={form.body_en}
                  onChange={(e) => patch('body_en', e.target.value)}
                  className="field-input" />
              </Field>

              <div className="flex gap-4">
                <Field label={isAr ? 'الحالة' : 'Status'} className="flex-1">
                  <select value={form.status}
                    onChange={(e) => patch('status', e.target.value as ContentStatus)}
                    className="field-input">
                    <option value="draft">{isAr ? 'مسودة' : 'Entwurf'}</option>
                    <option value="review">{isAr ? 'مراجعة' : 'Prüfung'}</option>
                    {canPublish && <option value="published">{isAr ? 'منشور' : 'Veröffentlicht'}</option>}
                    <option value="archived">{isAr ? 'مؤرشف' : 'Archiviert'}</option>
                  </select>
                </Field>

                <label className="flex items-end gap-2 pb-2">
                  <input type="checkbox" checked={form.is_breaking}
                    onChange={(e) => patch('is_breaking', e.target.checked)}
                    className="size-4 rounded border-border" />
                  <span className="text-fluid-sm font-medium text-ink">
                    {isAr ? 'عاجل' : 'Breaking'}
                  </span>
                </label>
              </div>

              <Field label={isAr ? 'تاريخ النشر' : 'Veröffentlichungsdatum'}>
                <input type="datetime-local" value={form.publish_at}
                  onChange={(e) => patch('publish_at', e.target.value)}
                  className="field-input" />
              </Field>

              <Field label={isAr ? 'الوسوم (مفصولة بفاصلة)' : 'Schlagwörter (kommagetrennt)'}>
                <input type="text" value={form.tagsText}
                  onChange={(e) => patch('tagsText', e.target.value)}
                  placeholder={isAr ? 'قمح، جفاف، ...' : 'Weizen, Dürre, ...'}
                  className="field-input" />
              </Field>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={close}
                  className="rounded-lg border border-border px-4 py-2 text-fluid-sm text-ink-muted hover:bg-surface">
                  {isAr ? 'إلغاء' : 'Abbrechen'}
                </button>
                <button type="submit" disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">
                  <Save className="size-4" aria-hidden />
                  {loading
                    ? isAr ? 'جاري الحفظ...' : 'Wird gespeichert...'
                    : isAr ? 'حفظ' : 'Speichern'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* Globale Feldstile über CSS-Klasse */}
      <style>{`
        .field-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border, #e2e8f0);
          background: var(--color-surface, #fff);
          padding: 0.5rem 0.75rem;
          font-size: var(--font-size-fluid-sm, 0.875rem);
          color: var(--color-ink, #1a202c);
          outline: none;
          resize: vertical;
        }
        .field-input:focus {
          border-color: #1a4e9c;
        }
      `}</style>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-fluid-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}
