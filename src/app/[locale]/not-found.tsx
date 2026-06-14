import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="gov-section">
      <div className="container max-w-md text-center">
        <div className="text-6xl font-extrabold text-primary-700">404</div>
        <h1 className="mt-4 text-fluid-xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-fluid-sm text-ink-muted">الصفحة المطلوبة غير موجودة.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Home / الرئيسية</Link>
      </div>
    </section>
  )
}
