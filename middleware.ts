import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n, isLocale } from './src/lib/i18n/config'

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const preferred = acceptLanguage
    .split(',')
    .map((seg) => seg.split(';')[0].trim().toLowerCase().split('-')[0])
  for (const lang of preferred) {
    if ((i18n.locales as readonly string[]).includes(lang)) return lang
  }
  return i18n.defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static + api + next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/logos') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next()
  }

  const hasLocale = i18n.locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )

  if (hasLocale) {
    const locale = pathname.split('/')[1]
    if (locale && isLocale(locale)) {
      const response = NextResponse.next()
      response.cookies.set('NEXT_LOCALE', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
      return response
    }
  }

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : getLocale(request)

  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
