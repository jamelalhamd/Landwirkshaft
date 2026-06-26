import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/getSession'

export async function GET() {
  const session = await getSession()

  if (!session.authenticated || !session.profile) {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({
    authenticated: true,
    displayName: session.profile.displayName || session.profile.email,
    email: session.profile.email,
    role: session.profile.role,
  })
}
