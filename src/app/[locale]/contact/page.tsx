import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContactForm } from './ContactForm'

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)

  return (
    <>
      <PageHeader title={dict.nav.contact} subtitle={dict.footer.workingHours} />
      <section className="gov-section">
        <div className="container grid gap-8 lg:grid-cols-[2fr_1fr]">
          <ContactForm locale={locale} />
          <aside className="gov-card p-5 text-fluid-sm text-ink-muted">
            <h3 className="text-fluid-base font-bold text-ink">{dict.footer.contactUs}</h3>
            <ul className="mt-3 space-y-2">
              <li>{dict.footer.address}</li>
              <li>{dict.footer.workingHours}</li>
              <li><a href="mailto:info@gcsar.gov.sy" className="hover:text-ink">info@gcsar.gov.sy</a></li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  )
}
