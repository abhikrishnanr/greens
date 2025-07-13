'use client'
import { useEffect, useState } from 'react'

interface Booking {
  id: string
  date: string
  status: string
  service: { name: string }
  branch: { name: string }
  user: { name: string }
  staff?: { name: string } | null
}

export default function AppointmentPage() {
  const [bookings, setBookings] = useState<Booking[]>([])

  const load = async () => {
    const res = await fetch('/api/bookings')
    const data = await res.json()
    if (data.success) setBookings(data.bookings)
  }

  useEffect(() => { load() }, [])

  const update = async (id: string, status: string) => {
    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Appointment Requests</h1>
      <table className="w-full text-sm text-left bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Service</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} className="border-t">
              <td className="px-3 py-2">{new Date(b.date).toLocaleString()}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
