import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { getRepository } from '@/lib/data/repository'
import { formatDate } from '@/lib/utils'
import { Calendar } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

export const revalidate = 120

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  await getDictionary(locale)
  const repo = await getRepository()
  const article = await repo.getNewsBySlug(slug)
  if (!article) notFound()

  return (
    <>
      <PageHeader title={locale === 'ar' ? article.title_ar : article.title_en} />
      <article className="gov-section">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center gap-2 text-fluid-sm text-ink-subtle">
            <Calendar className="size-4" aria-hidden />
            <time dateTime={article.publish_at ?? ''}>
              {article.publish_at ? formatDate(article.publish_at, locale) : ''}
            </time>
          </div>
          <div className="prose prose-slate max-w-none text-ink-muted">
            <p className="text-fluid-base text-ink">
              {locale === 'ar' ? article.excerpt_ar : article.excerpt_en}
            </p>
            <p>{locale === 'ar' ? article.body_ar : article.body_en}</p>
          </div>
        </div>
      </article>
    </>
  )
}
