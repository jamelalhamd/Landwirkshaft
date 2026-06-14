import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Clock, Facebook, Youtube } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

interface Props {
  locale: Locale
  dict: Dictionary
}

const NAV_LINKS = [
  'about', 'staff', 'news', 'documents', 'research', 'gallery', 'contact',
] as const

const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/',
    Icon: Facebook,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/',
    Icon: Youtube,
  },
] as const

export function Footer({ locale, dict }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-primary-950 text-slate-300">
      {/* Decorative accent border */}
      <div
        className="h-1 bg-gradient-to-r from-primary-700 via-secondary-500 to-primary-700"
        aria-hidden
      />

      {/* Main content grid */}
      <div className="container grid gap-10 py-14 md:grid-cols-12">
        {/* ── Brand & About ───────────────────────────────── */}
        <div className="md:col-span-5">
          <Link
            href={`/${locale}`}
            className="group mb-5 flex items-center gap-3"
            aria-label={dict.meta.siteName}
          >
            <Image
              src="/logos/syria-eagle.svg"
              alt={dict.meta.country}
              width={56}
              height={56}
              style={{ width: 56, height: 56 }}
              className="transition-transform duration-300 group-hover:scale-105 drop-shadow"
            />
            <div className="h-12 w-px bg-white/15" aria-hidden />
            <Image
              src="/logos/gcsar-logo.svg"
              alt=""
              width={48}
              height={48}
              style={{ width: 48, height: 48 }}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <p className="mb-1 text-sm font-bold text-white">{dict.meta.siteName}</p>
          <p className="mb-5 text-xs text-slate-500">{dict.meta.country}</p>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            {dict.footer.about}
          </p>
        </div>

        {/* ── Quick links ─────────────────────────────────── */}
        <div className="md:col-span-3">
          <h3 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-secondary-400">
            {dict.footer.quickLinks}
          </h3>
          <ul className="space-y-3">
            {NAV_LINKS.map((k) => (
              <li key={k}>
                <Link
                  href={`/${locale}/${k}`}
                  className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-secondary-600 transition-colors group-hover:bg-secondary-400"
                    aria-hidden
                  />
                  {dict.nav[k]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact & Social ────────────────────────────── */}
        <div className="md:col-span-4">
          <h3 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-secondary-400">
            {dict.footer.contactUs}
          </h3>

          <ul className="space-y-3.5">
            <li className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-secondary-500"
                aria-hidden
              />
              <span>{dict.footer.address}</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-400">
              <Clock
                className="mt-0.5 size-4 shrink-0 text-secondary-500"
                aria-hidden
              />
              <span>{dict.footer.workingHours}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 shrink-0 text-secondary-500" aria-hidden />
              <a
                href="tel:+96311XXXXXXX"
                className="text-sm text-slate-400 transition-colors hover:text-white"
                dir="ltr"
              >
                +963 11 XXX XXXX
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-4 shrink-0 text-secondary-500" aria-hidden />
              <a
                href="mailto:info@gcsar.gov.sy"
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                info@gcsar.gov.sy
              </a>
            </li>
          </ul>

          {/* Social links */}
          <div className="mt-7">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              {dict.footer.follow}
            </p>
            <div className="flex gap-2">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all duration-200 hover:border-secondary-500 hover:bg-secondary-600 hover:text-white focus-visible:outline focus-visible:outline-secondary-400"
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-white/[0.07]">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-slate-600 sm:flex-row">
          <span>
            © {year}&nbsp;{dict.meta.siteName}.&nbsp;{dict.footer.rights}.
          </span>
          <div className="flex gap-5">
            <Link
              href={`/${locale}/privacy`}
              className="transition-colors hover:text-slate-300"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="transition-colors hover:text-slate-300"
            >
              {dict.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
