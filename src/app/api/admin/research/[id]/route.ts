import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const UpdateSchema = z.object({
  title_ar: z.string().min(1).optional(),
  title_en: z.string().min(1).optional(),
  abstract_ar: z.string().optional(),
  abstract_en: z.string().optional(),
  authors: z.array(z.string()).optional(),
  field: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  issn: z.string().nullable().optional(),
  doi: z.string().nullable().optional(),
  pdf_url: z.string().nullable().optional(),
  citations_count: z.number().int().nonnegative().optional(),
  status: z.enum(['draft', 'review', 'published', 'archived']).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const docRef = adminDb().collection('research').doc(id)
  const doc = await docRef.get()
  if (!doc.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json() as unknown
  const parse = UpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', issues: parse.error.issues }, { status: 400 })
  }

  const data = parse.data
  if (data.status === 'published' && !session.roleAtLeast('admin')) {
    data.status = 'review'
  }

  await docRef.update({ ...data, updated_at: new Date().toISOString() })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'research',
    resourceId: id,
    metadata: { fields: Object.keys(data) },
    request,
  })

  revalidateContent('research')
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
  await adminDb().collection('research').doc(id).delete()

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'delete',
    resourceType: 'research',
    resourceId: id,
    request,
  })

  revalidateContent('research')
  return NextResponse.json({ ok: true })
}
