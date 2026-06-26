import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

const UpdateSchema = z.object({
  title_ar: z.string().min(1).optional(),
  title_en: z.string().min(1).optional(),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  category: z.string().optional(),
  file_url: z.string().min(1).optional(),
  file_size_bytes: z.number().int().nonnegative().optional(),
  page_count: z.number().int().positive().nullable().optional(),
  issued_at: z.string().optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
})

// PUT /api/admin/documents/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { id } = await params
  const docRef = adminDb().collection('documents').doc(id)
  const doc = await docRef.get()
  if (!doc.exists) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  const body = await request.json() as unknown
  const parse = UpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Validierungsfehler', issues: parse.error.issues },
      { status: 400 },
    )
  }

  const data = parse.data
  if (data.status === 'published' && !session.roleAtLeast('admin')) {
    data.status = 'review'
  }

  await docRef.update({ ...data, updated_at: new Date().toISOString() })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'documents',
    resourceId: id,
    metadata: { fields: Object.keys(data) },
    request,
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/documents/[id] — nur admin+
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin-Berechtigung erforderlich' }, { status: 403 })
  }

  const { id } = await params
  await adminDb().collection('documents').doc(id).delete()

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'delete',
    resourceType: 'documents',
    resourceId: id,
    request,
  })

  return NextResponse.json({ ok: true })
}
