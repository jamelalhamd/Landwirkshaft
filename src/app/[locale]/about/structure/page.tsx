import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 3600

const RESEARCH_ADMINS = {
  ar: ['إدارة بحوث المحاصيل الحقلية','إدارة بحوث البستنة','إدارة بحوث الموارد الطبيعية','إدارة بحوث وقاية النبات','إدارة الدراسات الاقتصادية والاجتماعية','إدارة بحوث القطن','إدارة بحوث الثروة الحيوانية'],
  en: ['Crops Research Administration','Horticulture Research Administration','Natural Resources Research Administration','Plant Protection Research Administration','Economic & Social Studies Administration','Cotton Research Administration','Livestock Research Administration'],
}

const DIVISIONS = {
  ar: ['شعبة التقانات الحيوية','شعبة التكنولوجيا الغذائية','شعبة الموارد الوراثية','شعبة نقل التقانة'],
  en: ['Biotechnology Division','Food Technology Division','Genetic Resources Division','Technology Transfer Division'],
}

const SERVICE_UNITS = {
  ar: ['إدارة الشؤون الإدارية','إدارة الشؤون الفنية','شعبة مكتب المدير العام','شعبة التأهيل والتدريب','شعبة الإحصاء والتخطيط','شعبة الرقابة الداخلية','شعبة العلاقات العامة والدولية','شعبة الإعلام والنشر والمكتبة'],
  en: ['Administrative Affairs Administration','Technical Affairs Administration','General Director\'s Office Division','Qualification and Training Division','Statistics and Planning Division','Internal Audit Division','Public and International Relations Division','Information, Publishing & Library Division'],
}

const CENTERS = {
  ar: ['الحسكة','الرقة','السلمية','السويداء','الغاب','القامشلي','القنيطرة','اللاذقية','إدلب','جوسية الخراب','حلب','حماة','حمص','درعا','دير الزور','ريف دمشق','طرطوس','المحسنة'],
  en: ['Hasakah','Raqqa','Salamieh','Sweida','Ghab','Qamishli','Quneitra','Latakia','Idlib','Jousiyah Al-Kharab','Aleppo','Hama','Homs','Daraa','Deir ez-Zor','Rif Damascus','Tartus','Muhsanah'],
}

export default async function StructurePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  const group = (title: string, items: string[]) => (
    <div className="gov-card p-6">
      <h3 className="mb-4 text-fluid-sm font-bold uppercase tracking-wider text-secondary-600">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-fluid-sm text-ink-muted">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secondary-400" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <>
      <PageHeader title={dict.nav.structure} subtitle={isAr ? 'الهيكل التنظيمي للهيئة العامة للبحوث العلمية الزراعية' : 'Organizational structure of GCSAR'} />
      <section className="gov-section">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {group(isAr ? 'إدارات البحوث العلمية' : 'Research Administrations', isAr ? RESEARCH_ADMINS.ar : RESEARCH_ADMINS.en)}
            {group(isAr ? 'شعب البحوث' : 'Research Divisions', isAr ? DIVISIONS.ar : DIVISIONS.en)}
            {group(isAr ? 'الوحدات الإدارية والخدمية' : 'Administrative & Service Units', isAr ? SERVICE_UNITS.ar : SERVICE_UNITS.en)}
          </div>

          <div className="mt-8 gov-card p-6">
            <h3 className="mb-4 text-fluid-sm font-bold uppercase tracking-wider text-secondary-600">
              {isAr ? `مراكز البحوث المحافظاتية (${CENTERS.ar.length} مركزاً)` : `Provincial Research Centers (${CENTERS.en.length} centers)`}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(isAr ? CENTERS.ar : CENTERS.en).map((c) => (
                <span key={c} className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs text-ink-muted">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
