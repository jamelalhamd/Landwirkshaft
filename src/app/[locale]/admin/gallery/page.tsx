import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { GalleryAdminClient } from './GalleryAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage({
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
      .collection('media')
      .orderBy('created_at', 'desc')
      .limit(200)
      .get()
    initialItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // Firestore not yet configured
  }

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
        {isAr ? 'معرض الوسائط' : 'Media Gallery'}
      </h1>
      <p className="mb-6 text-fluid-sm text-ink-muted">
        {isAr
          ? 'إدارة الصور والفيديوهات — الرابط يُضاف من مكتبة الملفات أعلاه.'
          : 'Manage gallery items. Copy the URL from the Media Library, then register it here.'}
      </p>
      <GalleryAdminClient
        locale={locale}
        role={session.profile!.role}
        initialItems={initialItems}
      />
    </div>
  )
}
