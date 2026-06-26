import { LogIn } from 'lucide-react'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/getSession'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ reason?: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  // Already authenticated → go straight to admin
  const session = await getSession()
  if (session.authenticated) redirect(`/${locale}/admin`)

  const dict = await getDictionary(locale)
  const firebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const { reason } = await searchParams

  const timeoutBanner = reason === 'timeout' || reason === 'expired'

  return (
    <section className="gov-section">
      <div className="container max-w-md">
        <div className="gov-card p-8">
          <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <LogIn className="size-5" aria-hidden />
          </div>
          <h1 className="text-fluid-xl font-bold text-ink">
            {locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
          </h1>
          <p className="mt-1 text-fluid-sm text-ink-muted">
            {locale === 'ar' ? 'مخصص للموظفين المعتمدين فقط.' : 'Authorized staff only.'}
          </p>

          {/* Session timeout / expiry notice */}
          {timeoutBanner && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-fluid-sm text-amber-800">
              {reason === 'timeout'
                ? (locale === 'ar'
                  ? 'انتهت جلستك بسبب عدم النشاط لمدة 10 دقائق. يرجى تسجيل الدخول مجدداً.'
                  : 'Your session expired after 10 minutes of inactivity. Please sign in again.')
                : (locale === 'ar'
                  ? 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مجدداً.'
                  : 'Your session has expired. Please sign in again.')}
            </div>
          )}

          {firebaseConfigured ? (
            <LoginForm locale={locale} dict={dict} />
          ) : (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-fluid-sm text-amber-800">
              {locale === 'ar'
                ? 'لم يتم ربط Firebase بعد. أضف NEXT_PUBLIC_FIREBASE_API_KEY وباقي المتغيرات إلى .env.local.'
                : 'Firebase is not configured yet. Add NEXT_PUBLIC_FIREBASE_API_KEY and the other variables to .env.local.'}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
