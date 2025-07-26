import Link from 'next/link'
import { headers } from 'next/headers'

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '')
}

export default async function HeroTabPage({ params }: { params: { id: string } }) {
  const { id } = params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${headers().get('host')}`
  const res = await fetch(`${baseUrl}/api/hero-tabs/${id}`, { cache: 'no-store' })
  if (!res.ok) return <div className="p-8 text-red-500">Unable to load tab</div>
  const tab = await res.json()

  return (
    <section className="max-w-5xl mx-auto my-12 px-4 space-y-8">
      <div className="bg-gray-900 rounded-2xl p-8 text-gray-100 shadow">
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#41eb70' }}>{tab.heroTitle}</h1>
        {tab.heroDescription && (
          <div className="prose prose-invert mb-6" dangerouslySetInnerHTML={{ __html: tab.heroDescription }} />
        )}
      </div>

      {tab.variants && tab.variants.length > 0 && (
        <div className="space-y-6">
          {tab.variants.map((v: any) => (
            <div key={v.id} className="bg-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow">
              {v.imageUrl && (
                <img
                  src={v.imageUrl}
                  alt={v.serviceName}
                  className="w-full md:w-40 h-40 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#41eb70' }}>
                  {v.serviceName} - {v.name}
                </h3>
                {v.caption && <p className="text-gray-300 mb-1">{v.caption}</p>}
                {v.description && (
                  <p className="text-gray-400 text-sm mb-2">
                    {stripHtml(v.description).slice(0, 120)}{v.description.length > 120 ? '...' : ''}
                  </p>
                )}
                <p className="font-bold" style={{ color: '#41eb70' }}>₹{v.price}</p>
                <Link href={`/services/${v.serviceId}`} className="text-green-400 underline text-sm mt-2 inline-block">
                  View Details
                </Link>
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
