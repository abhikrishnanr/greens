import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '')
}

export default async function HeroTabPage({ params }: { params: { id: string } }) {
  const { id } = params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${headers().get('host')}`
  const res = await fetch(`${baseUrl}/api/hero-tabs/${id}`, { cache: 'no-store' })
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
        <div className="grid sm:grid-cols-2 gap-6">
          {tab.variants.map((v: any) => (
            <div key={v.id} className="bg-white rounded-2xl shadow overflow-hidden flex flex-col">
              {v.imageUrl && (
                <img
                  src={v.imageUrl}
                  alt={v.serviceName}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-semibold mb-1" style={{ color: '#41eb70' }}>
                  {v.serviceName} - {v.name}
                </h3>
                {v.caption && <p className="text-gray-600 mb-1 text-sm">{v.caption}</p>}
                {v.description && (
                  <p className="text-gray-500 text-sm mb-2">
                    {stripHtml(v.description).slice(0, 160)}
                    {v.description.length > 160 ? '...' : ''}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-bold text-lg" style={{ color: '#41eb70' }}>₹{v.price}</span>
                  <Link href={`/services/${v.serviceId}`} className="text-green-500 underline text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/" className="text-green-400 underline">Back to Home</Link>
      </div>
    </section>
  )
}
