import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const UpdateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  name_ar: z.string().min(1).optional(),
  name_en: z.string().min(1).optional(),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  parent_id: z.string().nullable().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 })
  }

  const { id } = await params
  const docRef = adminDb().collection('departments').doc(id)
  const doc = await docRef.get()
  if (!doc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json() as unknown
  const parse = UpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', issues: parse.error.issues }, { status: 400 })
  }

  await docRef.update(parse.data)

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'departments',
    resourceId: id,
    metadata: { fields: Object.keys(parse.data) },
    request,
  })

  revalidateContent('departments')
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 })
  }

  const { id } = await params

  // Block deletion if staff members still reference this department
  const staffSnap = await adminDb()
    .collection('staff')
    .where('department_id', '==', id)
    .limit(1)
    .get()
  if (!staffSnap.empty) {
    return NextResponse.json(
      { error: 'Cannot delete: department has assigned staff members' },
      { status: 409 },
    )
  }

  await adminDb().collection('departments').doc(id).delete()

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'delete',
    resourceType: 'departments',
    resourceId: id,
    request,
  })

  revalidateContent('departments')
  return NextResponse.json({ ok: true })
}
