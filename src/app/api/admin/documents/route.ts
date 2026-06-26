import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

const CreateSchema = z.object({
  title_ar: z.string().min(1, 'Pflichtfeld'),
  title_en: z.string().min(1, 'Pflichtfeld'),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  category: z.string().min(1, 'Pflichtfeld'),
  file_url: z.string().min(1, 'Pflichtfeld'),
  file_size_bytes: z.number().int().nonnegative().default(0),
  page_count: z.number().int().positive().nullable().optional(),
  issued_at: z.string().min(1, 'Pflichtfeld'),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
})

// GET /api/admin/documents — alle Dokumente zurückgeben
export async function GET(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  let query = adminDb()
    .collection('documents')
    .orderBy('issued_at', 'desc') as FirebaseFirestore.Query

  if (statusFilter) {
    query = adminDb()
      .collection('documents')
      .where('status', '==', statusFilter)
      .orderBy('issued_at', 'desc')
  }

  const snap = await query.limit(200).get()
  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
}

// POST /api/admin/documents — neues Dokument erstellen
export async function POST(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const body = await request.json() as unknown
  const parse = CreateSchema.safeParse(body)
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

  const now = new Date().toISOString()
  const docRef = await adminDb()
    .collection('documents')
    .add({ ...data, created_by: session.profile!.uid, created_at: now, updated_at: now })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'create',
    resourceType: 'documents',
    resourceId: docRef.id,
    metadata: { title_ar: data.title_ar },
    request,
  })

  return NextResponse.json({ id: docRef.id }, { status: 201 })
}
