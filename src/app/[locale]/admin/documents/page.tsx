import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { DocumentsAdminClient } from './DocumentsAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminDocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await getSession()
  const isAr = locale === 'ar'

  let initialDocs: Record<string, unknown>[] = []
  try {
    const snap = await adminDb()
      .collection('documents')
      .orderBy('issued_at', 'desc')
      .limit(100)
      .get()
    initialDocs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // Firestore noch nicht konfiguriert
  }

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
        {isAr ? 'إدارة الوثائق' : 'Dokumente verwalten'}
      </h1>
      <p className="mb-6 text-fluid-sm text-ink-muted">
        {isAr
          ? 'إضافة الوثائق الرسمية وتحريرها وحذفها.'
          : 'Offizielle Dokumente hinzufügen, bearbeiten und löschen.'}
      </p>
      <DocumentsAdminClient
        locale={locale}
        role={session.profile!.role}
        initialDocs={initialDocs}
      />
    </div>
  )
}
