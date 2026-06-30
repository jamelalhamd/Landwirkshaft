import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const CreateSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const snap = await adminDb().collection('departments').orderBy('name_ar').get()
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

  const existing = await adminDb()
    .collection('departments')
    .where('slug', '==', parse.data.slug)
    .limit(1)
    .get()
  if (!existing.empty) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const docRef = await adminDb()
    .collection('departments')
    .add({ ...parse.data, created_at: now })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'create',
    resourceType: 'departments',
    resourceId: docRef.id,
    metadata: { name_ar: parse.data.name_ar },
    request,
  })

  revalidateContent('departments')
  return NextResponse.json({ id: docRef.id }, { status: 201 })
}
