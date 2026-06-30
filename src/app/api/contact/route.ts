import { NextResponse } from 'next/server'
import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

const schema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  subject: z.string().min(2).max(200),
  body: z.string().min(5).max(4000),
})

export async function POST(request: Request) {
  const fd = await request.formData()

  // Honeypot
  if (fd.get('website')) {
    return NextResponse.json({ ok: true })
  }

  const parsed = schema.safeParse({
    fullName: fd.get('fullName'),
    email: fd.get('email'),
    phone: fd.get('phone') || undefined,
    subject: fd.get('subject'),
    body: fd.get('body'),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  try {
    await adminDb().collection('contact_messages').add({
      full_name:      parsed.data.fullName,
      email:          parsed.data.email,
      phone:          parsed.data.phone ?? null,
      subject:        parsed.data.subject,
      body:           parsed.data.body,
      status:         'new',
      attachment_url: null,
      ip_address:     ip,
      created_at:     new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    })
  } catch (err) {
    console.error('[contact] Firestore write failed:', err)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
