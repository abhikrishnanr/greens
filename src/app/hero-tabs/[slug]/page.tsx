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
      <div className="relative overflow-hidden rounded-2xl h-60 md:h-80">
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
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4 space-y-2">
          {tab.iconUrl && (
            <img src={tab.iconUrl} alt={tab.name} className="w-16 h-16 mb-2 rounded-full" />
          )}
          <h1 className="text-3xl font-bold text-white">{tab.heroTitle}</h1>
          {tab.heroDescription && (
            <div
              className="prose prose-sm text-white max-w-xl"
              dangerouslySetInnerHTML={{ __html: tab.heroDescription }}
            />
          )}
        </div>
      </div>

      {tab.variants && tab.variants.length > 0 && (
        <div className="space-y-6">
          {tab.variants.map((v: any) => (
            <ServiceCard key={v.id} variant={v} />
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/" className="text-green-400 underline">Back to Home</Link>
      </div>
    </section>
  )
}
