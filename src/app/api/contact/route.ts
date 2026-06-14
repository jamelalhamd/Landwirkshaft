import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  subject: z.string().min(2).max(200),
  body: z.string().min(5).max(4000),
  departmentId: z.string().uuid().optional().or(z.literal('')),
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
    departmentId: fd.get('departmentId') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase') {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server')
    const sb = await createSupabaseServerClient()
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const { error } = await sb.from('contact_messages').insert({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      subject: parsed.data.subject,
      body: parsed.data.body,
      department_id: parsed.data.departmentId || null,
      ip_address: ip,
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    // Mock mode — log to server console so the developer can verify the wiring.
    console.log('[contact:mock]', parsed.data)
  }

  return NextResponse.json({ ok: true })
}
