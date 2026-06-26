'use client'

import { useState, useCallback } from 'react'
import { PlusCircle, Edit2, Trash2, X, Save, RefreshCw, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth/types'

type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

interface Doc {
  id: string
  title_ar: string
  title_en: string
  description_ar: string | null
  description_en: string | null
  category: string
  file_url: string
  file_size_bytes: number
  page_count: number | null
  issued_at: string
  status: ContentStatus
  created_at: string
  [key: string]: unknown
}

interface FormState {
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  category: string
  file_url: string
  file_size_bytes: string
  page_count: string
  issued_at: string
  status: ContentStatus
}

const EMPTY: FormState = {
  title_ar: '', title_en: '',
  description_ar: '', description_en: '',
  category: '', file_url: '',
  file_size_bytes: '0', page_count: '',
  issued_at: new Date().toISOString().slice(0, 10),
  status: 'draft',
}

const STATUS_COLOR: Record<ContentStatus, string> = {
  draft:     'bg-gray-100 text-gray-700',
  review:    'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-red-100 text-red-700',
}

const CATEGORIES = ['قرار', 'تقرير', 'منشور', 'دراسة', 'دليل', 'نشرة', 'أخرى']

function docToForm(d: Doc): FormState {
  return {
    title_ar: d.title_ar,
    title_en: d.title_en,
    description_ar: d.description_ar ?? '',
    description_en: d.description_en ?? '',
    category: d.category,
    file_url: d.file_url,
    file_size_bytes: String(d.file_size_bytes),
    page_count: d.page_count != null ? String(d.page_count) : '',
    issued_at: d.issued_at.slice(0, 10),
    status: d.status,
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export function DocumentsAdminClient({
  locale,
  role,
  initialDocs,
}: {
  locale: string
  role: UserRole
  initialDocs: Record<string, unknown>[]
}) {
  const isAr = locale === 'ar'
  const canPublish = role === 'admin' || role === 'super_admin'
  const canDelete  = role === 'admin' || role === 'super_admin'

  const [docs, setDocs] = useState<Doc[]>(initialDocs as Doc[])
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing] = useState<Doc | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all')

  const visible = filter === 'all' ? docs : docs.filter((d) => d.status === filter)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/documents')
      if (res.ok) setDocs((await res.json()) as Doc[])
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

  function openEdit(d: Doc) {
    setEditing(d)
    setForm(docToForm(d))
    setError('')
    setPanelOpen(true)
  }

  function close() {
    setPanelOpen(false)
    setEditing(null)
    setError('')
  }

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    setLoading(true)
    setError('')
    try {
      const payload = {
        title_ar: form.title_ar,
        title_en: form.title_en,
        description_ar: form.description_ar || null,
        description_en: form.description_en || null,
        category: form.category,
        file_url: form.file_url,
        file_size_bytes: parseInt(form.file_size_bytes, 10) || 0,
        page_count: form.page_count ? parseInt(form.page_count, 10) : null,
        issued_at: form.issued_at,
        status: form.status,
      }
      const url    = editing ? `/api/admin/documents/${editing.id}` : '/api/admin/documents'
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
      await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' })
      setDocs((prev) => prev.filter((d) => d.id !== id))
      setDeleteId(null)
    } finally {
      setLoading(false)
    }
  }

  const filterLabels: Record<ContentStatus | 'all', { ar: string; de: string }> = {
    all:       { ar: 'الكل',   de: 'Alle'         },
    draft:     { ar: 'مسودة', de: 'Entwurf'       },
    review:    { ar: 'مراجعة',de: 'Prüfung'       },
    published: { ar: 'منشور', de: 'Veröffentlicht' },
    archived:  { ar: 'مؤرشف', de: 'Archiviert'    },
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
          {isAr ? 'وثيقة جديدة' : 'Neues Dokument'}
        </button>
        <button
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-fluid-sm text-ink-muted hover:bg-surface disabled:opacity-50"
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          {isAr ? 'تحديث' : 'Aktualisieren'}
        </button>

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

      {/* Tabelle */}
      <div className="gov-card overflow-hidden">
        <table className="w-full text-fluid-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {isAr ? 'العنوان' : 'Titel'}
              </th>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {isAr ? 'التصنيف' : 'Kategorie'}
              </th>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {isAr ? 'الحالة' : 'Status'}
              </th>
              <th className="hidden px-4 py-3 text-start font-semibold text-ink md:table-cell">
                {isAr ? 'تاريخ الإصدار' : 'Ausgabedatum'}
              </th>
              <th className="px-4 py-3 text-end font-semibold text-ink">
                {isAr ? 'الإجراءات' : 'Aktionen'}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                  {isAr ? 'لا توجد وثائق.' : 'Keine Dokumente vorhanden.'}
                </td>
              </tr>
            )}
            {visible.map((d) => (
              <tr key={d.id} className="border-t border-border hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-primary-700" aria-hidden />
                    <div>
                      <p className="font-medium text-ink">
                        {isAr ? d.title_ar : d.title_en}
                      </p>
                      <p className="text-fluid-xs text-ink-muted">
                        {formatBytes(d.file_size_bytes)}
                        {d.page_count ? ` · ${d.page_count} ${isAr ? 'صفحة' : 'S.'}` : ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{d.category}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-fluid-xs font-medium', STATUS_COLOR[d.status])}>
                    {isAr
                      ? { draft: 'مسودة', review: 'مراجعة', published: 'منشور', archived: 'مؤرشف' }[d.status]
                      : d.status}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                  {new Date(d.issued_at).toLocaleDateString(isAr ? 'ar-SY' : 'de-DE')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(d)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fluid-xs text-primary-700 hover:bg-primary-50"
                    >
                      <Edit2 className="size-3" aria-hidden />
                      {isAr ? 'تعديل' : 'Bearbeiten'}
                    </button>
                    {canDelete && (
                      deleteId === d.id ? (
                        <span className="flex items-center gap-2 text-fluid-xs">
                          <button
                            onClick={() => void confirmDelete(d.id)}
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
                          onClick={() => setDeleteId(d.id)}
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

      {/* Formular-Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isAr ? 'rtl' : 'ltr'}>
          <button
            className="flex-1 bg-black/30"
            onClick={close}
            aria-label={isAr ? 'إغلاق' : 'Schließen'}
          />
          <aside className="flex w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-fluid-lg font-bold text-ink">
                {editing
                  ? isAr ? 'تعديل الوثيقة' : 'Dokument bearbeiten'
                  : isAr ? 'وثيقة جديدة' : 'Neues Dokument'}
              </h2>
              <button onClick={close} className="rounded-full p-1 hover:bg-surface">
                <X className="size-5 text-ink-muted" aria-hidden />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); void save() }}
              className="flex flex-1 flex-col gap-4 p-6"
            >
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-fluid-sm text-red-700">
                  {error}
                </div>
              )}

              <DocField label={isAr ? 'العنوان (عربي) *' : 'Titel (Arabisch) *'}>
                <input type="text" required dir="rtl" value={form.title_ar}
                  onChange={(e) => patch('title_ar', e.target.value)} className="doc-field-input" />
              </DocField>

              <DocField label={isAr ? 'العنوان (إنجليزي) *' : 'Titel (Englisch) *'}>
                <input type="text" required dir="ltr" value={form.title_en}
                  onChange={(e) => patch('title_en', e.target.value)} className="doc-field-input" />
              </DocField>

              <DocField label={isAr ? 'الوصف (عربي)' : 'Beschreibung (Arabisch)'}>
                <textarea rows={2} dir="rtl" value={form.description_ar}
                  onChange={(e) => patch('description_ar', e.target.value)} className="doc-field-input" />
              </DocField>

              <DocField label={isAr ? 'الوصف (إنجليزي)' : 'Beschreibung (Englisch)'}>
                <textarea rows={2} dir="ltr" value={form.description_en}
                  onChange={(e) => patch('description_en', e.target.value)} className="doc-field-input" />
              </DocField>

              <DocField label={isAr ? 'التصنيف *' : 'Kategorie *'}>
                <select required value={form.category}
                  onChange={(e) => patch('category', e.target.value)} className="doc-field-input">
                  <option value="">{isAr ? '-- اختر --' : '-- Wählen --'}</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </DocField>

              <DocField label={isAr ? 'رابط الملف *' : 'Datei-URL *'}>
                <input type="text" required dir="ltr" value={form.file_url}
                  onChange={(e) => patch('file_url', e.target.value)} className="doc-field-input" />
              </DocField>

              <div className="flex gap-3">
                <DocField label={isAr ? 'الحجم (بايت)' : 'Größe (Bytes)'} className="flex-1">
                  <input type="number" min="0" value={form.file_size_bytes}
                    onChange={(e) => patch('file_size_bytes', e.target.value)} className="doc-field-input" />
                </DocField>
                <DocField label={isAr ? 'عدد الصفحات' : 'Seitenzahl'} className="flex-1">
                  <input type="number" min="1" value={form.page_count}
                    onChange={(e) => patch('page_count', e.target.value)} className="doc-field-input" />
                </DocField>
              </div>

              <DocField label={isAr ? 'تاريخ الإصدار *' : 'Ausgabedatum *'}>
                <input type="date" required value={form.issued_at}
                  onChange={(e) => patch('issued_at', e.target.value)} className="doc-field-input" />
              </DocField>

              <DocField label={isAr ? 'الحالة' : 'Status'}>
                <select value={form.status}
                  onChange={(e) => patch('status', e.target.value as ContentStatus)} className="doc-field-input">
                  <option value="draft">{isAr ? 'مسودة' : 'Entwurf'}</option>
                  <option value="review">{isAr ? 'مراجعة' : 'Prüfung'}</option>
                  {canPublish && <option value="published">{isAr ? 'منشور' : 'Veröffentlicht'}</option>}
                  <option value="archived">{isAr ? 'مؤرشف' : 'Archiviert'}</option>
                </select>
              </DocField>

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

      <style>{`
        .doc-field-input {
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
        .doc-field-input:focus { border-color: #1a4e9c; }
      `}</style>
    </div>
  )
}

function DocField({
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
