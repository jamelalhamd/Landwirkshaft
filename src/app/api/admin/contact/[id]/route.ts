import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

const UpdateSchema = z.object({
  status: z.enum(['new', 'in_review', 'replied', 'closed']),
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
  const docRef = adminDb().collection('contact_messages').doc(id)
  const doc = await docRef.get()
  if (!doc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json() as unknown
  const parse = UpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', issues: parse.error.issues }, { status: 400 })
  }

  await docRef.update({ status: parse.data.status, updated_at: new Date().toISOString() })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'contact_messages',
    resourceId: id,
    metadata: { status: parse.data.status },
    request,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('super_admin')) {
    return NextResponse.json({ error: 'Super admin role required' }, { status: 403 })
  }

  const { id } = await params
  await adminDb().collection('contact_messages').doc(id).delete()

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'delete',
    resourceType: 'contact_messages',
    resourceId: id,
    request,
  })

  return NextResponse.json({ ok: true })
}
