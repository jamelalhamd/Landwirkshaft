import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { listFiles } from '@/lib/firebase/storage-utils'
import { MediaManager } from '@/components/admin/MediaManager'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await getSession()
  const isAr = locale === 'ar'
  const storageReady = !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  let initialFiles: Awaited<ReturnType<typeof listFiles>> = []
  if (storageReady) {
    try {
      initialFiles = await listFiles('media')
    } catch {
      // Storage not yet configured or bucket empty — fall through to empty state
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
        {isAr ? 'مكتبة الملفات' : 'Media Library'}
      </h1>
      <p className="mb-6 text-fluid-sm text-ink-muted">
        {isAr
          ? 'رفع وإدارة ملفات الموقع — صور، وثائق PDF، وفيديو.'
          : 'Upload and manage site files — images, PDFs, and video.'}
      </p>

      {!storageReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-amber-900">
            {isAr ? 'Firebase Storage غير مُفعَّل' : 'Firebase Storage not configured'}
          </h2>
          <p className="mt-1 text-fluid-sm text-amber-800">
            {isAr
              ? 'أضف NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET إلى ملف .env.local ثم أعد تشغيل الخادم.'
              : 'Add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET to .env.local and restart the server.'}
          </p>
          <ol className="mt-3 list-decimal ps-5 text-fluid-sm text-amber-800 [&>li]:mt-1">
            <li>
              {isAr
                ? 'افتح Firebase Console → Storage → ابدأ'
                : 'Open Firebase Console → Storage → Get started'}
            </li>
            <li>
              {isAr
                ? 'انسخ اسم الحزمة (مثل: my-project.appspot.com) إلى NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
                : 'Copy the bucket name (e.g. my-project.appspot.com) to NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'}
            </li>
            <li>
              {isAr
                ? 'انشر قواعد التخزين: firebase deploy --only storage'
                : 'Deploy storage rules: firebase deploy --only storage'}
            </li>
          </ol>
        </div>
      ) : (
        <MediaManager
          locale={locale}
          initialFiles={initialFiles}
          role={session.profile!.role}
        />
      )}
    </div>
  )
}
