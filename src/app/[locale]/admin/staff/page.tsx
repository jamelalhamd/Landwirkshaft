import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n/config'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { StaffAdminClient } from './StaffAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminStaffPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await getSession()
  const isAr = locale === 'ar'

  let initialStaff: Record<string, unknown>[] = []
  let initialDepartments: Record<string, unknown>[] = []
  try {
    const [staffSnap, deptSnap] = await Promise.all([
      adminDb().collection('staff').orderBy('display_order').limit(500).get(),
      adminDb().collection('departments').orderBy('name_ar').get(),
    ])
    initialStaff = staffSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    initialDepartments = deptSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // Firestore not yet configured
  }

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">
        {isAr ? 'دليل الموظفين' : 'Staff Directory'}
      </h1>
      <p className="mb-6 text-fluid-sm text-ink-muted">
        {isAr
          ? 'إدارة بيانات الموظفين والأقسام.'
          : 'Manage staff members and departments.'}
      </p>
      <StaffAdminClient
        locale={locale}
        role={session.profile!.role}
        initialStaff={initialStaff}
        initialDepartments={initialDepartments}
      />
    </div>
  )
}
