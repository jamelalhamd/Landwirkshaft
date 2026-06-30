import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const UpdateSchema = z.object({
  full_name_ar: z.string().min(1).optional(),
  full_name_en: z.string().min(1).optional(),
  position_ar: z.string().optional(),
  position_en: z.string().optional(),
  department_id: z.string().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  office: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  bio_ar: z.string().nullable().optional(),
  bio_en: z.string().nullable().optional(),
  display_order: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
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
  const docRef = adminDb().collection('staff').doc(id)
  const doc = await docRef.get()
  if (!doc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json() as unknown
  const parse = UpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', issues: parse.error.issues }, { status: 400 })
  }

  await docRef.update({ ...parse.data, updated_at: new Date().toISOString() })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'staff',
    resourceId: id,
    metadata: { fields: Object.keys(parse.data) },
    request,
  })

  revalidateContent('staff')
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
  await adminDb().collection('staff').doc(id).delete()

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'delete',
    resourceType: 'staff',
    resourceId: id,
    request,
  })

  revalidateContent('staff')
  return NextResponse.json({ ok: true })
}
