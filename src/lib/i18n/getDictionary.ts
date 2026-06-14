import 'server-only'
import type { Locale } from './config'

type Dictionary = typeof import('./dictionaries/ar.json')

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import('./dictionaries/ar.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const loader = loaders[locale] ?? loaders.ar
  return loader()
}

export type { Dictionary }
