import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const CreateSchema = z.object({
  full_name_ar: z.string().min(1),
  full_name_en: z.string().min(1),
  position_ar: z.string().min(1),
  position_en: z.string().min(1),
  department_id: z.string().optional().default(''),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  office: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  bio_ar: z.string().nullable().optional(),
  bio_en: z.string().nullable().optional(),
  display_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
})

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const deptFilter = searchParams.get('department_id')

  let query = adminDb()
    .collection('staff')
    .orderBy('display_order') as FirebaseFirestore.Query

  if (deptFilter) {
    query = adminDb()
      .collection('staff')
      .where('department_id', '==', deptFilter)
      .orderBy('display_order')
  }

  const snap = await query.limit(500).get()
  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 })
  }

  const body = await request.json() as unknown
  const parse = CreateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', issues: parse.error.issues }, { status: 400 })
  }

  const now = new Date().toISOString()
  const docRef = await adminDb()
    .collection('staff')
    .add({ ...parse.data, created_at: now, updated_at: now })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'create',
    resourceType: 'staff',
    resourceId: docRef.id,
    metadata: { full_name_ar: parse.data.full_name_ar },
    request,
  })

  revalidateContent('staff')
  return NextResponse.json({ id: docRef.id }, { status: 201 })
}
