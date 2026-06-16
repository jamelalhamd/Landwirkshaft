import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ExternalLink } from 'lucide-react'

export const revalidate = 600

const CONFERENCES = [
  { number: 14, year: 2024, slug: 'program-of-the-14-scientific-conference', titleAr: 'المؤتمر العلمي الرابع عشر للبحوث العلمية الزراعية', titleEn: '14th Scientific Conference for Agricultural Research', href: 'https://gcsar.gov.sy/program-of-the-14-scientific-conference/' },
  { number: 12, year: 2022, slug: 'exhibition12', titleAr: 'المؤتمر العلمي الثاني عشر', titleEn: '12th Scientific Conference', href: 'https://gcsar.gov.sy/exhibition12/' },
  { number: 11, year: 2016, slug: '11conf-2016', titleAr: 'المؤتمر العلمي الحادي عشر', titleEn: '11th Scientific Conference', href: 'http://gcsar.gov.sy/11conf-2016/' },
  { number: 10, year: 2014, slug: 'conf10', titleAr: 'المؤتمر العلمي العاشر', titleEn: '10th Scientific Conference', href: 'https://gcsar.gov.sy/scientificactivities/confworkshops/conf10/' },
  { number: 9,  year: 2012, slug: 'conf9',  titleAr: 'المؤتمر العلمي التاسع',  titleEn: '9th Scientific Conference',  href: 'https://gcsar.gov.sy/scientificactivities/confworkshops/conf9/' },
]

export default async function ConferencesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <>
      <PageHeader
        title={dict.nav.conferences}
        subtitle={isAr ? 'أرشيف المؤتمرات العلمية للهيئة' : 'Archive of GCSAR Scientific Conferences'}
      />
      <section className="gov-section">
        <div className="container max-w-3xl">
          <div className="space-y-4">
            {CONFERENCES.map((c) => (
              <a
                key={c.number}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="gov-card-interactive flex items-center gap-4 p-5"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-sm font-black text-white">
                  {c.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{isAr ? c.titleAr : c.titleEn}</p>
                  <p className="text-fluid-sm text-ink-muted">{c.year}</p>
                </div>
                <ExternalLink className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
