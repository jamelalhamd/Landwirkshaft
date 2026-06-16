import { Construction } from 'lucide-react'

interface Props {
  titleAr: string
  titleEn: string
  descAr: string
  descEn: string
  locale: string
}

export function ContentPlaceholder({ titleAr, titleEn, descAr, descEn, locale }: Props) {
  const isAr = locale === 'ar'
  return (
    <div className="gov-card flex flex-col items-center p-12 text-center">
      <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-600">
        <Construction className="size-6" aria-hidden />
      </div>
      <h2 className="text-fluid-xl font-bold text-ink">{isAr ? titleAr : titleEn}</h2>
      <p className="mt-3 max-w-md text-fluid-sm text-ink-muted">{isAr ? descAr : descEn}</p>
      <p className="mt-6 text-xs text-ink-subtle">
        {isAr ? 'يتم نقل المحتوى حالياً. سيكون متاحاً قريباً.' : 'Content is being migrated. It will be available soon.'}
      </p>
    </div>
  )
}
