'use client'

import { useState, useEffect } from 'react'

export function LiveClock({ locale }: { locale: string }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const langTag = locale === 'ar' ? 'ar-SY' : 'en-GB'
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString(langTag, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [locale])

  if (!time) return null

  return (
    <time
      aria-live="off"
      aria-label={locale === 'ar' ? 'الوقت الحالي' : 'Current time'}
      className="tabular-nums"
    >
      {time}
    </time>
  )
}
