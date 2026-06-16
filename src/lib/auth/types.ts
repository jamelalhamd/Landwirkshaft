export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
}

export interface SessionInfo {
  authenticated: boolean
  profile: UserProfile | null
  roleAtLeast: (role: UserRole) => boolean
}

export const ROLE_RANK: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
}
