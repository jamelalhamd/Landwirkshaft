import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function VarietiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.varieties} subtitle={dict.meta.tagline} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="الأصناف النباتية المعتمدة" titleEn="Approved Plant Varieties"
          descAr="سجل الأصناف النباتية المعتمدة من قبل الهيئة. قيد النقل من الموقع الأصلي." descEn="Registry of plant varieties approved by GCSAR. Content migration in progress." />
      </div></section>
    </>
  )
}
