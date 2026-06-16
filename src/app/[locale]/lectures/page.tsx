import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function LecturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.lectures} subtitle={dict.nav.about} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="المحاضرات العلمية" titleEn="Scientific Lectures"
          descAr="أرشيف المحاضرات العلمية التي تنظمها الهيئة. قيد النقل من الموقع الأصلي." descEn="Archive of scientific lectures organized by GCSAR. Content migration in progress." />
      </div></section>
    </>
  )
}
