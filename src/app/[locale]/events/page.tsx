import Link from 'next/link'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { CalendarDays, History } from 'lucide-react'

export const revalidate = 300

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <>
      <PageHeader title={dict.nav.events} subtitle={dict.meta.tagline} />
      <section className="gov-section">
        <div className="container max-w-xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href={`/${locale}/events/upcoming`} className="gov-card-interactive flex items-center gap-4 p-6">
              <CalendarDays className="size-6 shrink-0 text-secondary-600" aria-hidden />
              <div>
                <p className="font-semibold text-ink">{dict.drawer.upcomingEvents}</p>
                <p className="text-fluid-sm text-ink-muted">{isAr ? 'الفعاليات القادمة' : 'Coming events'}</p>
              </div>
            </Link>
            <Link href={`/${locale}/events/past`} className="gov-card-interactive flex items-center gap-4 p-6">
              <History className="size-6 shrink-0 text-primary-600" aria-hidden />
              <div>
                <p className="font-semibold text-ink">{dict.drawer.pastEvents}</p>
                <p className="text-fluid-sm text-ink-muted">{isAr ? 'أرشيف الفعاليات' : 'Events archive'}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
