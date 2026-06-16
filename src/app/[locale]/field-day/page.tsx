import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function FieldDayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.fieldDay} subtitle={dict.meta.tagline} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="الأيام الحقلية" titleEn="Field Days"
          descAr="الأيام الحقلية التي تنظمها مراكز البحوث. قيد النقل." descEn="Field days organized by GCSAR research centers. Migration in progress." />
      </div></section>
    </>
  )
}
