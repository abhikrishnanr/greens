'use client'
import { useEffect, useState } from 'react'

interface Booking {
  id: string
  date: string
  user: { name: string }
  service: { name: string }
  branch: { id: string; name: string }
  staffId: string | null
}
interface Staff { id: string; name: string }
interface Branch { id: string; name: string }

export default function SchedulingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [branch, setBranch] = useState<string>('')

  useEffect(() => {
    fetch('/api/branch').then(r => r.json()).then(d => d.success && setBranches(d.branches))
  }, [])

  useEffect(() => {
    if (!branch) return
    fetch(`/api/bookings?status=confirmed&branchId=${branch}`)
      .then(r => r.json())
      .then(d => d.success && setBookings(d.bookings.filter((b: Booking) => !b.staffId)))
    fetch(`/api/staff?branchId=${branch}`).then(r => r.json()).then(d => d.success && setStaff(d.staff))
  }, [branch])

  const assign = async (bookingId: string, staffId: string) => {
    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bookingId, staffId }),
    })
    setBookings(b => b.filter(it => it.id !== bookingId))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Schedule Appointments</h1>
      <select className="bg-gray-800 p-2 rounded mb-4" value={branch} onChange={e => setBranch(e.target.value)}>
        <option value="">Select branch</option>
        {branches.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      {bookings.length > 0 && (
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Assign</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t border-gray-700">
                <td>{new Date(b.date).toLocaleString()}</td>
                <td>{b.user.name}</td>
                <td>{b.service.name}</td>
                <td>
                  <select className="bg-gray-800 p-1 rounded" onChange={e => assign(b.id, e.target.value)}>
                    <option value="">Select staff</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
