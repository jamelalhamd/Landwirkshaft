import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 3600

export default async function RegulationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <>
      <PageHeader
        title={dict.nav.regulation}
        subtitle={isAr ? 'القانون رقم 42 لعام 2001' : 'Law No. 42 of 2001'}
      />
      <section className="gov-section">
        <div className="container max-w-3xl">
          <div className="gov-card p-8 prose prose-slate max-w-none text-ink-muted">
            <h2 className="text-ink">{isAr ? 'مرسوم التأسيس' : 'Founding Decree'}</h2>
            <p>
              {isAr
                ? 'صدر القانون رقم 42 لعام 2001 القاضي بإنشاء الهيئة العامة للبحوث العلمية الزراعية وتحديد صلاحياتها وهيكلها التنظيمي. جاء هذا القانون لتوحيد جهود البحث الزراعي المتفرقة في إطار مؤسسي واحد يعمل تحت إشراف وزارة الزراعة والإصلاح الزراعي.'
                : 'Law No. 42 of 2001 established the General Commission for Scientific Agricultural Research and defined its mandate and organizational structure. This law was enacted to unify fragmented agricultural research efforts under a single institutional framework supervised by the Ministry of Agriculture and Agrarian Reform.'}
            </p>
            <h3 className="text-ink">{isAr ? 'أبرز ما جاء في القانون' : 'Key Provisions'}</h3>
            <ul>
              {isAr ? (
                <>
                  <li>إنشاء الهيئة بوصفها مؤسسة حكومية ذات شخصية اعتبارية مستقلة.</li>
                  <li>تحديد مهام الهيئة في تطوير البحث الزراعي وتحسين الإنتاج الزراعي.</li>
                  <li>ضم الجهات البحثية السابقة وتوحيد مواردها البشرية والمادية.</li>
                  <li>تشكيل مجلس إدارة يتولى الإشراف العام على عمل الهيئة.</li>
                  <li>منح الهيئة صلاحية إبرام الاتفاقيات العلمية مع المنظمات الدولية.</li>
                </>
              ) : (
                <>
                  <li>Establishment of the Commission as a government institution with independent legal personality.</li>
                  <li>Definition of the Commission's mandate to develop agricultural research and improve agricultural production.</li>
                  <li>Absorption of prior research entities and unification of their human and material resources.</li>
                  <li>Formation of a Board of Directors to oversee the Commission's operations.</li>
                  <li>Authorization to conclude scientific agreements with international organizations.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
