import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { getRepository } from '@/lib/data/repository'
import { formatDate } from '@/lib/utils'
import { FileText, Download } from 'lucide-react'

export const revalidate = 600

export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const repo = await getRepository()
  const docs = await repo.listDocuments()

  return (
    <>
      <PageHeader title={dict.nav.documents} />
      <section className="gov-section">
        <div className="container">
          <ul className="grid gap-4 md:grid-cols-2">
            {docs.map((d) => (
              <li key={d.id} className="gov-card p-5">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
                    <FileText className="size-5" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <span className="gov-chip">{d.category}</span>
                    <h3 className="mt-2 font-bold text-ink">{locale === 'ar' ? d.title_ar : d.title_en}</h3>
                    <p className="mt-1 text-fluid-xs text-ink-subtle">
                      {formatDate(d.issued_at, locale)} · {(d.file_size_bytes / 1024 / 1024).toFixed(1)} MB
                      {d.page_count ? ` · ${d.page_count} ${locale === 'ar' ? 'صفحات' : 'pages'}` : ''}
                    </p>
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="btn-outline mt-3 text-fluid-xs">
                      <Download className="size-3.5" aria-hidden />
                      {locale === 'ar' ? 'تحميل' : 'Download'}
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
