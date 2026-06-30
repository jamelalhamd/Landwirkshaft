'use client'

import { useState, useCallback } from 'react'
import { PlusCircle, Edit2, Trash2, X, Save, RefreshCw, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/auth/types'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface StaffMember {
  id: string
  full_name_ar: string
  full_name_en: string
  position_ar: string
  position_en: string
  department_id: string
  email: string | null
  phone: string | null
  office: string | null
  photo_url: string | null
  bio_ar: string | null
  bio_en: string | null
  display_order: number
  is_active: boolean
  [key: string]: unknown
}

interface Department {
  id: string
  name_ar: string
  name_en: string
  [key: string]: unknown
}

interface FormState {
  full_name_ar: string
  full_name_en: string
  position_ar: string
  position_en: string
  department_id: string
  email: string
  phone: string
  office: string
  photo_url: string
  bio_ar: string
  bio_en: string
  display_order: string
  is_active: boolean
}

const EMPTY: FormState = {
  full_name_ar: '', full_name_en: '',
  position_ar: '', position_en: '',
  department_id: '',
  email: '', phone: '', office: '',
  photo_url: '',
  bio_ar: '', bio_en: '',
  display_order: '0',
  is_active: true,
}

function memberToForm(m: StaffMember): FormState {
  return {
    full_name_ar: m.full_name_ar,
    full_name_en: m.full_name_en,
    position_ar: m.position_ar,
    position_en: m.position_en,
    department_id: m.department_id,
    email: m.email ?? '',
    phone: m.phone ?? '',
    office: m.office ?? '',
    photo_url: m.photo_url ?? '',
    bio_ar: m.bio_ar ?? '',
    bio_en: m.bio_en ?? '',
    display_order: String(m.display_order),
    is_active: m.is_active,
  }
}

