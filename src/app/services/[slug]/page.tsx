import Link from 'next/link'
import { headers } from 'next/headers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FiArrowLeft } from 'react-icons/fi'

export default async function ServiceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const headersList = await headers()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${headersList.get('host')}`

  const res = await fetch(`${baseUrl}/api/services/${slug}`, { cache: 'no-store' })
  if (!res.ok) {
    return <div className="text-red-500 text-xl p-8">Unable to load service details</div>
  }
  const service = await res.json()

  if (!service || !service.id) {
    return <div className="text-red-500 text-xl p-8">Service not found</div>
  }

  return (
    <main className="bg-emerald-950 min-h-screen text-emerald-50 flex flex-col">
      <Header />

      {/* top accents */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
      </div>

      {/* add top padding if header is fixed; tune as needed */}
      <div className="container mx-auto max-w-6xl w-full px-5 md:px-8 pt-24 md:pt-28 pb-10 md:pb-14 flex-1">
        {/* Back link (raised z-index) */}
        <div className="mb-6 relative z-30">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-900/60 px-4 py-2 text-emerald-300 hover:text-emerald-100 hover:border-emerald-700 hover:bg-emerald-900 transition"
          >
            <FiArrowLeft className="text-emerald-300" />
            Back to Home
          </Link>
        </div>

        {/* media header (optional) */}
        {service.imageUrl && (
          <div className="relative overflow-hidden rounded-3xl mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
            <img
              src={service.imageUrl}
              alt={service.name}
              className="h-64 w-full object-cover"
            />
          </div>
        )}

        {/* TOP GRID: Left = title/meta, Right = Rates (on lg+) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: title + caption + chips */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-emerald-800/80 bg-emerald-950/60 backdrop-blur-md p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-300">
                {service.name}
              </h1>

              {service.caption && (
                <p className="mt-2 text-lg text-emerald-200">{service.caption}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {service.category && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/70 px-3 py-1 text-sm text-emerald-300 ring-1 ring-emerald-800/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Category: {service.category}
                  </span>
                )}
                {service.applicableTo && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-900/70 px-3 py-1 text-sm text-emerald-300 ring-1 ring-emerald-800/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Applicable to: {service.applicableTo}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Rates card (drops below on mobile) */}
          <aside className="lg:col-span-1">
            <div className="rounded-3xl border border-emerald-800/80 bg-emerald-900/60 backdrop-blur-md p-5 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.25)]">
              <h2 className="text-2xl font-semibold mb-4 text-emerald-300">Rates</h2>
              <ul className="space-y-3">
                {service.tiers.map((t: {
                  id: string
                  name: string
                  duration?: number | null
                  offerPrice?: number | null
                  actualPrice: number
                }) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-emerald-800/70 bg-emerald-950/40 p-4 hover:border-emerald-700 transition"
                  >
                    <div className="min-w-0">
                      <span className="font-medium">{t.name}</span>
                      {t.duration && (
                        <span className="text-sm text-emerald-200 ml-2">({t.duration} mins)</span>
                      )}
                    </div>
                    <div className="text-right">
                      {t.offerPrice && t.offerPrice < t.actualPrice ? (
                        <>
                          <span className="line-through text-emerald-400 mr-2">₹{t.actualPrice}</span>
                          <span className="font-bold text-emerald-300">₹{t.offerPrice}</span>
                        </>
                      ) : (
                        <span className="font-bold text-emerald-300">₹{t.actualPrice}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* DESCRIPTION: full width */}
        <section className="mb-8">
          <div className="rounded-3xl border border-emerald-800/80 bg-emerald-900/50 backdrop-blur-md p-5 md:p-6">
            <div
              className="prose prose-invert max-w-none prose-headings:text-emerald-200 prose-strong:text-emerald-100 prose-a:text-emerald-300 hover:prose-a:text-emerald-200"
              dangerouslySetInnerHTML={{ __html: service.description || '' }}
            />
          </div>
        </section>

        {/* GALLERY: full width, responsive */}
        {service.images && service.images.length > 0 && (
          <section className="mb-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {service.images.map((img: { id: string; imageUrl: string; caption?: string | null }) => (
                <div key={img.id} className="group relative overflow-hidden rounded-2xl border border-emerald-800/70 bg-emerald-900/50">
                  <img
                    src={img.imageUrl}
                    alt={img.caption || service.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-emerald-700/50 rounded-2xl" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  )
}
