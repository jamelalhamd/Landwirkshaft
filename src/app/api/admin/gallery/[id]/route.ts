import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const UpdateSchema = z.object({
  type: z.enum(['image', 'video']).optional(),
  title_ar: z.string().min(1).optional(),
  title_en: z.string().min(1).optional(),
  album: z.string().nullable().optional(),
  url: z.string().optional(),
  thumbnail_url: z.string().nullable().optional(),
  taken_at: z.string().nullable().optional(),
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
  const docRef = adminDb().collection('media').doc(id)
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
    resourceType: 'media',
    resourceId: id,
    metadata: { fields: Object.keys(parse.data) },
    request,
  })

  revalidateContent('gallery')
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
  await adminDb().collection('media').doc(id).delete()

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'delete',
    resourceType: 'media',
    resourceId: id,
    request,
  })

  revalidateContent('gallery')
  return NextResponse.json({ ok: true })
}
