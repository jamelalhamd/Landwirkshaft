'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Save, Upload, Loader2, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Settings {
  site_name_ar: string
  site_name_en: string
  tagline_ar: string
  tagline_en: string
  logo_url: string | null
  logo2_url: string | null
  hero_title_ar: string
  hero_title_en: string
  hero_subtitle_ar: string
  hero_subtitle_en: string
  hero_eyebrow_ar: string
  hero_eyebrow_en: string
}

const EMPTY: Settings = {
  site_name_ar: '', site_name_en: '',
  tagline_ar: '', tagline_en: '',
  logo_url: null, logo2_url: null,
  hero_title_ar: '', hero_title_en: '',
  hero_subtitle_ar: '', hero_subtitle_en: '',
  hero_eyebrow_ar: '', hero_eyebrow_en: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<'logo_url' | 'logo2_url' | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const logo1Ref = useRef<HTMLInputElement | null>(null)
  const logo2Ref = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data: Partial<Settings>) => {
        setForm((prev) => ({ ...prev, ...data }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function patch<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function uploadLogo(file: File, key: 'logo_url' | 'logo2_url') {
    setUploadingKey(key)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'logos')
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd })
      if (!res.ok) { setError('Logo-Upload fehlgeschlagen'); return }
      const { url } = (await res.json()) as { url: string }
      patch(key, url)
    } catch {
      setError('Upload-Fehler')
    } finally {
      setUploadingKey(null)
    }
  }

  async function save() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) { setError(json.error ?? 'Fehler'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Netzwerkfehler')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary-700" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-fluid-2xl font-extrabold text-ink">إعدادات الموقع</h1>
        <p className="mt-1 text-fluid-sm text-ink-muted">
          تعديل الشعار والاسم والعنوان وباقي محتوى الصفحة الرئيسية.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-fluid-sm text-red-700">
          <X className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-fluid-sm text-green-700">
          <CheckCircle className="size-4 shrink-0" />
          تم الحفظ بنجاح.
        </div>
      )}

      {/* ── الشعارات ── */}
      <section className="gov-card p-6 space-y-5">
        <h2 className="font-bold text-ink border-b border-border pb-3">الشعارات (Logo)</h2>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Logo 1 */}
          <LogoField
            label="الشعار الأول"
            current={form.logo_url}
            fallback="/logos/idsyria.jpg"
            uploading={uploadingKey === 'logo_url'}
            inputRef={logo1Ref}
            onClear={() => patch('logo_url', null)}
            onFileChange={(f) => void uploadLogo(f, 'logo_url')}
          />
          {/* Logo 2 */}
          <LogoField
            label="الشعار الثاني"
            current={form.logo2_url}
            fallback="/logos/logo2.png"
            uploading={uploadingKey === 'logo2_url'}
            inputRef={logo2Ref}
            onClear={() => patch('logo2_url', null)}
            onFileChange={(f) => void uploadLogo(f, 'logo2_url')}
          />
        </div>
      </section>

      {/* ── اسم الموقع ── */}
      <section className="gov-card p-6 space-y-5">
        <h2 className="font-bold text-ink border-b border-border pb-3">اسم الموقع والشعار النصي</h2>
        <FieldRow>
          <Field label="الاسم (عربي) *" dir="rtl">
            <input className="si" value={form.site_name_ar}
              onChange={(e) => patch('site_name_ar', e.target.value)} />
          </Field>
          <Field label="Sitename (Englisch) *" dir="ltr">
            <input className="si" value={form.site_name_en}
              onChange={(e) => patch('site_name_en', e.target.value)} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="الشعار النصي (عربي)" dir="rtl">
            <input className="si" value={form.tagline_ar}
              onChange={(e) => patch('tagline_ar', e.target.value)} />
          </Field>
          <Field label="Tagline (Englisch)" dir="ltr">
            <input className="si" value={form.tagline_en}
              onChange={(e) => patch('tagline_en', e.target.value)} />
          </Field>
        </FieldRow>
      </section>

      {/* ── نص الصفحة الرئيسية ── */}
      <section className="gov-card p-6 space-y-5">
        <h2 className="font-bold text-ink border-b border-border pb-3">نص الصفحة الرئيسية (Hero)</h2>
        <FieldRow>
          <Field label="الشعار التمهيدي (عربي)" dir="rtl">
            <input className="si" value={form.hero_eyebrow_ar}
              onChange={(e) => patch('hero_eyebrow_ar', e.target.value)} />
          </Field>
          <Field label="Eyebrow (Englisch)" dir="ltr">
            <input className="si" value={form.hero_eyebrow_en}
              onChange={(e) => patch('hero_eyebrow_en', e.target.value)} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="العنوان الرئيسي (عربي)" dir="rtl">
            <textarea className="si" rows={3} value={form.hero_title_ar}
              onChange={(e) => patch('hero_title_ar', e.target.value)} />
          </Field>
          <Field label="Haupttitel (Englisch)" dir="ltr">
            <textarea className="si" rows={3} value={form.hero_title_en}
              onChange={(e) => patch('hero_title_en', e.target.value)} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="النص الفرعي (عربي)" dir="rtl">
            <textarea className="si" rows={3} value={form.hero_subtitle_ar}
              onChange={(e) => patch('hero_subtitle_ar', e.target.value)} />
          </Field>
          <Field label="Untertitel (Englisch)" dir="ltr">
            <textarea className="si" rows={3} value={form.hero_subtitle_en}
              onChange={(e) => patch('hero_subtitle_en', e.target.value)} />
          </Field>
        </FieldRow>
      </section>

      {/* Speichern */}
      <div className="flex justify-end pb-8">
        <button
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-6 py-3 font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
        >
          {saving
            ? <Loader2 className="size-4 animate-spin" aria-hidden />
            : <Save className="size-4" aria-hidden />}
          {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <style>{`
        .si {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border, #e2e8f0);
          background: var(--color-surface, #fff);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--color-ink, #1a202c);
          outline: none;
          resize: vertical;
        }
        .si:focus { border-color: #1a4e9c; }
      `}</style>
    </div>
  )
}

function LogoField({
  label,
  current,
  fallback,
  uploading,
  inputRef,
  onClear,
  onFileChange,
}: {
  label: string
  current: string | null
  fallback: string
  uploading: boolean
  inputRef: React.MutableRefObject<HTMLInputElement | null>
  onClear: () => void
  onFileChange: (f: File) => void
}) {
  const src = current ?? fallback

  return (
    <div className="space-y-3">
      <p className="text-fluid-sm font-medium text-ink">{label}</p>
      <div className="relative size-24 overflow-hidden rounded-xl border border-border bg-surface">
        <Image src={src} alt={label} fill className="object-contain p-1" unoptimized />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-fluid-xs font-medium text-ink hover:bg-surface disabled:opacity-50',
          )}
        >
          {uploading
            ? <Loader2 className="size-3 animate-spin" aria-hidden />
            : <Upload className="size-3" aria-hidden />}
          {uploading ? 'جارٍ الرفع...' : 'رفع صورة'}
        </button>
        {current && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-border px-3 py-1.5 text-fluid-xs text-red-600 hover:bg-red-50"
          >
            إعادة الافتراضي
          </button>
        )}
      </div>
      <input
        ref={(el) => { inputRef.current = el }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(f) }}
      />
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

function Field({
  label,
  dir,
  children,
}: {
  label: string
  dir: 'rtl' | 'ltr'
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-fluid-sm font-medium text-ink">{label}</span>
      <div dir={dir}>{children}</div>
    </label>
  )
}
