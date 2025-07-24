import Link from 'next/link'
import { headers } from 'next/headers'

export default async function CustomerProfile({ params }: { params: { id: string } }) {
  const { id } = params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${headers().get('host')}`
  const res = await fetch(`${baseUrl}/api/customers/${id}`, { cache: 'no-store' })
  if (!res.ok) {
    return <div className="p-6 text-red-500">Failed to load customer</div>
  }
  const { user, history } = await res.json()
  if (!user) {
    return <div className="p-6 text-red-500">Customer not found</div>
  }
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{user.name}</h1>
      <p className="mb-2">Phone: {user.phone}</p>
      {user.email && <p className="mb-2">Email: {user.email}</p>}
      <p className="mb-4">Gender: {user.gender}</p>
      <Link
        href={`/admin/walk-in?name=${encodeURIComponent(user.name ?? '')}&phone=${user.phone ?? ''}&gender=${user.gender ?? ''}`}
        className="inline-block bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        Book Service
      </Link>
      <h2 className="text-2xl font-semibold mb-2">Service History</h2>
      <ul className="space-y-2">
        {history.map((h: any) => (
          <li key={h.id} className="border-b pb-2">
            <span className="font-medium">{h.service}</span> - {h.variant} on{' '}
            {new Date(h.scheduledAt).toLocaleDateString()}
          </li>
        ))}
        {history.length === 0 && <li>No history found.</li>}
      </ul>
    </div>
  )
}
