import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import type { UserRole } from '@/lib/auth/types'

// 5 days — matches Firebase session cookie max lifetime
const SESSION_EXPIRES_MS = 60 * 60 * 24 * 5 * 1000

export async function POST(request: Request) {
  const { idToken } = (await request.json()) as { idToken: string }

  try {
    const decoded = await adminAuth().verifyIdToken(idToken)

    // Create Firestore user document on first login
    const userRef = adminDb().collection('users').doc(decoded.uid)
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      await userRef.set({
        email: decoded.email ?? '',
        displayName: decoded.name ?? '',
        role: 'viewer' satisfies UserRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    })

    const cookieStore = await cookies()
    cookieStore.set('__session', sessionCookie, {
      maxAge: SESSION_EXPIRES_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('__session')
  return NextResponse.json({ ok: true })
}
