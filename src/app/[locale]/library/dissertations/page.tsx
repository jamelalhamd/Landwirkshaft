import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder'

export const revalidate = 600

export default async function DissertationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.drawer.libraryDissertations} subtitle={dict.nav.library} />
      <section className="gov-section"><div className="container max-w-2xl">
        <ContentPlaceholder locale={locale}
          titleAr="رسائل الدكتوراه والماجستير" titleEn="PhD & MSc Dissertations"
          descAr="قاعدة بيانات رسائل جامعية أعدّها باحثو الهيئة. قيد النقل." descEn="Database of dissertations by GCSAR researchers. Content migration in progress." />
      </div></section>
    </>
  )
}
