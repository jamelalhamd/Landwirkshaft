import { LogIn } from 'lucide-react'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)

  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
            {locale === 'ar'
              ? 'مخصص للموظفين المعتمدين فقط.'
              : 'Authorized staff only.'}
          </p>

          {supabaseConfigured ? (
            <LoginForm locale={locale} dict={dict} />
          ) : (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-fluid-sm text-amber-800">
              {locale === 'ar'
                ? 'لم يتم ربط Supabase بعد. عبّئ NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY ثم فعّل مصدر البيانات.'
                : 'Supabase is not connected yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then enable the live data source.'}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
