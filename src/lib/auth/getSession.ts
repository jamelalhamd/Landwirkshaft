import 'server-only'
import { cookies } from 'next/headers'
import { type SessionInfo, type UserRole, ROLE_RANK } from '@/lib/auth/types'

export type { SessionInfo }

const noSession: SessionInfo = {
  authenticated: false,
  profile: null,
  roleAtLeast: () => false,
}

export async function getSession(): Promise<SessionInfo> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value
  if (!sessionCookie) return noSession

  try {
    const { adminAuth, adminDb } = await import('@/lib/firebase/admin')

    // checkRevoked: true ensures logged-out sessions are rejected
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)

    const userDoc = await adminDb().collection('users').doc(decoded.uid).get()
    const role: UserRole = (userDoc.data()?.role as UserRole) ?? 'viewer'

    return {
      authenticated: true,
      profile: {
        uid: decoded.uid,
        email: decoded.email ?? '',
        displayName: (userDoc.data()?.displayName as string | undefined) ?? decoded.name ?? '',
        role,
      },
      roleAtLeast: (needed) => ROLE_RANK[role] >= ROLE_RANK[needed],
    }
  } catch {
    // Expired, revoked, or tampered cookie
    return noSession
  }
}
