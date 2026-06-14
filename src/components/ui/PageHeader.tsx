interface Props {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: Props) {
  return (
    <section className="bg-gradient-to-br from-primary-800 to-primary-950 text-white">
      <div className="container py-12 md:py-16">
        <h1 className="text-fluid-3xl font-extrabold text-balance">{title}</h1>
        {subtitle && <p className="mt-2 text-fluid-base text-slate-200/90 max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  )
}
