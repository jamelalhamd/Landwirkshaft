import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'
import { revalidateContent } from '@/lib/admin/revalidate'

const STAT_KEYS = ['research', 'projects', 'seeds', 'researchers'] as const

const UpdateSchema = z.object({
  key: z.enum(STAT_KEYS),
  value: z.number().int().nonnegative(),
})

export async function GET() {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const snap = await adminDb().collection('site_stats').get()
  return NextResponse.json(
    snap.docs.map((d) => ({ key: d.id, value: d.data()['value'] ?? 0, updated_at: d.data()['updated_at'] })),
  )
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin role required' }, { status: 403 })
  }

  const body = await request.json() as unknown
  const parse = UpdateSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validation error', issues: parse.error.issues }, { status: 400 })
  }

  const now = new Date().toISOString()
  await adminDb()
    .collection('site_stats')
    .doc(parse.data.key)
    .set({ value: parse.data.value, updated_at: now }, { merge: true })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'site_stats',
    resourceId: parse.data.key,
    metadata: { value: parse.data.value },
    request,
  })

  revalidateContent('site_stats')
  return NextResponse.json({ ok: true })
}
