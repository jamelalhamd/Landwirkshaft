import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 3600

export default async function StrategyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  const objectives = isAr ? [
    'تحسين الإنتاجية الزراعية وتطوير أصناف نباتية وسلالات حيوانية ملائمة للبيئة السورية.',
    'الحفاظ على الموارد الطبيعية وتعزيز الاستخدام الأمثل للمياه والتربة.',
    'رفع مستوى الأمن الغذائي الوطني من خلال زيادة وتنويع الإنتاج الزراعي.',
    'نقل التقانات الزراعية الحديثة إلى المزارعين والتقنيين عبر برامج التدريب والإرشاد.',
    'تعزيز التعاون العلمي مع المنظمات الدولية والإقليمية كإيكاردا والفاو والأكساد.',
    'توثيق الموارد الوراثية النباتية والحيوانية السورية وحمايتها من الانقراض.',
    'تطوير القدرات البحثية للعاملين في الهيئة ومراكزها الإقليمية.',
  ] : [
    'Improve agricultural productivity and develop plant varieties and animal breeds suited to the Syrian environment.',
    'Conserve natural resources and promote optimal use of water and soil.',
    'Enhance national food security by increasing and diversifying agricultural production.',
    'Transfer modern agricultural technologies to farmers and technicians through training and extension programs.',
    'Strengthen scientific cooperation with international and regional organizations such as ICARDA, FAO, and ACSAD.',
    'Document and protect Syrian plant and animal genetic resources from extinction.',
    'Develop the research capacities of Commission staff and regional centers.',
  ]

  return (
    <>
      <PageHeader
        title={dict.nav.strategy}
        subtitle={isAr ? 'أهداف واستراتيجية الهيئة العامة للبحوث العلمية الزراعية' : 'Goals and strategy of the General Commission for Scientific Agricultural Research'}
      />
      <section className="gov-section">
        <div className="container max-w-3xl">
          <div className="gov-card p-8">
            <h2 className="mb-6 text-fluid-xl font-bold text-ink">
              {isAr ? 'الأهداف الاستراتيجية' : 'Strategic Objectives'}
            </h2>
            <ol className="space-y-4">
              {objectives.map((obj, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-700">
                    {i + 1}
                  </span>
                  <p className="text-fluid-sm text-ink-muted leading-relaxed">{obj}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  )
}
