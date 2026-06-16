import Link from 'next/link'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ChevronLeft, ChevronRight, Building2, ScrollText, Target } from 'lucide-react'

export const revalidate = 3600

const UNIFIED_ENTITIES = {
  ar: [
    'مديرية البحوث العلمية الزراعية',
    'مديرية الري واستثمار المياه',
    'مديرية الأراضي',
    'مديرية بحوث الإنتاج الحيواني',
    'مكاتب بحوث القطن والزيتون والحمضيات والشمندر السكري',
    'مركز بحوث الفواكه',
    'قسم بحوث الغابات',
  ],
  en: [
    'Agricultural Scientific Research Directorate',
    'Irrigation and Water Utilization Directorate',
    'Land Directorate',
    'Animal Production Research Directorate',
    'Cotton, Olive, Citrus, and Sugar Beet Research Offices',
    'Fruit Research Center',
    'Forestry Research Division',
  ],
}

const CENTERS = {
  ar: ['الحسكة','الرقة','السلمية','السويداء','الغاب','القامشلي','القنيطرة','اللاذقية','إدلب','جوسية الخراب','حلب','حماة','حمص','درعا','دير الزور','ريف دمشق','طرطوس','المحسنة'],
  en: ['Hasakah','Raqqa','Salamieh','Sweida','Ghab','Qamishli','Quneitra','Latakia','Idlib','Jousiyah Al-Kharab','Aleppo','Hama','Homs','Daraa','Deir ez-Zor','Rif Damascus','Tartus','Muhsanah'],
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'
  const ArrowEnd = isAr ? ChevronLeft : ChevronRight

  const subPages = [
    { key: 'regulation' as const, href: `/${locale}/about/regulation`, Icon: ScrollText },
    { key: 'strategy'   as const, href: `/${locale}/about/strategy`,   Icon: Target },
    { key: 'structure'  as const, href: `/${locale}/about/structure`,  Icon: Building2 },
  ]

  return (
    <>
      <PageHeader title={dict.nav.about} subtitle={dict.meta.tagline} />

      <section className="gov-section">
        <div className="container max-w-4xl">

          {/* Sub-page quick links */}
          <div className="mb-10 grid gap-3 sm:grid-cols-3">
            {subPages.map(({ key, href, Icon }) => (
              <Link key={key} href={href} className="gov-card-interactive flex items-center gap-3 p-4">
                <Icon className="size-5 shrink-0 text-secondary-600" aria-hidden />
                <span className="font-medium text-ink">{dict.nav[key]}</span>
                <ArrowEnd className="ms-auto size-4 shrink-0 text-ink-subtle" aria-hidden />
              </Link>
            ))}
          </div>

          {/* Establishment */}
          <div className="prose prose-slate max-w-none text-ink-muted">
            <h2 className="text-fluid-xl font-bold text-ink">
              {isAr ? 'نبذة عن الهيئة' : 'About the Commission'}
            </h2>
            <p>
              {isAr
                ? 'الهيئة العامة للبحوث العلمية الزراعية مؤسسة حكومية سورية تأسست بموجب القانون رقم 42 لعام 2001، بهدف توحيد وتطوير العمل البحثي الزراعي في الجمهورية العربية السورية تحت مظلة وزارة الزراعة والإصلاح الزراعي.'
                : 'The General Commission for Scientific Agricultural Research (GCSAR) is a Syrian government institution established by Law No. 42 of 2001, with the aim of consolidating and advancing agricultural research in the Syrian Arab Republic under the Ministry of Agriculture and Agrarian Reform.'}
            </p>

            <h3 className="text-fluid-lg font-semibold text-ink">
              {isAr ? 'الجهات الموحّدة عند التأسيس' : 'Entities Unified at Establishment'}
            </h3>
            <p>
              {isAr
                ? 'جمعت الهيئة عند تأسيسها عدة جهات بحثية كانت تعمل بشكل مستقل، وهي:'
                : 'At its founding, the Commission unified several previously independent research entities:'}
            </p>
            <ul>
              {(isAr ? UNIFIED_ENTITIES.ar : UNIFIED_ENTITIES.en).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>

            <h3 className="text-fluid-lg font-semibold text-ink">
              {isAr ? 'مراكز البحوث المحافظاتية' : 'Provincial Research Centers'}
            </h3>
            <p>
              {isAr
                ? `تمتلك الهيئة شبكة من ${CENTERS.ar.length} مركزاً بحثياً موزّعة على المحافظات السورية:`
                : `GCSAR operates a network of ${CENTERS.en.length} research centers across Syrian governorates:`}
            </p>
            <p className="text-sm leading-relaxed">
              {(isAr ? CENTERS.ar : CENTERS.en).join(' · ')}
            </p>

            <h3 className="text-fluid-lg font-semibold text-ink">
              {isAr ? 'الرسالة' : 'Mission'}
            </h3>
            <p>
              {isAr
                ? 'تضطلع الهيئة بدور محوري في تحديث الزراعة السورية عبر توليف البحث العلمي، ونقل التقانة، وتأهيل الكوادر البشرية، وتطوير البنية التحتية للبحث الزراعي على المستويين الوطني والإقليمي.'
                : 'GCSAR plays a central role in modernizing Syrian agriculture through the integration of scientific research, technology transfer, human resource development, and the advancement of agricultural research infrastructure at national and regional levels.'}
            </p>
          </div>

          {/* Contact block */}
          <div className="mt-10 rounded-2xl border border-border bg-surface-muted/40 p-6">
            <h3 className="mb-4 font-semibold text-ink">
              {isAr ? 'معلومات التواصل' : 'Contact Information'}
            </h3>
            <dl className="space-y-2 text-fluid-sm text-ink-muted">
              <div className="flex gap-2">
                <dt className="font-medium text-ink">{isAr ? 'العنوان:' : 'Address:'}</dt>
                <dd>{isAr ? 'شارع الحلبوني، حي المكتبات، دمشق، الجمهورية العربية السورية' : 'Halbouni St., Libraries District, Damascus, Syrian Arab Republic'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-ink">{isAr ? 'الهاتف:' : 'Phone:'}</dt>
                <dd dir="ltr"><a href="tel:+963112216901" className="hover:text-primary-700">+963 11 2216901</a></dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-ink">{isAr ? 'الفاكس:' : 'Fax:'}</dt>
                <dd dir="ltr">+963 11 2254884</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-ink">{isAr ? 'ص.ب:' : 'P.O. Box:'}</dt>
                <dd>12573</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-ink">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</dt>
                <dd><a href="mailto:information@gcsar.gov.sy" className="hover:text-primary-700">information@gcsar.gov.sy</a></dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