export function StaffAdminClient({
  locale,
  role,
  initialStaff,
  initialDepartments,
}: {
  locale: string
  role: UserRole
  initialStaff: Record<string, unknown>[]
  initialDepartments: Record<string, unknown>[]
}) {
  const isAr = locale === 'ar'
  const canEdit = role === 'admin' || role === 'super_admin'

  const [staff, setStaff]             = useState<StaffMember[]>(initialStaff as StaffMember[])
  const [departments]                 = useState<Department[]>(initialDepartments as Department[])
  const [panelOpen, setPanelOpen]     = useState(false)
  const [editing, setEditing]         = useState<StaffMember | null>(null)
  const [form, setForm]               = useState<FormState>(EMPTY)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [deptFilter, setDeptFilter]   = useState<string>('all')

  const visible = deptFilter === 'all'
    ? staff
    : staff.filter((m) => m.department_id === deptFilter)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/staff')
      if (res.ok) setStaff((await res.json()) as StaffMember[])
    } finally { setLoading(false) }
  }, [])

  function deptName(id: string) {
    const d = departments.find((d) => d.id === id)
    if (!d) return id
    return isAr ? d.name_ar : d.name_en
  }

  function openNew() { setEditing(null); setForm(EMPTY); setError(''); setPanelOpen(true) }
  function openEdit(m: StaffMember) { setEditing(m); setForm(memberToForm(m)); setError(''); setPanelOpen(true) }
  function close() { setPanelOpen(false); setEditing(null); setError('') }
  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  async function save() {
    setLoading(true); setError('')
    try {
      const payload = {
        full_name_ar: form.full_name_ar,
        full_name_en: form.full_name_en,
        position_ar: form.position_ar,
        position_en: form.position_en,
        department_id: form.department_id,
        email: form.email || null,
        phone: form.phone || null,
        office: form.office || null,
        photo_url: form.photo_url || null,
        bio_ar: form.bio_ar || null,
        bio_en: form.bio_en || null,
        display_order: parseInt(form.display_order, 10) || 0,
        is_active: form.is_active,
      }
      const url    = editing ? `/api/admin/staff/${editing.id}` : '/api/admin/staff'
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
      await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
      setStaff((prev) => prev.filter((m) => m.id !== id))
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
            {isAr ? 'موظف جديد' : 'New Member'}
          </button>
        )}
        <button onClick={() => void refresh()} disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-fluid-sm text-ink-muted hover:bg-surface disabled:opacity-50">
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
          {isAr ? 'تحديث' : 'Refresh'}
        </button>

        {/* Department filter */}
        <div className="ms-auto flex flex-wrap gap-1">
          <button onClick={() => setDeptFilter('all')}
            className={cn('rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
              deptFilter === 'all' ? 'bg-primary-700 text-white' : 'text-ink-muted hover:bg-surface')}>
            {isAr ? 'الكل' : 'All'}
          </button>
          {departments.map((d) => (
            <button key={d.id} onClick={() => setDeptFilter(d.id)}
              className={cn('rounded-md px-3 py-1 text-fluid-xs font-medium transition-colors',
                deptFilter === d.id ? 'bg-primary-700 text-white' : 'text-ink-muted hover:bg-surface')}>
              {isAr ? d.name_ar : d.name_en}
            </button>
          ))}
        </div>
      </div>

      <div className="gov-card overflow-hidden">
        <table className="w-full text-fluid-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 text-start font-semibold text-ink">{isAr ? 'الاسم' : 'Name'}</th>
              <th className="hidden px-4 py-3 text-start font-semibold text-ink md:table-cell">{isAr ? 'المنصب' : 'Position'}</th>
              <th className="hidden px-4 py-3 text-start font-semibold text-ink lg:table-cell">{isAr ? 'القسم' : 'Department'}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="px-4 py-3 text-end font-semibold text-ink">{isAr ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                {isAr ? 'لا يوجد موظفون.' : 'No staff members found.'}
              </td></tr>
            )}
            {visible.map((m) => (
              <tr key={m.id} className="border-t border-border hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.photo_url} alt="" className="size-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary-100">
                        <Users className="size-4 text-primary-600" aria-hidden />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-ink">{isAr ? m.full_name_ar : m.full_name_en}</p>
                      <p className="text-fluid-xs text-ink-muted">{m.email ?? ''}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                  {isAr ? m.position_ar : m.position_en}
                </td>
                <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">
                  {deptName(m.department_id)}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-fluid-xs font-medium',
                    m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {m.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {canEdit && (
                      <button onClick={() => openEdit(m)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fluid-xs text-primary-700 hover:bg-primary-50">
                        <Edit2 className="size-3" aria-hidden />
                        {isAr ? 'تعديل' : 'Edit'}
                      </button>
                    )}
                    {canEdit && (
                      deleteId === m.id ? (
                        <span className="flex items-center gap-2 text-fluid-xs">
                          <button onClick={() => void confirmDelete(m.id)}
                            className="font-semibold text-red-600 hover:underline">
                            {isAr ? 'تأكيد' : 'Confirm'}
                          </button>
                          <button onClick={() => setDeleteId(null)} className="text-ink-muted hover:underline">
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteId(m.id)}
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
                {editing ? (isAr ? 'تعديل الموظف' : 'Edit Member') : (isAr ? 'موظف جديد' : 'New Member')}
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

              <F label={isAr ? 'الاسم (عربي) *' : 'Full name (Arabic) *'}>
                <input type="text" required dir="rtl" value={form.full_name_ar}
                  onChange={(e) => patch('full_name_ar', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'الاسم (إنجليزي) *' : 'Full name (English) *'}>
                <input type="text" required dir="ltr" value={form.full_name_en}
                  onChange={(e) => patch('full_name_en', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'المنصب (عربي) *' : 'Position (Arabic) *'}>
                <input type="text" required dir="rtl" value={form.position_ar}
                  onChange={(e) => patch('position_ar', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'المنصب (إنجليزي) *' : 'Position (English) *'}>
                <input type="text" required dir="ltr" value={form.position_en}
                  onChange={(e) => patch('position_en', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'القسم' : 'Department'}>
                <select value={form.department_id}
                  onChange={(e) => patch('department_id', e.target.value)} className="fi">
                  <option value="">{isAr ? '-- اختر --' : '-- Select --'}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{isAr ? d.name_ar : d.name_en}</option>
                  ))}
                </select>
              </F>
              <div className="flex gap-3">
                <F label={isAr ? 'البريد الإلكتروني' : 'Email'} className="flex-1">
                  <input type="email" dir="ltr" value={form.email}
                    onChange={(e) => patch('email', e.target.value)} className="fi" />
                </F>
                <F label={isAr ? 'الهاتف' : 'Phone'} className="flex-1">
                  <input type="tel" dir="ltr" value={form.phone}
                    onChange={(e) => patch('phone', e.target.value)} className="fi" />
                </F>
              </div>
              <F label={isAr ? 'المكتب' : 'Office'}>
                <input type="text" value={form.office}
                  onChange={(e) => patch('office', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'الصورة الشخصية' : 'Photo'}>
                <ImageUpload
                  value={form.photo_url}
                  onChange={(url) => patch('photo_url', url)}
                  folder="staff"
                />
              </F>
              <F label={isAr ? 'نبذة (عربي)' : 'Bio (Arabic)'}>
                <textarea rows={2} dir="rtl" value={form.bio_ar}
                  onChange={(e) => patch('bio_ar', e.target.value)} className="fi" />
              </F>
              <F label={isAr ? 'نبذة (إنجليزي)' : 'Bio (English)'}>
                <textarea rows={2} dir="ltr" value={form.bio_en}
                  onChange={(e) => patch('bio_en', e.target.value)} className="fi" />
              </F>
              <div className="flex items-end gap-6">
                <F label={isAr ? 'ترتيب العرض' : 'Display Order'} className="w-32">
                  <input type="number" min="0" value={form.display_order}
                    onChange={(e) => patch('display_order', e.target.value)} className="fi" />
                </F>
                <label className="flex items-center gap-2 pb-2">
                  <input type="checkbox" checked={form.is_active}
                    onChange={(e) => patch('is_active', e.target.checked)}
                    className="size-4 rounded border-border" />
                  <span className="text-fluid-sm font-medium text-ink">
                    {isAr ? 'نشط' : 'Active'}
                  </span>
                </label>
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
