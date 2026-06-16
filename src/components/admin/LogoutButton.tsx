'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import type { Locale } from '@/lib/i18n/config'

export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter()

  async function handleLogout() {
    // Revoke server session cookie
    await fetch('/api/auth/logout', { method: 'POST' })
    // Sign out from Firebase client (clears local token)
    await signOut(clientAuth)
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-fluid-sm font-medium text-ink-muted transition-colors hover:border-red-300 hover:text-red-600"
    >
      <LogOut className="size-4" aria-hidden />
      {locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
    </button>
  )
}
