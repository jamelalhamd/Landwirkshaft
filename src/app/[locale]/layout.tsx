import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { i18n, isLocale, localeMeta } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AccessibilityProvider } from '@/components/layout/AccessibilityProvider'
import { getSiteSettings } from '@/lib/data/getSiteSettings'

export const dynamicParams = false

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = await getDictionary(locale)
  return {
    title: { default: dict.meta.siteName, template: `%s — ${dict.meta.siteShort}` },
    description: dict.meta.tagline,
    openGraph: {
      title: dict.meta.siteName,
      description: dict.meta.tagline,
      locale: localeMeta[locale].htmlLang,
      siteName: dict.meta.siteName,
      type: 'website',
    },
    alternates: {
      languages: {
        ar: '/ar',
        en: '/en',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = await getDictionary(locale)
  const meta = localeMeta[locale]

  const siteSettings = await getSiteSettings({
    siteName:    dict.meta.siteName,
    tagline:     dict.meta.tagline,
    heroTitle:   dict.home.hero.title,
    heroSubtitle: dict.home.hero.subtitle,
    heroEyebrow: dict.home.hero.eyebrow,
  })

  return (
    <html lang={meta.htmlLang} dir={meta.dir} suppressHydrationWarning>
      <body className="font-sans">
        <a href="#main" className="sr-only-focusable absolute start-2 top-2 z-50 rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white">
          {dict.common.skipToContent}
        </a>
        <AccessibilityProvider>
          <Header locale={locale} dict={dict} siteSettings={siteSettings} />
          <main id="main" className="min-h-[calc(100dvh-4rem)]">
            {children}
          </main>
          <Footer locale={locale} dict={dict} />
        </AccessibilityProvider>
      </body>
    </html>
  )
}
