import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { NewsAdminClient } from './NewsAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await getSession()
  const isAr = locale === 'ar'

  // Artikel serverseitig vorladen
  let initialArticles: Record<string, unknown>[] = []
  try {
    const snap = await adminDb()
      .collection('news')
      .orderBy('created_at', 'desc')
      .limit(100)
      .get()
    initialArticles = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // Firestore noch nicht konfiguriert — leere Liste anzeigen
  }

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
        {isAr ? 'إدارة الأخبار' : 'News verwalten'}
      </h1>
      <p className="mb-6 text-fluid-sm text-ink-muted">
        {isAr
          ? 'إنشاء الأخبار وتحريرها وحذفها حسب الصلاحيات.'
          : 'Nachrichten erstellen, bearbeiten und löschen (rollenbasiert).'}
      </p>
      <NewsAdminClient
        locale={locale}
        role={session.profile!.role}
        initialArticles={initialArticles}
      />
    </div>
  )
}
