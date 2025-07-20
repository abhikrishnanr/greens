'use client'
import { useEffect, useState } from 'react'

interface Booking {
  id: string
  date: string | null
  preferredDate: string | null
  status: string
  paid: boolean
  service: { name: string }
  branch: { name: string }
  user: { name: string }
  staff?: { name: string } | null
  invoiceUrl?: string
}

export default function AppointmentPage() {
  const [bookings, setBookings] = useState<Booking[]>([])

  const load = async () => {
    const res = await fetch('/api/bookings')
    const data = await res.json()
    if (data.success) setBookings(data.bookings)
  }

  useEffect(() => { load() }, [])

  const update = async (id: string, status: string, date?: string, paid?: boolean) => {
    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, paid, date: date ? new Date(date) : undefined }),
    })
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-700">Appointment Requests</h1>
        <a href="/admin/appointments/new" className="bg-green-600 text-white px-3 py-1 rounded">New</a>
      </div>
      <table className="w-full text-sm text-left bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Preferred Date</th>
            <th className="px-3 py-2">Scheduled Time</th>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Service</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Paid</th>
            <th className="px-3 py-2">Invoice</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} className="border-t">
              <td className="px-3 py-2">{b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : '—'}</td>
              <td className="px-3 py-2">
                <input
                  type="datetime-local"
                  className="p-1 border rounded"
                  value={b.date ? b.date.slice(0,16) : ''}
                  onChange={e => update(b.id, 'confirmed', e.target.value)}
                />
              </td>
              <td className="px-3 py-2">{b.user?.name || '—'}</td>
              <td className="px-3 py-2">{b.service.name}</td>
              <td>
                <select
                  className="p-1 rounded border"
                  value={b.status}
                  onChange={e => update(b.id, e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
              <td className="px-3 py-2">
                {b.paid ? 'Yes' : (
                  <button className="text-sm text-green-700 underline" onClick={() => update(b.id, b.status, undefined, true)}>
                    Mark Paid
                  </button>
                )}
              </td>
              <td className="px-3 py-2">
                {b.invoiceUrl && (
                  <a href={b.invoiceUrl} target="_blank" className="text-blue-600 underline">Download</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
