import 'server-only'
import { cache } from 'react'

export interface SiteSettings {
  site_name_ar: string
  site_name_en: string
  tagline_ar: string
  tagline_en: string
  logo_url: string | null
  logo2_url: string | null
  hero_title_ar: string
  hero_title_en: string
  hero_subtitle_ar: string
  hero_subtitle_en: string
  hero_eyebrow_ar: string
  hero_eyebrow_en: string
}

// Rohe Firestore-Daten — werden einmal pro Request gecacht (React cache)
const fetchRaw = cache(async (): Promise<Record<string, unknown>> => {
  try {
    const { adminDb } = await import('@/lib/firebase/admin')
    const doc = await adminDb().collection('site_settings').doc('main').get()
    return doc.exists ? (doc.data() ?? {}) : {}
  } catch {
    // Firestore nicht konfiguriert — leeres Objekt zurückgeben
    return {}
  }
})

// Gibt Einstellungen aus Firestore zurück, fällt auf Standardwerte zurück.
// Die Funktion schlägt niemals fehl — fehlende Felder werden durch Fallbacks gefüllt.
export async function getSiteSettings(defaults: {
  siteName: string
  tagline: string
  heroTitle: string
  heroSubtitle: string
  heroEyebrow: string
}): Promise<SiteSettings> {
  const data = await fetchRaw()

  function str(key: string, fallback: string): string {
    const v = data[key]
    return typeof v === 'string' && v.trim() !== '' ? v : fallback
  }

  return {
    site_name_ar:     str('site_name_ar',     defaults.siteName),
    site_name_en:     str('site_name_en',     defaults.siteName),
    tagline_ar:       str('tagline_ar',       defaults.tagline),
    tagline_en:       str('tagline_en',       defaults.tagline),
    logo_url:         typeof data['logo_url']  === 'string' ? data['logo_url']  : null,
    logo2_url:        typeof data['logo2_url'] === 'string' ? data['logo2_url'] : null,
    hero_title_ar:    str('hero_title_ar',    defaults.heroTitle),
    hero_title_en:    str('hero_title_en',    defaults.heroTitle),
    hero_subtitle_ar: str('hero_subtitle_ar', defaults.heroSubtitle),
    hero_subtitle_en: str('hero_subtitle_en', defaults.heroSubtitle),
    hero_eyebrow_ar:  str('hero_eyebrow_ar',  defaults.heroEyebrow),
    hero_eyebrow_en:  str('hero_eyebrow_en',  defaults.heroEyebrow),
  }
}
