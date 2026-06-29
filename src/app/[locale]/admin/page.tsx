import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
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
import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'

const SECTIONS = [
  { slug: 'media',     icon: FolderOpen,    labelKey: 'mediaLibrary' as const },
  { slug: 'news',      icon: Newspaper,     labelKey: 'news'         as const },
  { slug: 'documents', icon: FileText,       labelKey: 'documents'    as const },
  { slug: 'research',  icon: BookOpen,       labelKey: 'research'     as const },
  { slug: 'gallery',   icon: ImageIcon,      labelKey: 'gallery'      as const },
  { slug: 'staff',     icon: Users,          labelKey: 'staff'        as const },
  { slug: 'contact',    icon: MessageSquare,  labelKey: 'contact'      as const },
  { slug: 'prometheus', icon: DatabaseZap,    labelKey: 'prometheus'   as const },
  { slug: 'settings',   icon: Settings,       labelKey: 'settings'     as const },
] as const

const LABELS: Record<string, { ar: string; en: string }> = {
  mediaLibrary: { ar: 'مكتبة الملفات',       en: 'Media Library'   },
  news:         { ar: 'الأخبار والإعلانات',  en: 'News'            },
  documents:    { ar: 'الوثائق الرسمية',     en: 'Documents'       },
  research:     { ar: 'الأبحاث والمشاريع',   en: 'Research'        },
  gallery:      { ar: 'معرض الوسائط',        en: 'Gallery'         },
  staff:        { ar: 'دليل الموظفين',       en: 'Staff'           },
  contact:      { ar: 'الرسائل الواردة',     en: 'Messages'        },
  prometheus:   { ar: 'استيراد Prometheus', en: 'Prometheus Sync'  },
  settings:     { ar: 'إعدادات الموقع',    en: 'Site Settings'   },
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = await getDictionary(locale)
  const isAr = locale === 'ar'

  return (
    <div>
      <h1 className="mb-1 text-fluid-2xl font-extrabold text-ink">{dict.nav.admin}</h1>
      <p className="mb-8 text-fluid-sm text-ink-muted">
        {isAr ? 'اختر قسماً لإدارة المحتوى' : 'Select a section to manage content'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ slug, icon: Icon, labelKey }) => {
          const label = LABELS[labelKey] ?? { ar: labelKey, en: labelKey }
          return (
            <Link
              key={slug}
              href={`/${locale}/admin/${slug}`}
              className="gov-card-interactive flex items-center gap-4 p-5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <Icon className="size-5" aria-hidden />
              </div>
              <div>
                <h3 className="font-bold text-ink">{isAr ? label.ar : label.en}</h3>
                <p className="text-fluid-sm text-ink-muted">
                  {isAr ? 'إدارة المحتوى' : 'Manage content'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
