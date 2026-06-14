export const i18n = {
  defaultLocale: 'ar',
  locales: ['ar', 'en'],
} as const

export type Locale = (typeof i18n)['locales'][number]

export const localeMeta: Record<Locale, { name: string; nativeName: string; dir: 'rtl' | 'ltr'; htmlLang: string }> = {
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl', htmlLang: 'ar-SY' },
  en: { name: 'English', nativeName: 'English', dir: 'ltr', htmlLang: 'en-US' },
}

export function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value)
}
