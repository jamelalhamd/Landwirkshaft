import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function WorkshopsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.workshops} subtitle={dict.meta.tagline} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="ورشات العمل" titleEn="Workshops"
          descAr="ورشات العمل العلمية والتقنية التي تنظمها الهيئة. قيد النقل." descEn="Scientific and technical workshops organized by GCSAR. Migration in progress." />
      </div></section>
    </>
  )
}
