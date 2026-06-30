import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const CreateSchema = z.object({
  type: z.enum(['image', 'video']).default('image'),
  title_ar: z.string().min(1),
  title_en: z.string().min(1),
  album: z.string().nullable().optional(),
  url: z.string().min(1),
  thumbnail_url: z.string().nullable().optional(),
  taken_at: z.string().nullable().optional(),
})

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const albumFilter = searchParams.get('album')

  let query = adminDb()
    .collection('media')
    .orderBy('created_at', 'desc') as FirebaseFirestore.Query

  if (albumFilter) {
    query = adminDb()
      .collection('media')
      .where('album', '==', albumFilter)
      .orderBy('created_at', 'desc')
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
    .collection('media')
    .add({ ...parse.data, created_at: now })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'create',
    resourceType: 'media',
    resourceId: docRef.id,
    metadata: { title_ar: parse.data.title_ar, type: parse.data.type },
    request,
  })

  revalidateContent('gallery')
  return NextResponse.json({ id: docRef.id }, { status: 201 })
}
