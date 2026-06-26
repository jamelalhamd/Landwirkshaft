import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

const UpdateSchema = z.object({
  title_ar: z.string().min(1).optional(),
  title_en: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  excerpt_ar: z.string().optional(),
  excerpt_en: z.string().optional(),
  body_ar: z.string().optional(),
  body_en: z.string().optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
  is_breaking: z.boolean().optional(),
  publish_at: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  cover_image_url: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
})

// PUT /api/admin/news/[id] — Artikel aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { id } = await params
  const docRef = adminDb().collection('news').doc(id)
  const doc = await docRef.get()
  if (!doc.exists) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  // Redakteure dürfen nur eigene Artikel bearbeiten
  const docData = doc.data() ?? {}
  if (!session.roleAtLeast('admin') && docData['author_id'] !== session.profile!.uid) {
    return NextResponse.json({ error: 'Kein Zugriff auf fremde Artikel' }, { status: 403 })
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

  // Redakteure können nicht auf "published" setzen
  if (data.status === 'published' && !session.roleAtLeast('admin')) {
    data.status = 'review'
  }

  await docRef.update({ ...data, updated_at: new Date().toISOString() })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'news',
    resourceId: id,
    metadata: { fields: Object.keys(data) },
    request,
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/news/[id] — Artikel löschen (nur admin+)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin-Berechtigung erforderlich' }, { status: 403 })
  }

  const { id } = await params
  await adminDb().collection('news').doc(id).delete()

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'delete',
    resourceType: 'news',
    resourceId: id,
    request,
  })

  return NextResponse.json({ ok: true })
}
