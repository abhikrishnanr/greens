import Link from 'next/link'
import { headers } from 'next/headers'
import ServiceCard from '@/components/ServiceCard'

export const dynamic = 'force-dynamic'

export default async function HeroTabPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const host = headers().get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const res = await fetch(
    `${baseUrl}/api/hero-tabs/${encodeURIComponent(slug)}`,
    { cache: 'no-store' }
  )
  if (!res.ok) {
    // Display a friendly message instead of the default 404 page
    return (
      <section className="flex flex-col items-center justify-center py-24 space-y-4">
        <h1 className="text-2xl font-semibold">Tab not found</h1>
        <Link href="/" className="text-green-400 underline">Back to Home</Link>
      </section>
    )
  }
  const tab = await res.json()

  return (
    <section className="max-w-6xl mx-auto my-12 px-4 space-y-8 text-gray-900">
      {/* Cover photo */}
      <div className="relative h-60 md:h-80 rounded-2xl overflow-hidden">
        {tab.videoSrc ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            poster={tab.backgroundUrl}
          >
            <source src={tab.videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={tab.backgroundUrl || '/placeholder.svg'}
            alt={tab.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile header */}
      <div className="relative flex items-end gap-4 -mt-12 px-4">
        {tab.iconUrl && (
          <img
            src={tab.iconUrl}
            alt={tab.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
        )}
        <div className="pb-2">
          <h1 className="text-3xl font-bold">{tab.heroTitle}</h1>
      
        </div>
      </div>

      {tab.heroDescription && (
        <div className="bg-white rounded-2xl shadow p-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: tab.heroDescription }}
          />
        </div>
      )}

      {tab.variants && tab.variants.length > 0 && (
        <div className="space-y-6">
          {tab.variants.map((v: any) => (
            <ServiceCard key={v.id} variant={v} hideDetails />
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/" className="text-green-400 underline">Back to Home</Link>
      </div>
    </section>
  )
}
