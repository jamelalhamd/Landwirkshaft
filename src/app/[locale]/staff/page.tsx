import { isLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/getDictionary'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { getRepository } from '@/lib/data/repository'
import { Mail, Phone, MapPin } from 'lucide-react'

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => (
              <article key={s.id} className="gov-card p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-14 place-items-center rounded-full bg-primary-100 font-bold text-primary-700">
                    {(locale === 'ar' ? s.full_name_ar : s.full_name_en).slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">{locale === 'ar' ? s.full_name_ar : s.full_name_en}</h3>
                    <p className="text-fluid-xs text-ink-muted">{locale === 'ar' ? s.position_ar : s.position_en}</p>
                  </div>
                </div>
                <p className="mt-3 text-fluid-xs text-ink-subtle">{deptName[s.department_id]}</p>
                <ul className="mt-3 space-y-1.5 text-fluid-xs text-ink-muted">
                  {s.email && <li className="flex items-center gap-2"><Mail className="size-3.5" aria-hidden /><a href={`mailto:${s.email}`} className="hover:text-ink">{s.email}</a></li>}
                  {s.phone && <li className="flex items-center gap-2"><Phone className="size-3.5" aria-hidden />{s.phone}</li>}
                  {s.office && <li className="flex items-center gap-2"><MapPin className="size-3.5" aria-hidden />{s.office}</li>}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
