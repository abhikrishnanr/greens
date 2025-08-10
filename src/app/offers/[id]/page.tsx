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
    <main className="bg-white min-h-screen font-sans text-gray-800">
      <Header />
      <div className="container mx-auto px-6 pt-24 pb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 font-semibold mb-6">
          <FiArrowLeft /> Back to Home
        </Link>
        <div className="grid md:grid-cols-2 gap-8">
          {offer.imageUrl && (
            <img src={offer.imageUrl} alt={offer.title} className="w-full h-64 object-cover rounded-2xl" />
          )}
          <div>
            {offer.category && <div className="text-sm text-emerald-700 font-semibold mb-1">{offer.category}</div>}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{offer.title}</h1>
            {offer.subTitle && <p className="text-gray-700 mb-4">{offer.subTitle}</p>}
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: offer.description || '' }} />
          </div>
        </div>
      </div>
    </main>
  )
}
