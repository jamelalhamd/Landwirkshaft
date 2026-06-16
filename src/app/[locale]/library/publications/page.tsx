import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function PublicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.drawer.libraryPublications} subtitle={dict.nav.library} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="الإصدارات العلمية" titleEn="Scientific Publications"
          descAr="كتب ومنشورات علمية صادرة عن باحثي الهيئة. قيد النقل." descEn="Books and papers by GCSAR researchers. Content migration in progress." />
      </div></section>
    </>
  )
}
