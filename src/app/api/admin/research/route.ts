import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const CreateSchema = z.object({
  title_ar: z.string().min(1),
  title_en: z.string().min(1),
  abstract_ar: z.string().min(1),
  abstract_en: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  field: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  issn: z.string().nullable().optional(),
  doi: z.string().nullable().optional(),
  pdf_url: z.string().nullable().optional(),
  citations_count: z.number().int().nonnegative().default(0),
  status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
})

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')

  let query = adminDb()
    .collection('research')
    .orderBy('year', 'desc') as FirebaseFirestore.Query

  if (statusFilter) {
    query = adminDb()
      .collection('research')
      .where('status', '==', statusFilter)
      .orderBy('year', 'desc')
  }

  const snap = await query.limit(200).get()
  return NextResponse.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as unknown
  const parse = CreateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', issues: parse.error.issues }, { status: 400 })
  }

  const data = parse.data
  if (data.status === 'published' && !session.roleAtLeast('admin')) {
    data.status = 'review'
  }

  const now = new Date().toISOString()
  const docRef = await adminDb()
    .collection('research')
    .add({ ...data, created_by: session.profile!.uid, created_at: now, updated_at: now })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'create',
    resourceType: 'research',
    resourceId: docRef.id,
    metadata: { title_ar: data.title_ar },
    request,
  })

  revalidateContent('research')
  return NextResponse.json({ id: docRef.id }, { status: 201 })
}
