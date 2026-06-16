'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { clientAuth } from '@/lib/firebase/client'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/getDictionary'

function localiseFirebaseError(code: string, locale: Locale): string {
  const map: Record<string, { ar: string; en: string }> = {
    'auth/invalid-credential': {
      ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      en: 'Incorrect email or password.',
    },
    'auth/user-disabled': {
      ar: 'هذا الحساب معطّل. تواصل مع المسؤول.',
      en: 'This account has been disabled. Contact the administrator.',
    },
    'auth/too-many-requests': {
      ar: 'محاولات كثيرة. حاول مجدداً بعد قليل.',
      en: 'Too many attempts. Please try again later.',
    },
  }
  return map[code]?.[locale] ?? (locale === 'ar' ? 'حدث خطأ. حاول مجدداً.' : 'An error occurred. Please try again.')
}

export function LoginForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    try {
      const { user } = await signInWithEmailAndPassword(clientAuth, email, password)
      const idToken = await user.getIdToken()

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (!res.ok) throw new Error(locale === 'ar' ? 'فشل إنشاء الجلسة.' : 'Session creation failed.')

      router.push(`/${locale}/admin`)
      router.refresh()
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(localiseFirebaseError(err.code, locale))
      } else {
        setError(err instanceof Error ? err.message : String(err))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-fluid-sm font-medium text-ink">
          {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm text-ink focus:border-primary-600 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-fluid-sm font-medium text-ink">
          {locale === 'ar' ? 'كلمة المرور' : 'Password'}
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fluid-sm text-ink focus:border-primary-600 focus:outline-none"
        />
      </div>
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-fluid-sm text-red-800">
          {error}
        </div>
      )}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? dict.common.loading : locale === 'ar' ? 'دخول' : 'Sign in'}
      </button>
    </form>
  )
}
