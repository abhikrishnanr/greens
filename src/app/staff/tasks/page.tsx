'use client'
import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

interface Booking {
  id: string
  preferredDate: string | null
  date: string | null
  status: string
  service: { name: string }
  branch: { name: string }
  user: { name: string }
}

export default function StaffTasks() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') signIn()
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return
    fetch(`/api/bookings?staffId=${session.user.id}`)
      .then(r => r.json())
      .then(d => d.success && setBookings(d.bookings))
  }, [status, session])

  const complete = async(id: string) => {
    await fetch('/api/bookings', {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, status:'completed' })
    })
    setBookings(b => b.filter(x => x.id !== id))
  }

  return (
    <div className="p-4">
      <Toaster richColors position="top-center" />
      <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
      <table className="w-full text-sm text-left bg-white rounded shadow border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2">Preferred</th>
            <th className="px-3 py-2">Scheduled</th>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Service</th>
            <th className="px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id} className="border-t">
              <td className="px-3 py-2">{b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : '—'}</td>
              <td className="px-3 py-2">{b.date ? new Date(b.date).toLocaleString() : '—'}</td>
              <td className="px-3 py-2">{b.user.name}</td>
              <td className="px-3 py-2">{b.service.name}</td>
              <td className="px-3 py-2">
                {b.status !== 'completed' && (
                  <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => complete(b.id)}>Done</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
