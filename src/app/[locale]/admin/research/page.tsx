import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { ResearchAdminClient } from './ResearchAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await getSession()
  const isAr = locale === 'ar'

  let initialItems: Record<string, unknown>[] = []
  try {
    const snap = await adminDb()
      .collection('research')
      .orderBy('year', 'desc')
      .limit(100)
      .get()
    initialItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // Firestore not yet configured
  }

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
        {isAr ? 'إدارة الأبحاث' : 'Research Papers'}
      </h1>
      <p className="mb-6 text-fluid-sm text-ink-muted">
        {isAr
          ? 'إضافة الأبحاث العلمية وتحريرها وحذفها.'
          : 'Add, edit, and delete research papers.'}
      </p>
      <ResearchAdminClient
        locale={locale}
        role={session.profile!.role}
        initialItems={initialItems}
      />
    </div>
  )
}
