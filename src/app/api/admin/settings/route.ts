import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { adminDb } from '@/lib/firebase/admin'
import { writeAuditLog } from '@/lib/admin/audit'

const SettingsSchema = z.object({
  site_name_ar:     z.string().min(1).optional(),
  site_name_en:     z.string().min(1).optional(),
  tagline_ar:       z.string().optional(),
  tagline_en:       z.string().optional(),
  logo_url:         z.string().url().nullable().optional(),
  logo2_url:        z.string().url().nullable().optional(),
  hero_title_ar:    z.string().optional(),
  hero_title_en:    z.string().optional(),
  hero_subtitle_ar: z.string().optional(),
  hero_subtitle_en: z.string().optional(),
  hero_eyebrow_ar:  z.string().optional(),
  hero_eyebrow_en:  z.string().optional(),
})

// GET /api/admin/settings — aktuelle Einstellungen lesen
export async function GET() {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('editor')) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const doc = await adminDb().collection('site_settings').doc('main').get()
  return NextResponse.json(doc.exists ? doc.data() : {})
}

// PUT /api/admin/settings — Einstellungen speichern (nur admin+)
export async function PUT(request: Request) {
  const session = await getSession()
  if (!session.authenticated || !session.roleAtLeast('admin')) {
    return NextResponse.json({ error: 'Admin-Berechtigung erforderlich' }, { status: 403 })
  }

  const body = await request.json() as unknown
  const parse = SettingsSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: 'Validierungsfehler', issues: parse.error.issues }, { status: 400 })
  }

  await adminDb()
    .collection('site_settings')
    .doc('main')
    .set({ ...parse.data, updated_at: new Date().toISOString(), updated_by: session.profile!.uid }, { merge: true })

  await writeAuditLog({
    actorId: session.profile!.uid,
    action: 'update',
    resourceType: 'site_settings',
    resourceId: 'main',
    metadata: { fields: Object.keys(parse.data) },
    request,
  })

  return NextResponse.json({ ok: true })
}
