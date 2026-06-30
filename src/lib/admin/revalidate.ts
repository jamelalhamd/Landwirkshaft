import { revalidatePath } from 'next/cache'

const LOCALES = ['ar', 'en'] as const

/**
 * Call this after every admin mutation so ISR pages show the new data
 * on the very next page refresh — without waiting for the revalidate timer.
 *
 * @param type   The Firestore collection that changed
 * @param slug   For news: the article slug so the detail page is also purged
 */
export function revalidateContent(
  type: 'news' | 'documents' | 'research' | 'staff' | 'gallery' | 'site_stats' | 'departments',
  slug?: string,
) {
  for (const locale of LOCALES) {
    switch (type) {
      case 'news':
        revalidatePath(`/${locale}`)           // home shows breaking news + latest news
        revalidatePath(`/${locale}/news`)
        if (slug) revalidatePath(`/${locale}/news/${slug}`)
        break

      case 'documents':
        revalidatePath(`/${locale}/documents`)
        break

      case 'research':
        revalidatePath(`/${locale}/research`)
        break

      case 'staff':
      case 'departments':
        revalidatePath(`/${locale}/staff`)
        break

      case 'gallery':
        revalidatePath(`/${locale}/gallery`)
        break

      case 'site_stats':
        revalidatePath(`/${locale}`)           // home shows stats counters
        break
    }
  }
}
