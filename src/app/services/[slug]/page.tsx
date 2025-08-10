import Link from 'next/link'
import { headers } from 'next/headers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'


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
    <main className="bg-white min-h-screen text-gray-900 flex flex-col">
      <Header />
      <div className="max-w-3xl mx-auto my-12 bg-white rounded-2xl p-8 shadow flex-1">
        {service.imageUrl && (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="mb-6 rounded-xl w-full max-h-64 object-cover"
          />
        )}
        {service.images && service.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {service.images.map((img: any) => (
              <img
                key={img.id}
                src={img.imageUrl}
                alt={img.caption || service.name}
                className="rounded-xl object-cover w-full"
              />
            ))}
          </div>
        )}
        <h1 className="text-3xl font-bold mb-1" style={{ color: '#41eb70' }}>
          {service.name}
        </h1>
        {service.caption && (
          <p className="text-lg text-gray-600 mb-2">{service.caption}</p>
        )}
        {service.category && (
          <p className="text-sm text-gray-500 mb-4">Category: {service.category}</p>
        )}
        {service.applicableTo && (
          <p className="text-sm text-gray-500 mb-6">Applicable to: {service.applicableTo}</p>
        )}
        <div
          className="prose mb-8"
          dangerouslySetInnerHTML={{ __html: service.description || '' }}
        />
        <h2 className="text-2xl font-semibold mb-4" style={{ color: '#41eb70' }}>
          Variants
        </h2>
        <ul className="space-y-3">
          {service.tiers.map((t: any) => (
            <li
              key={t.id}
              className="flex items-center justify-between bg-gray-100 rounded-xl p-4"
            >
              <div>
                <span className="font-medium">{t.name}</span>
                {t.duration && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({t.duration} mins)
                  </span>
                )}
              </div>
              <div className="text-right">
                {t.offerPrice && t.offerPrice < t.actualPrice ? (
                  <>
                    <span className="line-through text-gray-500 mr-2">
                      ₹{t.actualPrice}
                    </span>
                    <span className="font-bold" style={{ color: '#41eb70' }}>
                      ₹{t.offerPrice}
                    </span>
                  </>
                ) : (
                  <span className="font-bold" style={{ color: '#41eb70' }}>
                    ₹{t.actualPrice}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href="/" className="text-green-400 underline">
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </main>

  )
}
