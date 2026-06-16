import Link from 'next/link'
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { GraduationCap, BarChart3, BookOpen, Rss, ChevronLeft, ChevronRight } from 'lucide-react'

export const revalidate = 600

export default async function LibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'
  const ArrowEnd = isAr ? ChevronLeft : ChevronRight

  const sections = [
    {
      href: `/${locale}/library/dissertations`,
      Icon: GraduationCap,
      titleAr: 'رسائل الدكتوراه والماجستير',
      titleEn: 'PhD & MSc Dissertations',
      descAr: 'رسائل جامعية أعدّها باحثو الهيئة في الجامعات السورية والعربية والأجنبية.',
      descEn: 'Academic dissertations prepared by GCSAR researchers at Syrian, Arab, and international universities.',
    },
    {
      href: `/${locale}/library/annual-reports`,
      Icon: BarChart3,
      titleAr: 'التقارير السنوية',
      titleEn: 'Annual Reports',
      descAr: 'التقارير السنوية الصادرة عن الهيئة توثّق إنجازاتها ومشاريعها البحثية.',
      descEn: 'Annual reports documenting the Commission\'s achievements and research projects.',
    },
    {
      href: `/${locale}/library/publications`,
      Icon: BookOpen,
      titleAr: 'الإصدارات العلمية',
      titleEn: 'Scientific Publications',
      descAr: 'الكتب والمطبوعات العلمية الصادرة عن باحثي الهيئة في المجلات المحكمة.',
      descEn: 'Books and scientific publications by GCSAR researchers in peer-reviewed journals.',
    },
    {
      href: `/${locale}/library/bulletins`,
      Icon: Rss,
      titleAr: 'النشرات الإرشادية',
      titleEn: 'Extension Bulletins',
      descAr: 'نشرات إرشادية موجهة للمزارعين والتقنيين الزراعيين.',
      descEn: 'Extension bulletins targeted at farmers and agricultural technicians.',
    },
  ]

  return (
    <>
      <PageHeader
        title={dict.nav.library}
        subtitle={isAr ? 'المكتبة الرقمية للهيئة العامة للبحوث العلمية الزراعية' : 'Digital Library of the General Commission for Scientific Agricultural Research'}
      />
      <section className="gov-section">
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2">
            {sections.map(({ href, Icon, titleAr, titleEn, descAr, descEn }) => (
              <Link key={href} href={href} className="gov-card-interactive flex items-start gap-4 p-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{isAr ? titleAr : titleEn}</p>
                  <p className="mt-1 text-fluid-sm text-ink-muted">{isAr ? descAr : descEn}</p>
                </div>
                <ArrowEnd className="mt-1 size-4 shrink-0 text-ink-subtle" aria-hidden />
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-secondary-200 bg-secondary-50/50 p-6">
            <p className="text-fluid-sm text-secondary-800">
              {isAr
                ? 'للاطلاع على قاعدة البيانات العلمية AGORA وباقي الموارد الرقمية، تواصل مع قسم المكتبة على البريد الإلكتروني: '
                : 'For access to the AGORA scientific database and other digital resources, contact the Library Division at: '}
              <a href="mailto:gcsar.e.library@gmail.com" className="font-medium text-secondary-700 underline hover:no-underline">
                gcsar.e.library@gmail.com
              </a>
              {isAr ? ' أو هاتف: ' : ' or phone: '}
              <a href="tel:+963112270136" className="font-medium text-secondary-700" dir="ltr">
                +963 11 2270136
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
