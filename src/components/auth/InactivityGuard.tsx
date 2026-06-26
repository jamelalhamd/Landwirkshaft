'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'

const INACTIVITY_MS = 10 * 60 * 1000 // 10 minutes
const SESSION_POLL_MS = 5 * 60 * 1000 // validate server session every 5 min
const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'scroll',    'touchstart', 'pointerdown',
  'visibilitychange',
] as const

interface Props {
  locale: string
}

export function InactivityGuard({ locale }: Props) {
  const router = useRouter()
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollTimer      = useRef<ReturnType<typeof setInterval> | null>(null)

  const performLogout = useCallback(async (reason: 'timeout' | 'expired') => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    if (pollTimer.current)       clearInterval(pollTimer.current)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await signOut(clientAuth)
    } catch {
      // continue regardless — redirect clears the UX
    }
    router.push(`/${locale}/login?reason=${reason}`)
    router.refresh()
  }, [locale, router])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(
      () => void performLogout('timeout'),
      INACTIVITY_MS,
    )
  }, [performLogout])

  useEffect(() => {
    // Start the inactivity countdown
    resetInactivityTimer()

    // Register all activity signals
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetInactivityTimer, { passive: true }),
    )

    // Periodically validate the server-side session cookie
    pollTimer.current = setInterval(async () => {
      try {
        const res  = await fetch('/api/auth/me')
        const data = (await res.json()) as { authenticated: boolean }
        if (!data.authenticated) void performLogout('expired')
      } catch {
        // network error — do not log out, wait for next poll
      }
    }, SESSION_POLL_MS)

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      if (pollTimer.current)       clearInterval(pollTimer.current)
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetInactivityTimer),
      )
    }
  }, [resetInactivityTimer, performLogout])

  return null
}
