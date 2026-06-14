import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { Hero } from '@/components/home/Hero'
import { NewsTicker } from '@/components/home/NewsTicker'
import { QuickServices } from '@/components/home/QuickServices'
import { Statistics } from '@/components/home/Statistics'
import { LatestNews } from '@/components/home/LatestNews'
import { Pillars } from '@/components/home/Pillars'

export const revalidate = 300 // ISR — 5 min

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <NewsTicker locale={locale} dict={dict} />
      <QuickServices locale={locale} dict={dict} />
      <Statistics locale={locale} dict={dict} />
      <LatestNews locale={locale} dict={dict} />
      <Pillars locale={locale} dict={dict} />
    </>
  )
}
