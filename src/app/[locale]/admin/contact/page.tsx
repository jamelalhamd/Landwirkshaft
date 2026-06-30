import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { ContactAdminClient } from './ContactAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await getSession()
  const isAr = locale === 'ar'

  let initialMessages: Record<string, unknown>[] = []
  try {
    const snap = await adminDb()
      .collection('contact_messages')
      .orderBy('created_at', 'desc')
      .limit(200)
      .get()
    initialMessages = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // Firestore not yet configured
  }

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
        {isAr ? 'الرسائل الواردة' : 'Contact Messages'}
      </h1>
      <p className="mb-6 text-fluid-sm text-ink-muted">
        {isAr
          ? 'عرض رسائل التواصل وتحديث حالتها.'
          : 'View incoming contact messages and update their status.'}
      </p>
      <ContactAdminClient
        locale={locale}
        role={session.profile!.role}
        initialMessages={initialMessages}
      />
    </div>
  )
}
