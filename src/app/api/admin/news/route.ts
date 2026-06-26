import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

const CreateSchema = z.object({
  title_ar: z.string().min(1, 'Pflichtfeld'),
  title_en: z.string().min(1, 'Pflichtfeld'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche'),
  excerpt_ar: z.string().min(1, 'Pflichtfeld'),
  excerpt_en: z.string().min(1, 'Pflichtfeld'),
  body_ar: z.string().min(1, 'Pflichtfeld'),
  body_en: z.string().min(1, 'Pflichtfeld'),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
  is_breaking: z.boolean().default(false),
  publish_at: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  cover_image_url: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
})

// GET /api/admin/news — alle Artikel zurückgeben (inkl. Entwürfe)
export async function GET(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  let query = adminDb()
    .collection('news')
    .orderBy('created_at', 'desc') as FirebaseFirestore.Query

  if (statusFilter) {
    query = adminDb()
      .collection('news')
      .where('status', '==', statusFilter)
      .orderBy('created_at', 'desc')
  }

  const snap = await query.limit(200).get()
  const articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(articles)
}

// POST /api/admin/news — neuen Artikel erstellen
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

  // Redakteure (editor) können nicht direkt auf "published" setzen
  if (data.status === 'published' && !session.roleAtLeast('admin')) {
    data.status = 'review'
  }

  // Slug-Eindeutigkeit prüfen
  const existing = await adminDb()
    .collection('news')
    .where('slug', '==', data.slug)
    .limit(1)
    .get()
  if (!existing.empty) {
    return NextResponse.json({ error: 'Slug bereits vergeben' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const docRef = await adminDb()
    .collection('news')
    .add({ ...data, author_id: session.profile!.uid, created_at: now, updated_at: now })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'create',
    resourceType: 'news',
    resourceId: docRef.id,
    metadata: { title_ar: data.title_ar, slug: data.slug },
    request,
  })

  return NextResponse.json({ id: docRef.id }, { status: 201 })
}
