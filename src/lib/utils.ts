import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SY' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatNumber(n: number, locale: 'ar' | 'en' = 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SY' : 'en-US').format(n)
}
