import 'server-only'
import type { Profile, UserRole } from '@/lib/supabase/types'

export interface SessionInfo {
  authenticated: boolean
  profile: Profile | null
  roleAtLeast: (role: UserRole) => boolean
}

const ROLE_RANK: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
}

/**
 * Server-side session helper. Returns a minimal SessionInfo so admin pages
 * can guard themselves without each importing Supabase directly.
 *
 * When NEXT_PUBLIC_DATA_SOURCE=mock, returns an unauthenticated session so
 * the admin route shows the login screen instead of crashing.
 */
export async function getSession(): Promise<SessionInfo> {
  const noSession: SessionInfo = {
    authenticated: false,
    profile: null,
    roleAtLeast: () => false,
  }

  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== 'supabase') return noSession

  const { createSupabaseServerClient } = await import('@/lib/supabase/server')
  const sb = await createSupabaseServerClient()
  const { data: userData } = await sb.auth.getUser()
  const user = userData.user
  if (!user) return noSession

  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle<Profile>()
  if (!profile) return noSession

  return {
    authenticated: true,
    profile,
    roleAtLeast: (needed) => ROLE_RANK[profile.role] >= ROLE_RANK[needed],
  }
}
