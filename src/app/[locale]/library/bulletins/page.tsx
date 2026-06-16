import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function BulletinsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.drawer.libraryBulletins} subtitle={dict.nav.library} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="النشرات الإرشادية" titleEn="Extension Bulletins"
          descAr="نشرات إرشادية موجهة للمزارعين والتقنيين. قيد النقل." descEn="Bulletins for farmers and agricultural technicians. Content migration in progress." />
      </div></section>
    </>
  )
}
