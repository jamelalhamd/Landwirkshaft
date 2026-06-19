import { notFound, redirect } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await getSession()

  if (!session.authenticated) {
    redirect(`/${locale}/login`)
  }

  if (!session.roleAtLeast('editor')) {
    return (
      <section className="gov-section">
        <div className="container max-w-lg">
          <div className="gov-card p-8 text-center">
            <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <ShieldAlert className="size-6" aria-hidden />
            </div>
            <h1 className="text-fluid-xl font-bold text-ink">
              {locale === 'ar' ? 'صلاحيات غير كافية' : 'Insufficient permissions'}
            </h1>
            <p className="mt-2 text-fluid-sm text-ink-muted">
              {locale === 'ar'
                ? 'حسابك لا يملك صلاحيات الوصول إلى لوحة التحكم.'
                : 'Your account does not have access to the admin dashboard.'}
            </p>
            <div className="mt-6 flex justify-center">
              <LogoutButton locale={locale} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  const { profile } = session

  return (
    <div className="flex">
      <AdminSidebar locale={locale} role={profile!.role} />

      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="text-fluid-sm text-ink-muted">
            {profile?.displayName || profile?.email}
            <span className="mx-1.5 text-border">·</span>
            <span className="capitalize">{profile?.role.replace('_', ' ')}</span>
          </span>
          <LogoutButton locale={locale} />
        </div>

        {/* Page content */}
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
