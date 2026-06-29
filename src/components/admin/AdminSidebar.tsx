'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  BookOpen,
  Users,
  ImageIcon,
  MessageSquare,
  FolderOpen,
  DatabaseZap,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/i18n/config'
import type { UserRole } from '@/lib/auth/types'

const ROLE_RANK: Record<UserRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
}

const NAV_ITEMS = [
  {
    slug: '',
    icon: LayoutDashboard,
    ar: 'لوحة التحكم',
    en: 'Dashboard',
    minRole: 'editor' as UserRole,
  },
  {
    slug: 'media',
    icon: FolderOpen,
    ar: 'مكتبة الملفات',
    en: 'Media Library',
    minRole: 'editor' as UserRole,
  },
  {
    slug: 'news',
    icon: Newspaper,
    ar: 'الأخبار',
    en: 'News',
    minRole: 'editor' as UserRole,
  },
  {
    slug: 'documents',
    icon: FileText,
    ar: 'الوثائق',
    en: 'Documents',
    minRole: 'editor' as UserRole,
  },
  {
    slug: 'research',
    icon: BookOpen,
    ar: 'البحوث',
    en: 'Research',
    minRole: 'editor' as UserRole,
  },
  {
    slug: 'gallery',
    icon: ImageIcon,
    ar: 'معرض الوسائط',
    en: 'Gallery',
    minRole: 'editor' as UserRole,
  },
  {
    slug: 'staff',
    icon: Users,
    ar: 'الموظفون',
    en: 'Staff',
    minRole: 'admin' as UserRole,
  },
  {
    slug: 'contact',
    icon: MessageSquare,
    ar: 'الرسائل',
    en: 'Messages',
    minRole: 'admin' as UserRole,
  },
  {
    slug: 'prometheus',
    icon: DatabaseZap,
    ar: 'استيراد Prometheus',
    en: 'Prometheus Sync',
    minRole: 'admin' as UserRole,
  },
  {
    slug: 'settings',
    icon: Settings,
    ar: 'إعدادات الموقع',
    en: 'Site Settings',
    minRole: 'admin' as UserRole,
  },
]

export function AdminSidebar({ locale, role }: { locale: Locale; role: UserRole }) {
  const pathname = usePathname()
  const isAr = locale === 'ar'

  const visibleItems = NAV_ITEMS.filter(
    (item) => ROLE_RANK[role] >= ROLE_RANK[item.minRole],
  )

  return (
    <aside
      className={cn(
        'hidden w-56 shrink-0 border-border bg-surface lg:block',
        isAr ? 'border-l' : 'border-r',
      )}
    >
      <nav className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
        <p className="mb-3 px-2 text-fluid-xs font-semibold uppercase tracking-wider text-ink-muted">
          {isAr ? 'الإدارة' : 'Administration'}
        </p>
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const href = `/${locale}/admin${item.slug ? `/${item.slug}` : ''}`
            const isActive =
              item.slug === ''
                ? pathname === `/${locale}/admin`
                : pathname.startsWith(`/${locale}/admin/${item.slug}`)
            const Icon = item.icon

            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-fluid-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-ink-muted hover:bg-primary-50 hover:text-primary-700',
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {isAr ? item.ar : item.en}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
