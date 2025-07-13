import Link from 'next/link'

export default async function ServiceDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const res = await fetch(`${baseUrl}/api/v2/services/${id}`, { cache: 'no-store' })
  if (!res.ok) {
    return <div className="text-red-500 text-xl p-8">Unable to load service details</div>
  }
  const service = await res.json()

  if (!service || !service.id) {
    return <div className="text-red-500 text-xl p-8">Service not found</div>
  }

  return (
    <div className="max-w-3xl mx-auto my-12 bg-gray-900 rounded-2xl p-8 shadow text-gray-100">
      {service.imageUrl && (
        <img src={service.imageUrl} alt={service.name} className="mb-6 rounded-xl w-full max-h-64 object-cover" />
      )}
      {service.images && service.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {service.images.map(img => (
            <img key={img.id} src={img.imageUrl} alt={img.caption || service.name} className="rounded-xl object-cover w-full" />
          ))}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#41eb70' }}>{service.name}</h1>
      {service.caption && <p className="text-lg text-gray-300 mb-4">{service.caption}</p>}
      <div className="prose prose-invert mb-6" dangerouslySetInnerHTML={{ __html: service.description || '' }} />
      <h2 className="text-2xl font-semibold mb-4" style={{ color: '#41eb70' }}>Tiers</h2>
      <ul className="space-y-3">
        {service.tiers.map(t => (
          <li key={t.id} className="flex items-center justify-between bg-gray-800 rounded-xl p-4">
            <span className="font-medium">{t.name}</span>
            <span className="font-bold" style={{ color: '#41eb70' }}>₹{t.offerPrice ?? t.actualPrice}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex justify-between items-center">
        <Link href="/" className="text-green-400 underline">Back to Home</Link>
        <Link href={`/booking?service=${service.id}`} className="bg-green-600 text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-green-500 transition-colors">Book Now</Link>
      </div>
    </div>
  )
}
