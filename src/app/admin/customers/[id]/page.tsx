import Link from 'next/link'

interface BookingHistory { id: string; date: string; start: string; items: { name: string }[] }
interface BillingHistory { id: string; service: string; variant: string; scheduledAt: string; amountAfter: number }
interface User { id: string; name: string | null; phone: string | null; email?: string | null; gender?: string | null }

export default async function CustomerProfile({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const apiUrl = new URL(`/api/customers/${id}`, base)
  const res = await fetch(apiUrl, { cache: 'no-store' })
  if (res.status === 404) {
    return <div className="p-6 text-red-500">Customer not found</div>
  }
  if (!res.ok) {
    return <div className="p-6 text-red-500">Failed to load customer</div>
  }
  const { user, billingHistory, scheduleHistory } = (await res.json()) as {
    user: User | null
    billingHistory: BillingHistory[]
    scheduleHistory: BookingHistory[]
  }
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
      <h2 className="text-2xl font-semibold mb-2">Schedule History</h2>
      <ul className="space-y-2 mb-6">
        {scheduleHistory.map(b => (
          <li key={b.id} className="border-b pb-2">
            {b.date} at {b.start} - {b.items.map(i => i.name).join(', ')}
          </li>
        ))}
        {scheduleHistory.length === 0 && <li>No schedule history found.</li>}
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Billing History</h2>
      <ul className="space-y-2">
        {billingHistory.map(h => (
          <li key={h.id} className="border-b pb-2">
            <span className="font-medium">{h.service}</span> - {h.variant} on{' '}
            {new Date(h.scheduledAt).toLocaleDateString()} for ₹{h.amountAfter}
          </li>
        ))}
        {billingHistory.length === 0 && <li>No billing history found.</li>}
      </ul>
    </div>
  )
}
