import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { getRepository } from '@/lib/data/repository'
import { Image as ImageIcon } from 'lucide-react'

export const revalidate = 600

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const repo = await getRepository()
  const items = await repo.listMedia()

  return (
    <>
      <PageHeader title={dict.nav.gallery} />
      <section className="gov-section">
        <div className="container">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <li key={m.id} className="gov-card overflow-hidden">
                <div className="grid aspect-video place-items-center bg-gradient-to-br from-primary-200 to-primary-400 text-white/80">
                  <ImageIcon className="size-12" aria-hidden />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-ink">{locale === 'ar' ? m.title_ar : m.title_en}</h3>
                  {m.album && <p className="text-fluid-xs text-ink-subtle">{m.album}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
