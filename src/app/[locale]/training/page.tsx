import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function TrainingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.training} subtitle={dict.meta.tagline} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="الدورات التدريبية" titleEn="Training Courses"
          descAr="الدورات التدريبية التي تنظمها الهيئة للباحثين والمزارعين. قيد النقل." descEn="Training courses organized by GCSAR for researchers and farmers. Migration in progress." />
      </div></section>
    </>
  )
}
