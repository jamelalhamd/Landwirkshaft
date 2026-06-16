import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value

  if (sessionCookie) {
    try {
      // Revoke all refresh tokens so the session can never be reused
      const decoded = await adminAuth().verifySessionCookie(sessionCookie)
      await adminAuth().revokeRefreshTokens(decoded.sub)
    } catch {
      // Cookie was invalid — clear it anyway
    }
    cookieStore.delete('__session')
  }

  return NextResponse.json({ ok: true })
}
