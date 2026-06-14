import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <>
      <PageHeader title={dict.nav.about} subtitle={dict.meta.tagline} />
      <section className="gov-section">
        <div className="container prose prose-slate max-w-3xl text-ink-muted">
          <p>
            {locale === 'ar'
              ? 'الهيئة العامة للبحوث العلمية الزراعية مؤسسة حكومية تُعنى بتطوير القطاع الزراعي في الجمهورية العربية السورية، عبر شبكة من المراكز البحثية الموزّعة على المحافظات.'
              : 'GCSAR is a government institution dedicated to developing the agricultural sector of the Syrian Arab Republic through a network of research centers across governorates.'}
          </p>
        </div>
      </section>
    </>
  )
}
