import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 120

export default async function TendersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.tenders} subtitle={dict.meta.siteName} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="المناقصات والإعلانات" titleEn="Tenders & Announcements"
          descAr="إعلانات المناقصات الصادرة عن الهيئة. قيد النقل من الموقع الأصلي." descEn="Tender announcements issued by GCSAR. Content migration in progress." />
      </div></section>
    </>
  )
}
