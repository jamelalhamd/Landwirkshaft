'use client'

import { useState, useEffect } from 'react'

export interface ClientSession {
  loading: boolean
  authenticated: boolean
  displayName: string
  email: string
  role: string
}

const INITIAL: ClientSession = {
  loading: true,
  authenticated: false,
  displayName: '',
  email: '',
  role: '',
}

export function useClientSession(): ClientSession {
  const [state, setState] = useState<ClientSession>(INITIAL)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data: Omit<ClientSession, 'loading'>) => {
        if (!cancelled) setState({ loading: false, ...data })
      })
      .catch(() => {
        if (!cancelled) setState({ ...INITIAL, loading: false })
      })
    return () => { cancelled = true }
  }, [])

  return state
}
