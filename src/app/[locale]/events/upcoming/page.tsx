import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 300

export default async function UpcomingEventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.drawer.upcomingEvents} subtitle={dict.nav.events} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="الفعاليات القادمة" titleEn="Upcoming Events"
          descAr="قائمة الفعاليات والنشاطات القادمة للهيئة. قيد النقل." descEn="List of upcoming GCSAR events and activities. Migration in progress." />
      </div></section>
    </>
  )
}
