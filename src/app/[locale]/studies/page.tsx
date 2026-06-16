import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function StudiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.studies} subtitle={dict.meta.tagline} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="الدراسات الزراعية" titleEn="Agricultural Studies"
          descAr="الدراسات الاقتصادية والاجتماعية والتقنية الصادرة عن الهيئة. قيد النقل." descEn="Economic, social, and technical studies published by GCSAR. Migration in progress." />
      </div></section>
    </>
  )
}
