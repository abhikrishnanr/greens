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
      <div className="max-w-5xl mx-auto my-12 bg-emerald-900 rounded-2xl p-8 shadow-lg flex-1">
        <Link
          href="/"
          className="inline-flex items-center text-emerald-300 hover:text-emerald-200 mb-6"
        >
          <FiArrowLeft className="mr-2" /> Back to Home
        </Link>
        {service.imageUrl && (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="mb-6 rounded-xl w-full max-h-64 object-cover"
          />
        )}
        {service.images && service.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {service.images.map(
              (img: { id: string; imageUrl: string; caption?: string | null }) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={img.caption || service.name}
                  className="rounded-xl object-cover w-full"
                />
              )
            )}
          </div>
        )}
        <h1 className="text-3xl font-bold mb-1 text-emerald-300">{service.name}</h1>
        {service.caption && (
          <p className="text-lg text-emerald-200 mb-2">{service.caption}</p>
        )}
        {service.category && (
          <p className="text-sm text-emerald-400 mb-4">
            Category: {service.category}
          </p>
        )}
        {service.applicableTo && (
          <p className="text-sm text-emerald-400 mb-6">
            Applicable to: {service.applicableTo}
          </p>
        )}
        <div className="mt-6 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-300">
              Rates
            </h2>
            <ul className="space-y-3">
              {service.tiers.map(
                (t: {
                  id: string
                  name: string
                  duration?: number | null
                  offerPrice?: number | null
                  actualPrice: number
                }) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between bg-emerald-800 rounded-xl p-4"
                  >
                    <div>
                      <span className="font-medium">{t.name}</span>
                      {t.duration && (
                        <span className="text-sm text-emerald-200 ml-2">
                          ({t.duration} mins)
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {t.offerPrice && t.offerPrice < t.actualPrice ? (
                        <>
                          <span className="line-through text-emerald-400 mr-2">
                            ₹{t.actualPrice}
                          </span>
                          <span className="font-bold text-emerald-300">
                            ₹{t.offerPrice}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-emerald-300">
                          ₹{t.actualPrice}
                        </span>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="md:w-1/2">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: service.description || '' }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>

  )
}
