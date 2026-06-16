import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/getSession'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default async function AdminLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
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

  return (
    <section className="gov-section">
      <div className="container">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-fluid-2xl font-extrabold text-ink">{dict.nav.admin}</h1>
            <p className="mt-1 text-fluid-sm text-ink-muted">
              {locale === 'ar' ? 'مرحباً' : 'Welcome'},{' '}
              {session.profile?.displayName || session.profile?.email}
              {' · '}
              <span className="capitalize">{session.profile?.role.replace('_', ' ')}</span>
            </p>
          </div>
          <LogoutButton locale={locale} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ['news', dict.nav.news],
              ['documents', dict.nav.documents],
              ['research', dict.nav.research],
              ['staff', dict.nav.staff],
              ['gallery', dict.nav.gallery],
              ['contact', dict.nav.contact],
            ] as const
          ).map(([slug, label]) => (
            <Link
              key={slug}
              href={`/${locale}/admin/${slug}`}
              className="gov-card-interactive p-5"
            >
              <h3 className="font-bold text-ink">{label}</h3>
              <p className="text-fluid-sm text-ink-muted">
                {locale === 'ar' ? 'إدارة المحتوى' : 'Manage content'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
