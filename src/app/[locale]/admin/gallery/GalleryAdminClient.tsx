'use client'

import { useState, useCallback } from 'react'
import { PlusCircle, Edit2, Trash2, X, Save, RefreshCw, Image as ImageIcon, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth/types'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  title_ar: string
  title_en: string
  album: string | null
  url: string
  thumbnail_url: string | null
  taken_at: string | null
  created_at: string
  [key: string]: unknown
}

interface FormState {
  type: 'image' | 'video'
  title_ar: string
  title_en: string
  album: string
  url: string
  thumbnail_url: string
  taken_at: string
}

const EMPTY: FormState = {
  type: 'image',
  title_ar: '', title_en: '',
  album: '', url: '', thumbnail_url: '',
  taken_at: '',
}

function itemToForm(m: MediaItem): FormState {
  return {
    type: m.type,
    title_ar: m.title_ar,
    title_en: m.title_en,
    album: m.album ?? '',
    url: m.url,
    thumbnail_url: m.thumbnail_url ?? '',
    taken_at: m.taken_at ? m.taken_at.slice(0, 10) : '',
  }
}

export function GalleryAdminClient({
  locale,
  role,
  initialItems,
}: {
  locale: string
  role: UserRole
  initialItems: Record<string, unknown>[]
}) {
  const isAr = locale === 'ar'
  const canEdit = role === 'admin' || role === 'super_admin'

  const [items, setItems]           = useState<MediaItem[]>(initialItems as MediaItem[])
  const [panelOpen, setPanelOpen]   = useState(false)
  const [editing, setEditing]       = useState<MediaItem | null>(null)
  const [form, setForm]             = useState<FormState>(EMPTY)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all')
  const [albumFilter, setAlbumFilter] = useState<string>('all')

  const albums = Array.from(new Set(items.map((i) => i.album).filter(Boolean))) as string[]

  const visible = items
    .filter((i) => typeFilter === 'all' || i.type === typeFilter)
    .filter((i) => albumFilter === 'all' || i.album === albumFilter)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/gallery')
      if (res.ok) setItems((await res.json()) as MediaItem[])
    } finally { setLoading(false) }
  }, [])

  function openNew() { setEditing(null); setForm(EMPTY); setError(''); setPanelOpen(true) }
  function openEdit(m: MediaItem) { setEditing(m); setForm(itemToForm(m)); setError(''); setPanelOpen(true) }
  function close() { setPanelOpen(false); setEditing(null); setError('') }
  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function save() {
    setLoading(true); setError('')
    try {
      const payload = {
        type: form.type,
        title_ar: form.title_ar,
        title_en: form.title_en,
        album: form.album || null,
        url: form.url,
        thumbnail_url: form.thumbnail_url || null,
        taken_at: form.taken_at || null,
      }
      const url    = editing ? `/api/admin/gallery/${editing.id}` : '/api/admin/gallery'
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
      await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.id !== id))
      setDeleteId(null)
    } finally { setLoading(false) }
  }

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {canEdit && (
          <button onClick={openNew}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-primary-800">
            <PlusCircle className="size-4" aria-hidden />
            {isAr ? 'عنصر جديد' : 'New Item'}
          </button>
        )}
        <button onClick={() => void refresh()} disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-fluid-sm text-ink-muted hover:bg-surface disabled:opacity-50">
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>

        <div className="ms-auto flex flex-wrap gap-1">
          {(['all', 'image', 'video'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
                typeFilter === t ? 'bg-primary-700 text-white' : 'text-ink-muted hover:bg-surface')}>
              {t === 'all' ? (isAr ? 'الكل' : 'All') : t === 'image' ? (isAr ? 'صور' : 'Images') : (isAr ? 'فيديو' : 'Videos')}
            </button>
          ))}
        </div>
      </div>

      {albums.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          <button onClick={() => setAlbumFilter('all')}
            className={cn('rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
              albumFilter === 'all' ? 'bg-secondary-600 text-white' : 'text-ink-muted hover:bg-surface')}>
            {isAr ? 'كل الألبومات' : 'All Albums'}
          </button>
          {albums.map((a) => (
            <button key={a} onClick={() => setAlbumFilter(a)}
              className={cn('rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
                albumFilter === a ? 'bg-secondary-600 text-white' : 'text-ink-muted hover:bg-surface')}>
              {a}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="py-16 text-center text-fluid-sm text-ink-muted">
          {isAr ? 'لا توجد عناصر.' : 'No items found.'}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <div key={item.id} className="gov-card overflow-hidden">
              <div className="aspect-video bg-gray-100">
                {item.type === 'image' ? (
                  item.thumbnail_url || item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnail_url ?? item.url} alt={isAr ? item.title_ar : item.title_en}
                      className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="size-10 text-gray-300" aria-hidden />
                    </div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-900">
                    <Film className="size-10 text-gray-400" aria-hidden />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-fluid-xs font-semibold text-ink">
                  {isAr ? item.title_ar : item.title_en}
                </p>
                {item.album && (
                  <p className="text-fluid-xs text-ink-muted">{item.album}</p>
                )}
                <div className="mt-2 flex gap-2">
                  {canEdit && (
                    <button onClick={() => openEdit(item)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-fluid-xs text-primary-700 hover:bg-primary-50">
                      <Edit2 className="size-3" aria-hidden />
                      {isAr ? 'تعديل' : 'Edit'}
                    </button>
                  )}
                  {canEdit && (
                    deleteId === item.id ? (
                      <span className="flex items-center gap-1 text-fluid-xs">
                        <button onClick={() => void confirmDelete(item.id)}
                          className="font-semibold text-red-600 hover:underline">
                          {isAr ? 'تأكيد' : 'OK'}
                        </button>
                        <button onClick={() => setDeleteId(null)} className="text-ink-muted hover:underline">
                          {isAr ? 'إلغاء' : 'No'}
                        </button>
                      </span>
                    ) : (
                      <button onClick={() => setDeleteId(item.id)}
                        className="flex items-center justify-center rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50">
                        <Trash2 className="size-3" aria-hidden />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isAr ? 'rtl' : 'ltr'}>
          <button className="flex-1 bg-black/30" onClick={close} aria-label={isAr ? 'إغلاق' : 'Close'} />
          <aside className="flex w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-fluid-lg font-bold text-ink">
                {editing ? (isAr ? 'تعديل العنصر' : 'Edit Item') : (isAr ? 'عنصر جديد' : 'New Item')}
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

              <F label={isAr ? 'النوع' : 'Type'}>
                <select value={form.type} onChange={(e) => patch('type', e.target.value as 'image' | 'video')} className="fi">
                  <option value="image">{isAr ? 'صورة' : 'Image'}</option>
                  <option value="video">{isAr ? 'فيديو' : 'Video'}</option>
                </select>
              </F>
              <F label={isAr ? 'العنوان (عربي) *' : 'Title (Arabic) *'}>
                <input type="text" required dir="rtl" value={form.title_ar}
                  onChange={(e) => patch('title_ar', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'العنوان (إنجليزي) *' : 'Title (English) *'}>
                <input type="text" required dir="ltr" value={form.title_en}
                  onChange={(e) => patch('title_en', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'الألبوم' : 'Album'}>
                <input type="text" value={form.album}
                  onChange={(e) => patch('album', e.target.value)}
                  placeholder={isAr ? 'مثال: زيارة ميدانية 2024' : 'e.g. Field Visit 2024'} className="fi" />
              </F>
              <F label={isAr ? 'رابط الملف *' : 'File URL *'}>
                <input type="text" required dir="ltr" value={form.url}
                  onChange={(e) => patch('url', e.target.value)}
                  placeholder="https://…" className="fi" />
              </F>
              <F label={isAr ? 'رابط الصورة المصغرة' : 'Thumbnail URL'}>
                <input type="text" dir="ltr" value={form.thumbnail_url}
                  onChange={(e) => patch('thumbnail_url', e.target.value)}
                  placeholder="https://…" className="fi" />
              </F>
              <F label={isAr ? 'تاريخ الالتقاط' : 'Taken At'}>
                <input type="date" value={form.taken_at}
                  onChange={(e) => patch('taken_at', e.target.value)} className="fi" />
              </F>

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
