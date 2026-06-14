import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Clock, Facebook } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

interface Props {
  locale: Locale
  dict: Dictionary
}

const QUICK = ['about', 'staff', 'news', 'documents', 'research', 'gallery', 'contact'] as const

export function Footer({ locale, dict }: Props) {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-border bg-primary-950 text-slate-200">
      <div className="container grid gap-10 py-12 md:grid-cols-12">
        {/* About + logos */}
        <div className="md:col-span-5">
          <div className="mb-4 flex items-center gap-3">
            <Image src="/logos/gcsar-logo.svg" alt="" width={44} height={44} className="size-11" />
            <Image src="/logos/syria-eagle.svg" alt="" width={44} height={44} className="size-11" />
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">{dict.meta.siteName}</div>
              <div className="text-xs text-slate-400">{dict.meta.country}</div>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed text-pretty">{dict.footer.about}</p>
        </div>

        {/* Quick links */}
        <div className="md:col-span-3">
          <h4 className="mb-4 text-sm font-bold text-white">{dict.footer.quickLinks}</h4>
          <ul className="space-y-2 text-sm">
            {QUICK.map((k) => (
              <li key={k}>
                <Link href={`/${locale}/${k}`} className="text-slate-300 hover:text-white">
                  {dict.nav[k]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="md:col-span-4">
          <h4 className="mb-4 text-sm font-bold text-white">{dict.footer.contactUs}</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-secondary-400" aria-hidden />
              <span>{dict.footer.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 text-secondary-400" aria-hidden />
              <span>{dict.footer.workingHours}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-secondary-400" aria-hidden />
              <a href="tel:+96311XXXXXXX" className="hover:text-white">+963 11 XXX XXXX</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-secondary-400" aria-hidden />
              <a href="mailto:info@gcsar.gov.sy" className="hover:text-white">info@gcsar.gov.sy</a>
            </li>
          </ul>

          <div className="mt-5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{dict.footer.follow}</span>
            <div className="mt-2 flex gap-2">
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10"
              >
                <Facebook className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-slate-400 md:flex-row">
          <span>© {year} {dict.meta.siteName}. {dict.footer.rights}.</span>
          <div className="flex gap-4">
            <Link href={`/${locale}/privacy`} className="hover:text-white">{dict.footer.privacy}</Link>
            <Link href={`/${locale}/terms`}   className="hover:text-white">{dict.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
