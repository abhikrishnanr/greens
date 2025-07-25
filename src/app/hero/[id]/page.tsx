import Link from 'next/link'
import { headers } from 'next/headers'

export default async function HeroTabPage({ params }: { params: { id: string } }) {
  const { id } = params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${headers().get('host')}`
  const res = await fetch(`${baseUrl}/api/hero-tabs/${id}`, { cache: 'no-store' })
  if (!res.ok) return <div className="p-8 text-red-500">Unable to load tab</div>
  const tab = await res.json()

  return (
    <div className="max-w-3xl mx-auto my-12 bg-gray-900 rounded-2xl p-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-4" style={{ color: '#41eb70' }}>{tab.heroTitle}</h1>
      {tab.heroDescription && (
        <div className="prose prose-invert mb-6" dangerouslySetInnerHTML={{ __html: tab.heroDescription }} />
      )}
      {tab.variants && tab.variants.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#41eb70' }}>Featured Services</h2>
          <ul className="space-y-3">
            {tab.variants.map((v: any) => (
              <li key={v.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-xl">
                <span>{v.serviceName} - {v.name}</span>
                <span className="font-bold" style={{ color: '#41eb70' }}>₹{v.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-8">
        <Link href="/" className="text-green-400 underline">Back to Home</Link>
      </div>
    </div>
  )
}
