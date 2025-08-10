import Link from 'next/link'
import { headers } from 'next/headers'
import Header from '@/components/Header'
import { FiArrowLeft } from 'react-icons/fi'

export default async function OfferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headersList = await headers()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${headersList.get('host')}`

  const res = await fetch(`${baseUrl}/api/limited-time-offers/${id}`, { cache: 'no-store' })
  if (!res.ok) {
    return <div className="text-red-500 text-xl p-8">Unable to load offer</div>
  }
  const offer = await res.json()
  if (!offer || !offer.id) {
    return <div className="text-red-500 text-xl p-8">Offer not found</div>
  }

  return (
    <main className="relative min-h-screen bg-emerald-950 text-emerald-50 overflow-x-hidden">
      <Header />

      {/* soft background glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="container mx-auto px-6 pt-24 pb-12 relative z-10">
        {/* Back link (high z so it never hides behind fixed header) */}
        <Link
          href="/"
          className="relative z-50 inline-flex items-center gap-2 text-emerald-200 hover:text-white font-medium mb-6"
        >
          <FiArrowLeft /> Back to Home
        </Link>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Image column — sticky on desktop, full height, no crop */}
          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-900/30 backdrop-blur overflow-hidden md:sticky md:top-28 md:h-[calc(100vh-8rem)]">
            {offer.imageUrl ? (
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="grid place-items-center h-[55vh] md:h-full text-emerald-200/70">
                No image available
              </div>
            )}
          </div>

          {/* Content card */}
          <article className="rounded-2xl border border-emerald-700/60 bg-emerald-900/30 backdrop-blur p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.25)]">
            {offer.category && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-200 mb-3">
                {offer.category}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-emerald-50 mb-2">
              {offer.title}
            </h1>

            {offer.subTitle && (
              <p className="text-emerald-200/85 mb-5">
                {offer.subTitle}
              </p>
            )}

            <div
              className="prose prose-invert max-w-none prose-a:text-emerald-300 prose-strong:text-emerald-50 prose-li:marker:text-emerald-300"
              dangerouslySetInnerHTML={{ __html: offer.description || '' }}
            />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/book-appointment"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 font-semibold transition"
              >
                Book Appointment
              </Link>
              <Link
                href="/#offers"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-600/70 text-emerald-100 hover:bg-emerald-800/40 px-5 py-2.5 transition"
              >
                View All Offers
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
