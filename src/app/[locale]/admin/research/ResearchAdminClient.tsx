'use client'

import { useState, useCallback } from 'react'
import { PlusCircle, Edit2, Trash2, X, Save, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth/types'

type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

interface Paper {
  id: string
  title_ar: string
  title_en: string
  abstract_ar: string
  abstract_en: string
  authors: string[]
  field: string
  year: number
  issn: string | null
  doi: string | null
  pdf_url: string | null
  citations_count: number
  status: ContentStatus
  created_at: string
  [key: string]: unknown
}

interface FormState {
  title_ar: string
  title_en: string
  abstract_ar: string
  abstract_en: string
  authorsText: string
  field: string
  year: string
  issn: string
  doi: string
  pdf_url: string
  citations_count: string
  status: ContentStatus
}

const EMPTY: FormState = {
  title_ar: '', title_en: '',
  abstract_ar: '', abstract_en: '',
  authorsText: '',
  field: '',
  year: String(new Date().getFullYear()),
  issn: '', doi: '', pdf_url: '',
  citations_count: '0',
  status: 'draft',
}

const STATUS_COLOR: Record<ContentStatus, string> = {
  draft:     'bg-gray-100 text-gray-700',
  review:    'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-red-100 text-red-700',
}

function paperToForm(p: Paper): FormState {
  return {
    title_ar: p.title_ar,
    title_en: p.title_en,
    abstract_ar: p.abstract_ar,
    abstract_en: p.abstract_en,
    authorsText: (p.authors ?? []).join(', '),
    field: p.field,
    year: String(p.year),
    issn: p.issn ?? '',
    doi: p.doi ?? '',
    pdf_url: p.pdf_url ?? '',
    citations_count: String(p.citations_count),
    status: p.status,
  }
}

const FIELDS_AR = [
  'المحاصيل الحقلية', 'البستنة', 'الموارد الطبيعية', 'وقاية النبات',
  'الدراسات الاقتصادية', 'القطن', 'الثروة الحيوانية', 'التقنية الحيوية',
  'تقنيات الغذاء', 'الموارد الوراثية', 'نقل التقنية', 'أخرى',
]

export function ResearchAdminClient({
  locale,
  role,
  initialItems,
}: {
  locale: string
  role: UserRole
  initialItems: Record<string, unknown>[]
}) {
  const isAr = locale === 'ar'
  const canPublish = role === 'admin' || role === 'super_admin'
  const canDelete  = role === 'admin' || role === 'super_admin'

  const [items, setItems]       = useState<Paper[]>(initialItems as Paper[])
  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing]   = useState<Paper | null>(null)
  const [form, setForm]         = useState<FormState>(EMPTY)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter]     = useState<ContentStatus | 'all'>('all')

  const visible = filter === 'all' ? items : items.filter((p) => p.status === filter)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/research')
      if (res.ok) setItems((await res.json()) as Paper[])
    } finally {
      setLoading(false)
    }
  }, [])

  function openNew() { setEditing(null); setForm(EMPTY); setError(''); setPanelOpen(true) }
  function openEdit(p: Paper) { setEditing(p); setForm(paperToForm(p)); setError(''); setPanelOpen(true) }
  function close() { setPanelOpen(false); setEditing(null); setError('') }
  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function save() {
    setLoading(true); setError('')
    try {
      const payload = {
        title_ar: form.title_ar, title_en: form.title_en,
        abstract_ar: form.abstract_ar, abstract_en: form.abstract_en,
        authors: form.authorsText.split(',').map((a) => a.trim()).filter(Boolean),
        field: form.field,
        year: parseInt(form.year, 10) || new Date().getFullYear(),
        issn: form.issn || null,
        doi: form.doi || null,
        pdf_url: form.pdf_url || null,
        citations_count: parseInt(form.citations_count, 10) || 0,
        status: form.status,
      }
      const url    = editing ? `/api/admin/research/${editing.id}` : '/api/admin/research'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) { setError(json.error ?? 'Save failed'); return }
      await refresh(); close()
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  async function confirmDelete(id: string) {
    setLoading(true)
    try {
      await fetch(`/api/admin/research/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((p) => p.id !== id))
      setDeleteId(null)
    } finally { setLoading(false) }
  }

  const filterLabels: Record<ContentStatus | 'all', string> = {
    all: isAr ? 'الكل' : 'All',
    draft: isAr ? 'مسودة' : 'Draft',
    review: isAr ? 'مراجعة' : 'Review',
    published: isAr ? 'منشور' : 'Published',
    archived: isAr ? 'مؤرشف' : 'Archived',
  }

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-primary-800">
          <PlusCircle className="size-4" aria-hidden />
          {isAr ? 'بحث جديد' : 'New Paper'}
        </button>
        <button onClick={() => void refresh()} disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-fluid-sm text-ink-muted hover:bg-surface disabled:opacity-50">
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
        <div className="ms-auto flex flex-wrap gap-1">
          {(['all', 'draft', 'review', 'published', 'archived'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
                filter === s ? 'bg-primary-700 text-white' : 'text-ink-muted hover:bg-surface')}>
              {filterLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="gov-card overflow-hidden">
        <table className="w-full text-fluid-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 text-start font-semibold text-ink">{isAr ? 'العنوان' : 'Title'}</th>
              <th className="hidden px-4 py-3 text-start font-semibold text-ink md:table-cell">{isAr ? 'المجال' : 'Field'}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{isAr ? 'السنة' : 'Year'}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="px-4 py-3 text-end font-semibold text-ink">{isAr ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                {isAr ? 'لا توجد أبحاث.' : 'No papers found.'}
              </td></tr>
            )}
            {visible.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-surface/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{isAr ? p.title_ar : p.title_en}</p>
                  <p className="text-fluid-xs text-ink-muted">{(p.authors ?? []).join(', ')}</p>
                </td>
                <td className="hidden px-4 py-3 text-ink-muted md:table-cell">{p.field}</td>
                <td className="px-4 py-3 text-ink-muted">{p.year}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-fluid-xs font-medium', STATUS_COLOR[p.status])}>
                    {filterLabels[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fluid-xs text-primary-700 hover:bg-primary-50">
                      <Edit2 className="size-3" aria-hidden />
                      {isAr ? 'تعديل' : 'Edit'}
                    </button>
                    {canDelete && (
                      deleteId === p.id ? (
                        <span className="flex items-center gap-2 text-fluid-xs">
                          <button onClick={() => void confirmDelete(p.id)}
                            className="font-semibold text-red-600 hover:underline">
                            {isAr ? 'تأكيد' : 'Confirm'}
                          </button>
                          <button onClick={() => setDeleteId(null)} className="text-ink-muted hover:underline">
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteId(p.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fluid-xs text-red-600 hover:bg-red-50">
                          <Trash2 className="size-3" aria-hidden />
                          {isAr ? 'حذف' : 'Delete'}
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

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isAr ? 'rtl' : 'ltr'}>
          <button className="flex-1 bg-black/30" onClick={close} aria-label={isAr ? 'إغلاق' : 'Close'} />
          <aside className="flex w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-fluid-lg font-bold text-ink">
                {editing ? (isAr ? 'تعديل البحث' : 'Edit Paper') : (isAr ? 'بحث جديد' : 'New Paper')}
              </h2>
              <button onClick={close} className="rounded-full p-1 hover:bg-surface">
                <X className="size-5 text-ink-muted" aria-hidden />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); void save() }}
              className="flex flex-1 flex-col gap-4 p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-fluid-sm text-red-700">{error}</div>
              )}

              <F label={isAr ? 'العنوان (عربي) *' : 'Title (Arabic) *'}>
                <input type="text" required dir="rtl" value={form.title_ar}
                  onChange={(e) => patch('title_ar', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'العنوان (إنجليزي) *' : 'Title (English) *'}>
                <input type="text" required dir="ltr" value={form.title_en}
                  onChange={(e) => patch('title_en', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'الملخص (عربي) *' : 'Abstract (Arabic) *'}>
                <textarea required rows={3} dir="rtl" value={form.abstract_ar}
                  onChange={(e) => patch('abstract_ar', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'الملخص (إنجليزي) *' : 'Abstract (English) *'}>
                <textarea required rows={3} dir="ltr" value={form.abstract_en}
                  onChange={(e) => patch('abstract_en', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'المؤلفون (مفصولون بفاصلة) *' : 'Authors (comma-separated) *'}>
                <input type="text" required value={form.authorsText}
                  onChange={(e) => patch('authorsText', e.target.value)}
                  placeholder={isAr ? 'د. أحمد، د. سارة' : 'Dr. Ahmad, Dr. Sara'} className="fi" />
              </F>
              <div className="flex gap-3">
                <F label={isAr ? 'المجال *' : 'Field *'} className="flex-1">
                  <select required value={form.field}
                    onChange={(e) => patch('field', e.target.value)} className="fi">
                    <option value="">{isAr ? '-- اختر --' : '-- Select --'}</option>
                    {FIELDS_AR.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </F>
                <F label={isAr ? 'السنة *' : 'Year *'} className="w-28">
                  <input type="number" required min="1900" max="2100" value={form.year}
                    onChange={(e) => patch('year', e.target.value)} className="fi" />
                </F>
              </div>
              <div className="flex gap-3">
                <F label="ISSN" className="flex-1">
                  <input type="text" dir="ltr" value={form.issn}
                    onChange={(e) => patch('issn', e.target.value)} className="fi" />
                </F>
                <F label="DOI" className="flex-1">
                  <input type="text" dir="ltr" value={form.doi}
                    onChange={(e) => patch('doi', e.target.value)} className="fi" />
                </F>
              </div>
              <F label={isAr ? 'رابط PDF' : 'PDF URL'}>
                <input type="text" dir="ltr" value={form.pdf_url}
                  onChange={(e) => patch('pdf_url', e.target.value)} className="fi" />
              </F>
              <div className="flex gap-3">
                <F label={isAr ? 'الاستشهادات' : 'Citations'} className="w-32">
                  <input type="number" min="0" value={form.citations_count}
                    onChange={(e) => patch('citations_count', e.target.value)} className="fi" />
                </F>
                <F label={isAr ? 'الحالة' : 'Status'} className="flex-1">
                  <select value={form.status}
                    onChange={(e) => patch('status', e.target.value as ContentStatus)} className="fi">
                    <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
                    <option value="review">{isAr ? 'مراجعة' : 'Review'}</option>
                    {canPublish && <option value="published">{isAr ? 'منشور' : 'Published'}</option>}
                    <option value="archived">{isAr ? 'مؤرشف' : 'Archived'}</option>
                  </select>
                </F>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={close}
                  className="rounded-lg border border-border px-4 py-2 text-fluid-sm text-ink-muted hover:bg-surface">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-primary-800 disabled:opacity-50">
                  <Save className="size-4" aria-hidden />
                  {loading ? (isAr ? 'جاري الحفظ...' : 'Saving…') : (isAr ? 'حفظ' : 'Save')}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      <style>{`.fi{width:100%;border-radius:.5rem;border:1px solid var(--color-border,#e2e8f0);background:var(--color-surface,#fff);padding:.5rem .75rem;font-size:var(--font-size-fluid-sm,.875rem);color:var(--color-ink,#1a202c);outline:none;resize:vertical}.fi:focus{border-color:#1a4e9c}`}</style>
    </div>
  )
}

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-fluid-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}
