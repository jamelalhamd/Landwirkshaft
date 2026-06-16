import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function PastEventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.drawer.pastEvents} subtitle={dict.nav.events} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="الفعاليات السابقة" titleEn="Past Events"
          descAr="أرشيف فعاليات ونشاطات الهيئة. قيد النقل." descEn="Archive of past GCSAR events and activities. Migration in progress." />
      </div></section>
    </>
  )
}
