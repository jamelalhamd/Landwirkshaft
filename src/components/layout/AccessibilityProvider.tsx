'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type FontScale = 'base' | 'lg' | 'xl' | 'xxl'
type Theme = 'light' | 'dark'

interface A11yState {
  theme: Theme
  toggleTheme: () => void
  fontScale: FontScale
  setFontScale: (s: FontScale) => void
  highContrast: boolean
  toggleHighContrast: () => void
  reduceMotion: boolean
  toggleReduceMotion: () => void
  speak: (text: string) => void
}

const A11yContext = createContext<A11yState | null>(null)
export function useA11y() {
  const ctx = useContext(A11yContext)
  if (!ctx) throw new Error('useA11y must be used within AccessibilityProvider')
  return ctx
}

const STORAGE_KEY = 'gcsar:a11y'

interface Stored {
  theme?: Theme
  fontScale?: FontScale
  highContrast?: boolean
  reduceMotion?: boolean
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [fontScale, setFontScaleState] = useState<FontScale>('base')
  const [highContrast, setHighContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw) as Stored
        if (s.theme) setTheme(s.theme)
        if (s.fontScale) setFontScaleState(s.fontScale)
        if (s.highContrast) setHighContrast(s.highContrast)
        if (s.reduceMotion) setReduceMotion(s.reduceMotion)
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
      }
    } catch {}
  }, [])

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, fontScale, highContrast, reduceMotion }))
    } catch {}
  }, [theme, fontScale, highContrast, reduceMotion])

  // apply to <html>
  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('dark', theme === 'dark')
    html.classList.remove('a11y-font-lg', 'a11y-font-xl', 'a11y-font-xxl')
    if (fontScale !== 'base') html.classList.add(`a11y-font-${fontScale}`)
    html.classList.toggle('a11y-contrast', highContrast)
    html.classList.toggle('a11y-reduce-motion', reduceMotion)
  }, [theme, fontScale, highContrast, reduceMotion])

  const toggleTheme        = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])
  const toggleHighContrast = useCallback(() => setHighContrast((v) => !v), [])
  const toggleReduceMotion = useCallback(() => setReduceMotion((v) => !v), [])
  const setFontScale       = useCallback((s: FontScale) => setFontScaleState(s), [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = document.documentElement.lang || 'ar-SY'
    window.speechSynthesis.speak(u)
  }, [])

  const value = useMemo<A11yState>(
    () => ({ theme, toggleTheme, fontScale, setFontScale, highContrast, toggleHighContrast, reduceMotion, toggleReduceMotion, speak }),
    [theme, toggleTheme, fontScale, setFontScale, highContrast, toggleHighContrast, reduceMotion, toggleReduceMotion, speak],
  )

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>
}
