import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { getRepository } from '@/lib/data/repository'
import { Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

export const revalidate = 300

export default async function StaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  const repo = await getRepository()
  const [staff, departments] = await Promise.all([repo.listStaff(), repo.listDepartments()])

  const deptName = Object.fromEntries(
    departments.map((d) => [d.id, locale === 'ar' ? d.name_ar : d.name_en]),
  )

  return (
    <>
      <PageHeader title={dict.nav.staff} />
      <section className="gov-section">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staff.map((s) => {
              const name = locale === 'ar' ? s.full_name_ar : s.full_name_en
              const position = locale === 'ar' ? s.position_ar : s.position_en
              const dept = deptName[s.department_id]
              const initials = name.slice(0, 2)

              return (
                <article key={s.id} className="gov-card overflow-hidden flex flex-col">
                  {/* Photo area */}
                  <div className="relative h-52 w-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 shrink-0">
                    {s.photo_url ? (
                      <Image
                        src={s.photo_url}
                        alt={name}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-5xl font-extrabold text-primary-300 dark:text-primary-600 select-none">
                        {initials}
                      </span>
                    )}
                    {/* Dept badge */}
                    {dept && (
                      <span className="absolute bottom-2 start-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm line-clamp-1 max-w-[90%]">
                        {dept}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2 p-4 flex-1">
                    <div>
                      <h3 className="font-bold text-ink leading-snug">{name}</h3>
                      <p className="mt-0.5 text-fluid-xs text-primary-700 dark:text-primary-400 font-medium">{position}</p>
                    </div>

                    <ul className="mt-auto space-y-1.5 text-fluid-xs text-ink-muted pt-3 border-t border-border">
                      {s.email && (
                        <li className="flex items-center gap-2 min-w-0">
                          <Mail className="size-3.5 shrink-0" aria-hidden />
                          <a href={`mailto:${s.email}`} className="hover:text-ink truncate">{s.email}</a>
                        </li>
                      )}
                      {s.phone && (
                        <li className="flex items-center gap-2">
                          <Phone className="size-3.5 shrink-0" aria-hidden />
                          <span>{s.phone}</span>
                        </li>
                      )}
                      {s.office && (
                        <li className="flex items-center gap-2">
                          <MapPin className="size-3.5 shrink-0" aria-hidden />
                          <span>{s.office}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
